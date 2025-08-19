# main.py (Versión Final Profesional)
import sys
import time
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QGridLayout, QFrame, QGraphicsDropShadowEffect
)
from PySide6.QtCore import QTimer, QThread, Signal, Slot, Qt
from PySide6.QtGui import QFont, QColor

from plc_reader import PLCReader
import settings
from config.config import websocket_url
from services.websocket_manager import WebSocketManager
import services.shared as shared

class PLCWorker(QThread):
    data_ready = Signal(list)
    connection_status_changed = Signal(bool, str)

    def __init__(self, plc_reader_instance):
        super().__init__()
        self.plc_reader = plc_reader_instance
        self.running = True
        self.read_interval = 1

    def run(self):
        while self.running:
            if not self.plc_reader.is_connected:
                self.connection_status_changed.emit(False, "Intentando conectar al PLC...")
                if not self.plc_reader.connect():
                    self.connection_status_changed.emit(False, f"Desconectado (Reintento en {self.plc_reader.reconnect_interval}s)")
                    time.sleep(self.plc_reader.reconnect_interval)
                    continue
                else:
                    self.connection_status_changed.emit(True, "Conectado al PLC")

            temps = self.plc_reader.read_temperatures()

            if temps is not None:
                self.data_ready.emit(temps)
            else:
                self.connection_status_changed.emit(False, "Conexión PLC perdida")
                
            time.sleep(self.read_interval)

    def stop(self):
        self.running = False
        self.plc_reader.disconnect()
        self.wait()

class MainAppWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Sistema de Monitoreo de Temperaturas PLC")
        self.showMaximized()
        
        self.plc_ip = settings.PLC_IP
        
        self.ws_manager = WebSocketManager(websocket_url)
        self.ws_manager.start()

        self.plc_reader = PLCReader(self.plc_ip,
                                     settings.RACK,
                                     settings.SLOT,
                                     settings.DB_NUMBER,
                                     settings.DB_SIZE)
        
        self.setup_ui()
        self.setup_plc_worker()

    def setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(30, 20, 30, 20)
        main_layout.setSpacing(25)
        central_widget.setStyleSheet("background-color: #F8F9FA;")

        app_title = QLabel("Monitoreo de Temperaturas PLC")
        app_title.setFont(QFont("Segoe UI", 38, QFont.Bold))
        app_title.setStyleSheet("color: #212529;")
        main_layout.addWidget(app_title, alignment=Qt.AlignCenter)

        status_container = QHBoxLayout()
        status_container.addStretch()
        status_label_prefix = QLabel("Estado PLC:")
        status_label_prefix.setFont(QFont("Segoe UI", 16))
        status_label_prefix.setStyleSheet("color: #495057;")
        status_container.addWidget(status_label_prefix)
        self.connection_status_label = QLabel("Inicializando...")
        self.connection_status_label.setFont(QFont("Segoe UI", 16, QFont.Bold))
        self.connection_status_label.setStyleSheet("color: #6C757D;")
        status_container.addWidget(self.connection_status_label)
        status_container.addStretch()
        main_layout.addLayout(status_container)

        temperatures_grid = QGridLayout()
        temperatures_grid.setSpacing(25)
        temperatures_grid.setContentsMargins(10, 10, 10, 10)
        self.temperature_labels = {}

        for i, (equipment_name, info) in enumerate(settings.EQUIPMENT_MAP.items()):
            row, col = i // 4, i % 4

            frame = QFrame()
            frame.setFixedSize(260, 170)
            frame.setStyleSheet("""
                QFrame {
                    background-color: #FFFFFF;
                    border-radius: 12px;
                }
            """)
            
            # --- CAMBIO CLAVE: Efecto de sombra para un look profesional ---
            shadow = QGraphicsDropShadowEffect()
            shadow.setBlurRadius(20)
            shadow.setColor(QColor(0, 0, 0, 40))
            shadow.setOffset(0, 4)
            frame.setGraphicsEffect(shadow)
            
            frame_layout = QVBoxLayout(frame)
            frame_layout.setContentsMargins(15, 15, 15, 15)
            frame_layout.setSpacing(5)

            title_label = QLabel(equipment_name)
            title_label.setFont(QFont("Segoe UI", 16, QFont.Weight.DemiBold))
            title_label.setStyleSheet("color: #343A40;")
            frame_layout.addWidget(title_label, 0, Qt.AlignCenter | Qt.AlignTop)
            
            frame_layout.addStretch(1)

            temp_layout = QHBoxLayout()
            temp_layout.setAlignment(Qt.AlignCenter)

            value_label = QLabel("---")
            # --- CAMBIO CLAVE: Tamaño de fuente ajustado para evitar recortes ---
            value_label.setFont(QFont("Segoe UI", 42, QFont.Bold))
            value_label.setStyleSheet("color: #6C757D;")
            self.temperature_labels[equipment_name] = value_label

            unit_label = QLabel("°C")
            unit_label.setFont(QFont("Segoe UI", 22))
            unit_label.setStyleSheet("color: #495057; padding-bottom: 5px;")

            temp_layout.addStretch(1)
            temp_layout.addWidget(value_label)
            temp_layout.addWidget(unit_label)
            temp_layout.addStretch(1)
            
            frame_layout.addLayout(temp_layout)
            frame_layout.addStretch(2)
            
            temperatures_grid.addWidget(frame, row, col, alignment=Qt.AlignCenter)

        grid_container = QWidget()
        grid_container.setLayout(temperatures_grid)
        main_layout.addWidget(grid_container)
        main_layout.addStretch()

    def setup_plc_worker(self):
        self.plc_worker = PLCWorker(self.plc_reader)
        self.plc_worker.data_ready.connect(self.process_incoming_data)
        self.plc_worker.connection_status_changed.connect(self.update_connection_status)
        self.plc_worker.start()

    @Slot(list)
    def process_incoming_data(self, readings):
        data_for_websocket = []

        for data in readings:
            equipo = data['equipo']
            is_connected = data['conectado']
            temp_value = data['temperatura']
            
            label_to_update = self.temperature_labels.get(equipo)
            if not label_to_update:
                continue

            if is_connected and temp_value is not None:
                label_to_update.setText(f"{temp_value:.1f}")
                
                # --- CAMBIO CLAVE: Lógica de 3 colores para la temperatura ---
                if temp_value > 750:
                    label_to_update.setStyleSheet("color: #DC3545;") # Rojo (Alerta)
                elif temp_value >= 700:
                    label_to_update.setStyleSheet("color: #28A745;") # Verde (Óptimo)
                else:
                    label_to_update.setStyleSheet("color: #0D6EFD;") # Azul (Bajo)

                data_for_websocket.append({
                    'nombre': equipo,
                    'temperatura': temp_value,
                    'estado': 'conectado'
                })
            else:
                label_to_update.setText("---")
                label_to_update.setStyleSheet("color: #6C757D;") # Gris (Desconectado)
        
        if data_for_websocket:
            shared.data_queue.put({"type": "temperatures", "data": data_for_websocket})

    @Slot(bool, str)
    def update_connection_status(self, is_connected, message):
        self.connection_status_label.setText(message)
        color = "#28A745" if is_connected else "#DC3545"
        self.connection_status_label.setStyleSheet(f"color: {color}; font-size: 16px; font-weight: bold;")
        
        if not is_connected:
            for label in self.temperature_labels.values():
                label.setText("---")
                label.setStyleSheet("color: #6C757D;")

    def closeEvent(self, event):
        self.plc_worker.stop()
        self.ws_manager.stop()
        event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainAppWindow()
    window.show()
    sys.exit(app.exec())