# login_dialog.py
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QPushButton, QMessageBox
)
from PySide6.QtCore import Qt

class LoginDialog(QDialog):
    def __init__(self, parent=None, username="", password=""):
        super().__init__(parent)
        self.setWindowTitle("Iniciar Sesión")
        self.setFixedSize(300, 150) # Tamaño fijo para el diálogo
        self.setWindowFlag(Qt.WindowContextHelpButtonHint, False) # Quitar botón de ayuda
        self.setModal(True) # Hacerlo modal (bloquea la ventana principal)

        self.username = username
        self.password = password
        self.login_successful = False

        self.setup_ui()

    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        layout.setContentsMargins(20, 20, 20, 20)

        # Campo de Usuario
        user_layout = QHBoxLayout()
        user_layout.addWidget(QLabel("Usuario:"))
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Ingrese usuario")
        user_layout.addWidget(self.username_input)
        layout.addLayout(user_layout)

        # Campo de Contraseña
        pass_layout = QHBoxLayout()
        pass_layout.addWidget(QLabel("Contraseña:"))
        self.password_input = QLineEdit()
        self.password_input.setEchoMode(QLineEdit.Password) # Ocultar texto
        self.password_input.setPlaceholderText("Ingrese contraseña")
        pass_layout.addWidget(self.password_input)
        layout.addLayout(pass_layout)

        # Botones
        button_layout = QHBoxLayout()
        self.login_button = QPushButton("Iniciar Sesión")
        self.login_button.clicked.connect(self.check_login)
        self.login_button.setDefault(True) # Enter key triggers this button
        button_layout.addWidget(self.login_button)

        self.cancel_button = QPushButton("Cancelar")
        self.cancel_button.clicked.connect(self.reject) # Rechaza el diálogo
        button_layout.addWidget(self.cancel_button)
        layout.addLayout(button_layout)

        # Conectar la señal returnPressed para ambos QLineEdit
        self.username_input.returnPressed.connect(self.check_login)
        self.password_input.returnPressed.connect(self.check_login)

    def check_login(self):
        entered_username = self.username_input.text()
        entered_password = self.password_input.text()

        if entered_username == self.username and entered_password == self.password:
            self.login_successful = True
            self.accept() # Acepta el diálogo y lo cierra
        else:
            QMessageBox.warning(self, "Error de Inicio de Sesión", "Usuario o contraseña incorrectos.")
            self.username_input.clear()
            self.password_input.clear()
            self.username_input.setFocus() # Vuelve a poner el foco en el usuario