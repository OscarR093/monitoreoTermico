# graph_window.py (CORREGIDO)
import pyqtgraph as pg
from PySide6.QtWidgets import QDialog, QVBoxLayout, QLabel
from PySide6.QtGui import QFont, QColor
from PySide6.QtCore import Qt, QTimer # QTimer ya no es necesario aquí si la actualización la maneja MainAppWindow
import time
import random # Necesario si se tuviera un simulador interno, pero no aquí

class GraphWindow(QDialog):
    def __init__(self, parent=None, num_termopares=8):
        super().__init__(parent)
        self.setWindowTitle("Gráfica de Temperaturas en Tiempo Real")
        self.setGeometry(200, 200, 1000, 600) # x, y, ancho, alto

        self.num_termopares = num_termopares
        self.temp_history = {f'termopar_{i+1}': [] for i in range(self.num_termopares)}
        self.time_history = []
        self.max_history_points = 300 # 5 minutos de datos a 1 segundo de actualización

        self.setup_ui()

    def setup_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(10, 10, 10, 10)
        main_layout.setSpacing(10)

        title_label = QLabel("Temperaturas en Tiempo Real")
        title_label.setFont(QFont("Arial", 18, QFont.Bold))
        title_label.setAlignment(Qt.AlignCenter)
        title_label.setStyleSheet("color: #333333;")
        main_layout.addWidget(title_label)

        self.graph_widget = pg.PlotWidget()
        self.graph_widget.setBackground('#F8F8F8')
        self.graph_widget.addLegend(offset=(30,30))
        self.graph_widget.showGrid(x=True, y=True)
        self.graph_widget.setLabel('left', "Temperatura (°C)", color="#555555")
        self.graph_widget.setLabel('bottom', "Tiempo", color="#555555")

        self.plot_curves = {}
        plot_colors = [
            (255, 0, 0),    # Rojo
            (0, 0, 255),    # Azul
            (0, 128, 0),    # Verde
            (255, 165, 0),  # Naranja
            (128, 0, 128),  # Púrpura
            (0, 255, 255),  # Cian
            (255, 192, 203),# Rosa
            (128, 128, 0)   # Oliva
        ]
        for i in range(self.num_termopares):
            pen = pg.mkPen(color=plot_colors[i], width=2)
            curve = self.graph_widget.plot(name=f"Termopar {i+1}", pen=pen)
            self.plot_curves[f'termopar_{i+1}'] = curve

        main_layout.addWidget(self.graph_widget)

    def update_graph_data(self, temperatures_data):
        """
        Actualiza el historial de datos y el gráfico.
        temperatures_data: list of dicts, como la salida de PLCReader.
        """
        current_time = time.time()
        self.time_history.append(current_time)

        for temp_data in temperatures_data:
            termopar_key = f'termopar_{temp_data["termopar"]}'
            if temp_data['conectado'] and temp_data['temperatura'] is not None:
                self.temp_history[termopar_key].append(temp_data['temperatura'])
            else:
                # Si el termopar no está conectado o en estabilización, añadir un valor NaN
                # para que la línea se rompa en el gráfico.
                self.temp_history[termopar_key].append(float('nan'))

        # Recortar el historial si excede el máximo
        if len(self.time_history) > self.max_history_points:
            self.time_history = self.time_history[-self.max_history_points:]
            for key in self.temp_history:
                self.temp_history[key] = self.temp_history[key][-self.max_history_points:]

        # Actualizar los datos de las curvas en el gráfico
        for i in range(self.num_termopares):
            termopar_key = f'termopar_{i+1}'
            self.plot_curves[termopar_key].setData(self.time_history, self.temp_history[termopar_key])

        # Actualizar el rango del eje X para mostrar los últimos 60 segundos
        self.graph_widget.setXRange(current_time - 60, current_time)

        # Formatear el eje X para mostrar la hora
        string_axis = pg.AxisItem(orientation='bottom')
        tick_values = self.time_history # Todos los valores de tiempo en el historial
        # Convertir timestamps a cadenas de hora legibles
        tick_strings = [time.strftime('%H:%M:%S', time.localtime(t)) for t in tick_values]
        # Asegúrate de que zip recibe listas de igual longitud.
        # Solo mostrar ticks para los puntos que realmente se están graficando
        string_axis.setTicks([list(zip(tick_values, tick_strings))])
        self.graph_widget.setAxisItems({'bottom': string_axis})

# El bloque if __name__ == "__main__": ha sido eliminado para evitar ejecución al ser importado.