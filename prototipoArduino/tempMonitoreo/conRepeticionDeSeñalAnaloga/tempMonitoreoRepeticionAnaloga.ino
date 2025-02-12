#include <SPI.h>
#include <Ethernet.h>  // Usar Ethernet.h
#include <Adafruit_MAX31855.h>
#include <Adafruit_MCP4725.h>

// Configuración del MAX31855
#define MAXDO   8
#define MAXCS   9
#define MAXCLK  10
Adafruit_MAX31855 thermocouple(MAXCLK, MAXCS, MAXDO);

// Configuración del MCP4725
Adafruit_MCP4725 dac;

// Configuración del W5500
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 0, 50);
#define W5500_CS 7  // Pin CS personalizado para el W5500
EthernetServer server(80);

// Rango de voltaje del termopar (en mV)
#define THERMOCOUPLE_MIN_VOLTAGE 0.0    // Voltaje mínimo del termopar (0°C)
#define THERMOCOUPLE_MAX_VOLTAGE 50.0   // Voltaje máximo del termopar (ejemplo para tipo K)

// Rango de voltaje del DAC (0-5V para MCP4725)
#define DAC_REF_VOLTAGE 5.0             // Voltaje de referencia del DAC

void setup() {
  Serial.begin(9600);

  // Inicializar MAX31855
  if (!thermocouple.begin()) {
    Serial.println("ERROR: No se pudo inicializar el MAX31855.");
    while (1);
  }

  // Inicializar MCP4725
  if (!dac.begin(0x60)) {
    Serial.println("ERROR: No se pudo inicializar el MCP4725.");
    while (1);
  }

  // Inicializar Ethernet con el pin CS personalizado
  Ethernet.init(W5500_CS);  // Especificar el pin CS
  Ethernet.begin(mac, ip);
  server.begin();
  Serial.print("Servidor iniciado en ");
  Serial.println(Ethernet.localIP());
}

void loop() {
  // Leer la temperatura del termopar
  double temperature = thermocouple.readCelsius();
  if (isnan(temperature)) {
    Serial.println("Error al leer el termopar.");
    return;
  }
  Serial.print("Temperatura: ");
  Serial.println(temperature);

  // Enviar la temperatura a través de Ethernet (simulado aquí)
  EthernetClient client = server.available();
  if (client) {
    Serial.println("Cliente conectado.");
    String temperatureStr = String(temperature, 2);
    client.print(temperatureStr);
  }

  // Convertir la temperatura a un voltaje equivalente (simulación del termopar)
  double thermocoupleVoltage = temperatureToVoltage(temperature); // Convertir temperatura a mV
  Serial.print("Voltaje simulado del termopar: ");
  Serial.print(thermocoupleVoltage, 4);
  Serial.println(" mV");

  // Convertir el voltaje a un valor digital para el DAC (0-4095 para 12 bits)
  uint16_t dacValue = voltageToDACValue(thermocoupleVoltage);
  Serial.print("Valor DAC: ");
  Serial.println(dacValue);

  // Enviar el valor al DAC para generar la señal analógica
  dac.setVoltage(dacValue, false);

  delay(1000);  // Esperar 1 segundo antes de la siguiente lectura
}

// Función para convertir temperatura a voltaje (simulación del termopar)
double temperatureToVoltage(double temperature) {
  // Aproximación cuadrática para un termopar tipo K (mejor precisión)
  double voltage = 0.041276 * temperature + 0.000019 * temperature * temperature; // en mV
  return voltage;
}

// Función para convertir voltaje a valor DAC (0-4095 para 12 bits)
uint16_t voltageToDACValue(double voltage) {
  // Convertir el voltaje del termopar (en mV) a un valor de DAC
  double dacVoltage = voltage / 1000.0; // Convertir mV a V
  uint16_t dacValue = (dacVoltage / DAC_REF_VOLTAGE) * 4095.0;
  return dacValue;
}