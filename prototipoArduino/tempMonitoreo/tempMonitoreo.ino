#include <SPI.h>
#include <Ethernet.h>  
#include <Adafruit_MAX31855.h>

// Configuración del MAX31855
#define MAXDO   8
#define MAXCS   9
#define MAXCLK  10
Adafruit_MAX31855 thermocouple(MAXCLK, MAXCS, MAXDO);

// Configuración del W5500
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 0, 50);
#define W5500_CS 7  
EthernetServer server(80);

// Variables para filtro exponencial
float temperaturaFiltrada = 0;
const float alpha = 0.1;  // Coeficiente del filtro exponencial

void setup() {
  Serial.begin(9600);

  // Inicializar MAX31855
  if (!thermocouple.begin()) {
    Serial.println("ERROR: No se pudo inicializar el MAX31855.");
    while (1);
  }

  // Inicializar Ethernet
  Ethernet.init(W5500_CS);  
  Ethernet.begin(mac, ip);
  server.begin();
  Serial.print("Servidor iniciado en ");
  Serial.println(Ethernet.localIP());
}

// Función para compensar el error
float compensarTemperatura(float temperatura) {
    // Corrección basada en los datos proporcionados
    // Diferencia de 20°C a temperatura ambiente y ~100°C a 500°C
    // Se estima una compensación lineal: error ≈ 0.2 * temperatura
    float error = 0.01 * temperatura;  
    return temperatura + error;
}


void loop() {
    // Leer temperatura directamente del MAX31855
    float temperaturaLeida = thermocouple.readCelsius();
    if (isnan(temperaturaLeida)) {
        Serial.println("Error al leer el termopar.");
        return;  
    }

    // Aplicar compensación de error
    float temperaturaCompensada = compensarTemperatura(temperaturaLeida);
    Serial.print(temperaturaLeida);
    
    // Enviar la temperatura a través de Ethernet
    EthernetClient client = server.available();
    if (client) {
        Serial.println("Cliente conectado.");
        client.print(String(temperaturaLeida, 2));  
    }

    delay(1000);
}
