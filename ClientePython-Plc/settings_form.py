# settings_form.py

import json
import os
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QPushButton,
    QMessageBox, QScrollArea, QWidget, QGridLayout
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont

import settings # Importamos el módulo de settings

class SettingsForm(QDialog):
    # Señal para indicar que los ajustes han sido guardados y deben ser recargados
    settings_saved = Signal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Configuración del Sistema")
        self.setFixedSize(600, 500) # Tamaño fijo para el formulario
        self.setStyleSheet("background-color: #ECF0F1; color: black;")

        self.original_settings = self.load_current_settings()
        self.current_settings = self.original_settings.copy()

        self.setup_ui()

    def load_current_settings(self):
        """Carga los ajustes actuales, priorizando JSON sobre .py."""
        loaded_settings = {}
        try:
            with open(settings.SETTINGS_FILE_PATH, 'r') as f:
                json_data = json.load(f)
                loaded_settings['PLC_IP'] = json_data.get('PLC_IP', settings.PLC_IP)
                loaded_settings['TERMOPAR_NAMES'] = json_data.get('TERMOPAR_NAMES', settings.TERMOPAR_NAMES)
                # Asegurarse de que TERMOPAR_NAMES tenga el tamaño correcto si viene de JSON y es más corto
                if len(loaded_settings['TERMOPAR_NAMES']) < 9:
                    # Rellenar con los nombres por defecto si la lista JSON es incompleta
                    for i in range(len(loaded_settings['TERMOPAR_NAMES']), 9):
                        loaded_settings['TERMOPAR_NAMES'].append(settings.TERMOPAR_NAMES[i] if i < len(settings.TERMOPAR_NAMES) else f"Termopar {i}")

        except (FileNotFoundError, json.JSONDecodeError):
            # Si no hay JSON o está corrupto, usa los valores por defecto de settings.py
            loaded_settings['PLC_IP'] = settings.PLC_IP
            loaded_settings['TERMOPAR_NAMES'] = settings.TERMOPAR_NAMES.copy() # Hacer una copia para no modificar el original
        return loaded_settings

    def setup_ui(self):
        """Configura la interfaz de usuario del formulario."""
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(15)

        title = QLabel("Ajustes del Sistema")
        title.setFont(QFont("Arial", 20, QFont.Bold))
        title.setStyleSheet("color: #2C3E50;")
        title.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(title)

        # Sección para la IP del PLC
        ip_layout = QHBoxLayout()
        ip_label = QLabel("IP del PLC:")
        ip_label.setFont(QFont("Arial", 12))
        self.ip_input = QLineEdit(self.current_settings['PLC_IP'])
        self.ip_input.setFont(QFont("Arial", 12))
        self.ip_input.setStyleSheet("background-color: white; border: 1px solid #BDC3C7; padding: 5px; border-radius: 5px;")
        ip_layout.addWidget(ip_label)
        ip_layout.addWidget(self.ip_input)
        main_layout.addLayout(ip_layout)

        # Sección para los nombres de los termopares (con ScrollArea)
        termopares_group_label = QLabel("Nombres de los Equipos:")
        termopares_group_label.setFont(QFont("Arial", 14, QFont.DemiBold))
        termopares_group_label.setStyleSheet("color: #2C3E50;")
        main_layout.addWidget(termopares_group_label)

        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area_content = QWidget()
        scroll_area_content.setStyleSheet("background-color: white; border-radius: 5px; border: 1px solid #BDC3C7;")
        scroll_area.setWidget(scroll_area_content)

        grid_layout = QGridLayout(scroll_area_content)
        grid_layout.setContentsMargins(10, 10, 10, 10)
        grid_layout.setSpacing(10)
        self.termopar_name_inputs = {}

        for i in range(1, 9): # Termopares del 1 al 8
            label = QLabel(f"Termopar {i}:")
            label.setFont(QFont("Arial", 11))
            label.setStyleSheet("color: #34495E;")
            line_edit = QLineEdit(self.current_settings['TERMOPAR_NAMES'][i])
            line_edit.setFont(QFont("Arial", 11))
            line_edit.setStyleSheet("border: 1px solid #BDC3C7; padding: 4px; border-radius: 3px;")
            self.termopar_name_inputs[i] = line_edit

            grid_layout.addWidget(label, i - 1, 0)
            grid_layout.addWidget(line_edit, i - 1, 1)

        main_layout.addWidget(scroll_area)

        # Botones de acción
        buttons_layout = QHBoxLayout()
        buttons_layout.addStretch()

        save_button = QPushButton("Guardar Ajustes")
        save_button.setFont(QFont("Arial", 12, QFont.DemiBold))
        save_button.setStyleSheet(
            "QPushButton { background-color: #2ECC71; color: white; border-radius: 8px; padding: 10px 20px; }"
            "QPushButton:hover { background-color: #27AE60; }"
        )
        save_button.clicked.connect(self.save_settings)
        buttons_layout.addWidget(save_button)

        cancel_button = QPushButton("Cancelar")
        cancel_button.setFont(QFont("Arial", 12, QFont.DemiBold))
        cancel_button.setStyleSheet(
            "QPushButton { background-color: #E74C3C; color: white; border-radius: 8px; padding: 10px 20px; }"
            "QPushButton:hover { background-color: #C0392B; }"
        )
        cancel_button.clicked.connect(self.reject) # reject cierra el diálogo con un resultado QDialog.Rejected
        buttons_layout.addWidget(cancel_button)

        buttons_layout.addStretch()
        main_layout.addLayout(buttons_layout)

    def save_settings(self):
        """Guarda los ajustes actuales en settings.json."""
        new_ip = self.ip_input.text().strip()
        # Validación simple de IP (puedes hacerla más robusta si es necesario)
        if not new_ip:
            QMessageBox.warning(self, "Error de Validación", "La dirección IP del PLC no puede estar vacía.")
            return

        new_termopar_names = ["N/A"] # El índice 0 permanece sin usar
        for i in range(1, 9):
            name = self.termopar_name_inputs[i].text().strip()
            if not name:
                QMessageBox.warning(self, "Error de Validación", f"El nombre del Termopar {i} no puede estar vacío. Por favor, ingrese un nombre.")
                return
            new_termopar_names.append(name)

        # Actualizar los ajustes en memoria
        self.current_settings['PLC_IP'] = new_ip
        self.current_settings['TERMOPAR_NAMES'] = new_termopar_names

        # Comparar con los ajustes originales para ver si hay cambios reales
        if self.current_settings == self.original_settings:
            QMessageBox.information(self, "Ajustes", "No se detectaron cambios. No se guardó nada.")
            self.accept() # Cierra el diálogo sin emitir señal de cambio
            return

        # Guardar en el archivo JSON
        try:
            with open(settings.SETTINGS_FILE_PATH, 'w') as f:
                json.dump(self.current_settings, f, indent=4)
            QMessageBox.information(self, "Ajustes Guardados", "Los ajustes se han guardado correctamente.")
            self.settings_saved.emit() # Emitir señal de que los ajustes se han guardado
            self.accept() # Cierra el diálogo con un resultado QDialog.Accepted
        except Exception as e:
            QMessageBox.critical(self, "Error al Guardar", f"No se pudieron guardar los ajustes: {e}")