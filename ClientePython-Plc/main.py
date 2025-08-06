# main.py (Código completo y actualizado para JSON consolidado)
import sys
import time
import math
import json
import os

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QGridLayout, QMessageBox, QFrame, QScrollArea,
    QSizePolicy
)
from PySide6.QtCore import QTimer, QThread, Signal, Slot, Qt, QSize
from PySide6.QtGui import QFont, QColor, QPixmap, QIcon

from plc_reader import PLCReader
import settings
from settings_form import SettingsForm

from config.config import websocket_url
from services.websocket_manager import WebSocketManager
import services.shared as shared

class PLCWorker(QThread):
    data_ready = Signal(list)
    connection_status_changed = Signal(bool, str)
    error_occurred = Signal(str)

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
                    self.connection_status_changed.emit(False, f"Desconectado (Reintentando en {self.plc_reader.reconnect_interval}s)")
                    time.sleep(self.plc_reader.reconnect_interval)
                    continue
                else:
                    self.connection_status_changed.emit(True, "Conectado al PLC")

            temps = self.plc_reader.read_temperatures()

            if temps:
                self.data_ready.emit(temps)
            else:
                if self.plc_reader.is_connected:
                    self.connection_status_changed.emit(False, "Conexión PLC perdida durante lectura")
                    self.error_occurred.emit("Fallo en la lectura de datos del PLC. Reconectando...")
                else:
                    self.connection_status_changed.emit(False, "PLC desconectado o error de lectura inicial")
                    self.error_occurred.emit("PLC no conectado o error inicial de lectura. Reintentando...")

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

        self.current_app_settings = self.load_app_settings()

        self.ws_manager = WebSocketManager(websocket_url)
        self.ws_manager.start()

        self.plc_reader = PLCReader(self.current_app_settings['PLC_IP'],
                                     settings.RACK,
                                     settings.SLOT,
                                     settings.DB_NUMBER,
                                     settings.DB_SIZE)

        self.notifications = []
        self.last_notification_time = 0
        self.min_notification_interval = 5

        self.stabilization_timers = {i: 0 for i in range(1, 9)}
        self.last_connected_status = {i: False for i in range(1, 9)}

        self.setup_ui()
        self.setup_plc_worker()

        QTimer.singleShot(0, self.set_initial_window_size)

    def load_app_settings(self):
        loaded_settings = {}
        try:
            os.makedirs(os.path.dirname(settings.SETTINGS_FILE_PATH), exist_ok=True)
            
            with open(settings.SETTINGS_FILE_PATH, 'r') as f:
                json_data = json.load(f)
                loaded_settings['PLC_IP'] = json_data.get('PLC_IP', settings.PLC_IP)
                
                json_termopar_names = json_data.get('TERMOPAR_NAMES', [])
                if not isinstance(json_termopar_names, list):
                    json_termopar_names = []

                loaded_settings['TERMOPAR_NAMES'] = settings.TERMOPAR_NAMES[:] 
                for i, name in enumerate(json_termopar_names):
                    if i < len(loaded_settings['TERMOPAR_NAMES']):
                        loaded_settings['TERMOPAR_NAMES'][i] = name
                    else:
                        loaded_settings['TERMOPAR_NAMES'].append(name)
                
                while len(loaded_settings['TERMOPAR_NAMES']) < 8:
                    loaded_settings['TERMOPAR_NAMES'].append(f"Termopar {len(loaded_settings['TERMOPAR_NAMES'])+1}")

                QMessageBox.information(self, "Configuración", "Ajustes cargados desde settings.json.")
        except (FileNotFoundError, json.JSONDecodeError) as e:
            loaded_settings['PLC_IP'] = settings.PLC_IP
            loaded_settings['TERMOPAR_NAMES'] = settings.TERMOPAR_NAMES[:]
            QMessageBox.warning(self, "Configuración", f"No se pudo cargar settings.json ({e}). Usando ajustes predeterminados de settings.py.")
        return loaded_settings

    def set_initial_window_size(self):
        self.setMinimumSize(self.size())

    def setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(20)

        central_widget.setStyleSheet("background-color: white;")

        app_title = QLabel("Monitoreo de Temperaturas PLC")
        app_title.setFont(QFont("Arial", 36, QFont.Bold))
        app_title.setStyleSheet("color: black;")
        app_title.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(app_title)

        status_notification_container = QWidget()
        status_notification_layout = QHBoxLayout(status_notification_container)
        status_notification_layout.setSpacing(30)
        status_notification_layout.setAlignment(Qt.AlignCenter)

        status_label_prefix = QLabel("Estado PLC:")
        status_label_prefix.setFont(QFont("Arial", 16, QFont.DemiBold))
        status_label_prefix.setStyleSheet("color: black;")
        status_notification_layout.addWidget(status_label_prefix)

        self.connection_status_label = QLabel("Inicializando...")
        self.connection_status_label.setFont(QFont("Arial", 16, QFont.DemiBold))
        self.connection_status_label.setStyleSheet("color: gray;")
        status_notification_layout.addWidget(self.connection_status_label)

        status_notification_layout.addStretch()

        self.notification_button = QPushButton("Mostrar Notificaciones")
        self.notification_button.setFont(QFont("Arial", 12, QFont.DemiBold))
        self.notification_button.setStyleSheet(
            "QPushButton { background-color: #E74C3C; color: white; border-radius: 8px; padding: 10px 20px; }"
            "QPushButton:hover { background-color: #C0392B; }"
        )
        self.notification_button.clicked.connect(self.show_notifications)
        status_notification_layout.addWidget(self.notification_button)

        centered_status_layout = QHBoxLayout()
        centered_status_layout.addStretch()
        centered_status_layout.addWidget(status_notification_container)
        centered_status_layout.addStretch()
        main_layout.addLayout(centered_status_layout)
        main_layout.addSpacing(20)

        temperatures_grid = QGridLayout()
        temperatures_grid.setSpacing(20)
        self.temperature_labels = {}

        FIXED_FRAME_WIDTH = 220
        FIXED_FRAME_HEIGHT = 180

        for i in range(8):
            row = i // 4
            col = i % 4
            termopar_num = i + 1

            frame = QFrame()
            frame.setObjectName(f"TermoparFrame_{termopar_num}") 
            
            frame.setFrameShape(QFrame.StyledPanel)
            frame.setFrameShadow(QFrame.Raised)
            frame.setLineWidth(1)
            frame.setStyleSheet("background-color: #ECF0F1; border: 1px solid #BDC3C7; border-radius: 10px;")
            
            frame.setFixedSize(FIXED_FRAME_WIDTH, FIXED_FRAME_HEIGHT)

            frame_layout = QVBoxLayout(frame)
            frame_layout.setAlignment(Qt.AlignCenter)
            frame_layout.setSpacing(10)

            termopar_name = self.current_app_settings['TERMOPAR_NAMES'][i]
            termopar_title = QLabel(f"{termopar_name}")
            termopar_title.setFont(QFont("Arial", 14, QFont.Weight.DemiBold))
            termopar_title.setStyleSheet("color: black;")
            termopar_title.setObjectName(f"TermoparTitleLabel_{termopar_num}")
            frame_layout.addWidget(termopar_title, alignment=Qt.AlignCenter)

            temp_value_layout = QHBoxLayout()
            temp_value_layout.setAlignment(Qt.AlignCenter)

            value_label = QLabel("---")
            value_label.setFont(QFont("Arial", 36, QFont.Bold))
            value_label.setStyleSheet("color: black;")
            self.temperature_labels[termopar_num] = value_label
            temp_value_layout.addWidget(value_label)

            unit_label = QLabel("°C")
            unit_label.setFont(QFont("Arial", 24))
            unit_label.setStyleSheet("color: black;")
            temp_value_layout.addWidget(unit_label)

            frame_layout.addLayout(temp_value_layout)
            temperatures_grid.addWidget(frame, row, col)

        grid_container = QWidget()
        grid_container.setLayout(temperatures_grid)
        grid_container.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)

        centered_grid_layout = QHBoxLayout()
        centered_grid_layout.addStretch()
        centered_grid_layout.addWidget(grid_container)
        centered_grid_layout.addStretch()

        main_layout.addLayout(centered_grid_layout)
        main_layout.addStretch()

        control_buttons_layout = QHBoxLayout()
        control_buttons_layout.setAlignment(Qt.AlignCenter)
        control_buttons_layout.setSpacing(30)

        self.settings_button = QPushButton("Ajustes")
        self.settings_button.setFont(QFont("Arial", 12, QFont.DemiBold))
        self.settings_button.setStyleSheet(
            "QPushButton { background-color: #E74C3C; color: white; border-radius: 8px; padding: 12px 25px; }"
            "QPushButton:hover { background-color: #C0392B; }"
        )
        self.settings_button.clicked.connect(self.open_settings_form)
        control_buttons_layout.addWidget(self.settings_button)

        main_layout.addLayout(control_buttons_layout)
        main_layout.addSpacing(20)

    def setup_plc_worker(self):
        if hasattr(self, 'plc_worker') and self.plc_worker.isRunning():
            self.plc_worker.stop()
            self.plc_worker.wait()
            self.plc_worker.deleteLater()
            del self.plc_worker

        self.plc_worker = PLCWorker(self.plc_reader)
        self.plc_worker.data_ready.connect(self.process_incoming_data)
        self.plc_worker.connection_status_changed.connect(self.update_connection_status)
        self.plc_worker.error_occurred.connect(self.add_notification)
        self.plc_worker.start()

    @Slot(list)
    def process_incoming_data(self, temps):
        """
        Procesa los datos recibidos (del PLC), construye un JSON consolidado
        y lo envía al WebSocket.
        """
        processed_temps_for_ui = []
        termopar_data_for_ws = [] # Esta lista contendrá los diccionarios para el JSON consolidado

        is_plc_currently_connected = self.plc_reader.is_connected
        
        if not is_plc_currently_connected:
            # Si el PLC está desconectado, envía un paquete global de estado y no procesa individuales.
            # Este paquete es diferente al de temperaturas de termopares individuales.
            ws_payload = {"type": "status", "message": "PLC no conectado"}
            shared.data_queue.put(ws_payload)
            self.update_temperature_display(temps) # Esto pone '---' en la UI
            return

        # Si el PLC está conectado, procesa cada termopar
        for i, temp_data in enumerate(temps):
            termopar_num = temp_data['termopar'] # 1-indexed
            current_connected_status = temp_data['conectado']
            current_temp = temp_data['temperatura']

            termopar_name = self.current_app_settings['TERMOPAR_NAMES'][termopar_num - 1] 

            temp_for_ui = None # Valor que se mostrará en la UI
            status_for_ws = "desconocido" # Estado por defecto para WS
            temp_value_for_ws = None # Temperatura para WS (puede ser null)

            # Lógica de estabilización
            if current_connected_status and not self.last_connected_status[termopar_num]:
                self.stabilization_timers[termopar_num] = time.time()
                self.add_notification(f"Termopar {termopar_num} ({termopar_name}) detectado (iniciando estabilización de {settings.STABILIZATION_DELAY_SECONDS}s).")
                temp_for_ui = "..."
                status_for_ws = "Estabilizando..."
                temp_value_for_ws = None # No hay valor numérico durante la estabilización
            elif current_connected_status and self.stabilization_timers[termopar_num] != 0 and \
                 (time.time() - self.stabilization_timers[termopar_num] < settings.STABILIZATION_DELAY_SECONDS):
                temp_for_ui = "..."
                status_for_ws = "Estabilizando..."
                temp_value_for_ws = None
            else:
                if self.stabilization_timers[termopar_num] != 0:
                    self.add_notification(f"Termopar {termopar_num} ({termopar_name}) estabilizado. Mostrando datos normales.")
                    self.stabilization_timers[termopar_num] = 0

                if current_connected_status:
                    temp_for_ui = f"{current_temp:.1f}" if isinstance(current_temp, (int, float)) and not math.isnan(current_temp) else "---"
                    status_for_ws = "conectado"
                    temp_value_for_ws = round(current_temp, 1) if isinstance(current_temp, (int, float)) and not math.isnan(current_temp) else None
                    
                    if isinstance(current_temp, (int, float)) and not math.isnan(current_temp) and current_temp > settings.TEMP_ALERT_THRESHOLD:
                        self.add_notification(f"🔥 ¡Alerta! Termopar {termopar_num} ({termopar_name}): {current_temp:.1f} °C (¡Demasiado alto!)")
                else:
                    temp_for_ui = "---"
                    status_for_ws = "desconectado"
                    temp_value_for_ws = None
                    # Solo añadir notificación si el estado acaba de cambiar a desconectado
                    if self.last_connected_status[termopar_num]: 
                        self.add_notification(f"⚠️ Termopar {termopar_num} ({termopar_name}) no está conectado.")
            
            # Actualizar la UI inmediatamente
            self.temperature_labels[termopar_num].setText(temp_for_ui)
            if temp_for_ui == "---" or temp_for_ui == "...":
                self.temperature_labels[termopar_num].setStyleSheet("color: black;")
            elif status_for_ws == "Estabilizando...":
                self.temperature_labels[termopar_num].setStyleSheet("color: #2980B9;")
            elif isinstance(temp_value_for_ws, (int, float)) and temp_value_for_ws > settings.TEMP_ALERT_THRESHOLD:
                self.temperature_labels[termopar_num].setStyleSheet("color: #E74C3C;")
            else:
                self.temperature_labels[termopar_num].setStyleSheet("color: black;")

            processed_temps_for_ui.append({'termopar': termopar_num, 'temperatura': temp_value_for_ws, 'conectado': current_connected_status})
            self.last_connected_status[termopar_num] = current_connected_status

            # Añadir datos al paquete consolidado para el WebSocket
            termopar_data_for_ws.append({
                'termopar': termopar_num,
                'nombre': termopar_name,
                'temperatura': temp_value_for_ws, # Será null si desconectado o estabilizando
                'estado': status_for_ws # "conectado", "desconectado", "Estabilizando..."
            })
        
        # Enviar el paquete consolidado a la cola del WebSocketManager
        # Añadimos un campo 'type' para que el servidor Node.js sepa qué tipo de mensaje es.
        shared.data_queue.put({"type": "temperatures", "data": termopar_data_for_ws})

        # No necesitamos llamar a update_temperature_display aquí porque ya actualizamos
        # las etiquetas individualmente en el bucle.
        # Solo mantener la lógica de notificaciones de termopares previamente desconectados
        # para que se remuevan si ahora están conectados.
        self.notifications = [
            n for n in self.notifications
            if not any(f"Termopar {t['termopar']} no está conectado" in n and t['estado'] == 'conectado' for t in termopar_data_for_ws)
        ]

    @Slot(bool, str)
    def update_connection_status(self, is_connected, message):
        self.connection_status_label.setText(message)
        if is_connected:
            self.connection_status_label.setStyleSheet("color: #28A745;")
            # Si el PLC se reconecta globalmente, podríamos querer enviar un mensaje de estado
            # shared.data_queue.put({"type": "status", "message": "PLC conectado"})
        else:
            self.connection_status_label.setStyleSheet("color: #E74C3C;")
            for termopar_num in self.temperature_labels:
                self.temperature_labels[termopar_num].setText("---")
                self.temperature_labels[termopar_num].setStyleSheet("color: black;")
                self.stabilization_timers[termopar_num] = 0
            # Si el PLC se desconecta globalmente, el process_incoming_data ya envía el mensaje {"type": "status", "message": "PLC no conectado"}

    @Slot(str)
    def add_notification(self, message):
        current_time = time.time()
        if self.notifications and self.notifications[-1].endswith(message) and \
           (current_time - self.last_notification_time < self.min_notification_interval):
            return

        self.notifications.append(f"{time.strftime('%H:%M:%S')} - {message}")
        if len(self.notifications) > 20:
            self.notifications.pop(0)
        self.last_notification_time = current_time

    def show_notifications(self):
        if not self.notifications:
            QMessageBox.information(self, "Notificaciones", "No hay notificaciones recientes.")
            return

        notification_text = "\n".join(self.notifications)
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        content = QWidget()
        scroll.setWidget(content)
        layout = QVBoxLayout(content)
        label = QLabel(notification_text)
        label.setWordWrap(True)
        layout.addWidget(label)
        scroll.setMinimumSize(400, 300)

        msg_box = QMessageBox(self)
        msg_box.setWindowTitle("Notificaciones del Sistema")
        msg_box.setText("<h3>Notificaciones Recientes:</h3>")
        msg_box.setInformativeText("Aquí se muestran los eventos y alertas del sistema.")
        msg_box.setIcon(QMessageBox.Information)
        msg_box.setStandardButtons(QMessageBox.Ok)
        try:
            msg_box.layout().addWidget(scroll, 0, 1)
        except Exception:
            msg_box = QMessageBox(self)
            msg_box.setWindowTitle("Notificaciones del Sistema")
            msg_box.setText("<h3>Notificaciones Recientes:</h3><br>" + notification_text)
            msg_box.setIcon(QMessageBox.Information)
            msg_box.setStandardButtons(QMessageBox.Ok)

        msg_box.exec()

    def open_settings_form(self):
        settings_dialog = SettingsForm(self)
        settings_dialog.settings_saved.connect(self.reload_ui_settings)
        settings_dialog.exec()

    @Slot()
    def reload_ui_settings(self):
        QMessageBox.information(self, "Recargar Ajustes", "Ajustes guardados. Recargando la aplicación para aplicar cambios.")
        
        self.current_app_settings = self.load_app_settings()

        self.plc_reader.ip = self.current_app_settings['PLC_IP']
        
        for i in range(8):
            termopar_num = i + 1
            termopar_name = self.current_app_settings['TERMOPAR_NAMES'][i]
            
            frame = self.centralWidget().findChild(QFrame, f"TermoparFrame_{termopar_num}") 
            
            if frame:
                termopar_title_label = frame.findChild(QLabel, f"TermoparTitleLabel_{termopar_num}") 
                if termopar_title_label:
                    termopar_title_label.setText(termopar_name)
                    termopar_title_label.setStyleSheet("color: black;")

        self.setup_plc_worker()

    def closeEvent(self, event):
        reply = QMessageBox.question(self, 'Salir', "¿Estás seguro de que quieres salir?",
                                     QMessageBox.Yes | QMessageBox.No, QMessageBox.No)
        if reply == QMessageBox.Yes:
            if hasattr(self, 'plc_worker') and self.plc_worker.isRunning():
                self.plc_worker.stop()
                self.plc_worker.wait()
            
            if hasattr(self, 'ws_manager'):
                self.ws_manager.stop()

            event.accept()
        else:
            event.ignore()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")

    window = MainAppWindow()
    window.show()
    sys.exit(app.exec())