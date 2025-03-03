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

void loop() {
  // Leer temperatura directamente del MAX31855
  float temperaturaLeida = thermocouple.readCelsius();
  if (isnan(temperaturaLeida)) {
    Serial.println("Error al leer el termopar.");
    return;  
  }

  Serial.println(temperaturaLeida);
  
  // Enviar la temperatura a través de Ethernet
  EthernetClient client = server.available();
  if (client) {
    Serial.println("Cliente conectado.");
    client.print(String(temperaturaLeida, 2));  
  }

  delay(1000);
}