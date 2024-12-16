/*
  Optical SP02 Detection (SPK Algorithm) using the MAX30105 Breakout
  By: Nathan Seidle @ SparkFun Electronics
  Date: October 19th, 2016
  https://github.com/sparkfun/MAX30105_Breakout

  This demo shows heart rate and SPO2 levels.

  It is best to attach the sensor to your finger using a rubber band or other tightening 
  device. Humans are generally bad at applying constant pressure to a thing. When you 
  press your finger against the sensor it varies enough to cause the blood in your 
  finger to flow differently which causes the sensor readings to go wonky.

  This example is based on MAXREFDES117 and RD117_LILYPAD.ino from Maxim. Their example
  was modified to work with the SparkFun MAX30105 library and to compile under Arduino 1.6.11
  Please see license file for more info.

  Hardware Connections (Breakoutboard to Arduino):
  -5V = 5V (3.3V is allowed)
  -GND = GND
  -SDA = A4 (or SDA)
  -SCL = A5 (or SCL)
  -INT = Not connected
 
  The MAX30105 Breakout can handle 5V or 3.3V I2C logic. We recommend powering the board with 5V
  but it will also run at 3.3V.
*/
SYSTEM_THREAD(ENABLED);
#include <Wire.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"
#include "heartRate.h"
MAX30105 particleSensor;

#define MAX_BRIGHTNESS 255
const int MEASURE_INTERVAL = 1800 * 1000; // 30 minutes default (in milliseconds)
const int PROMPT_TIMEOUT = 5 * 60 * 1000; // 5 minutes timeout for measurement
// Default start and end times for measurements (24-hour format)
int startHour = 6;  // 6:00 AM
int startMinute = 0;
int endHour = 22;   // 10:00 PM
int endMinute = 0;
// Time Range (default 6:00 AM - 10:00 PM)
int startTime = 06; // 6:00 AM
int endTime = 22;  // 10:00 PM
void handle(const char *event, const char *data){

}

enum State { IDLE, PROMPTING, RECORDING, SUBMITTING };  //state machine
State currentState = IDLE;

uint32_t irBuffer[100]; //infrared LED sensor data
uint32_t redBuffer[100];  //red LED sensor data

int32_t bufferLength; //data length
int32_t spo2; //SPO2 value
int8_t validSPO2; //indicator to show if the SPO2 calculation is valid
int32_t heartRate; //heart rate value
int8_t validHeartRate; //indicator to show if the heart rate calculation is valid

int LED = D7;  // The on-board LED
float IRvalue = 0;
unsigned long lastMeasurementTime = 0;
String dataSend;

std::vector<String> dataBuffer; // Buffer for offline data

// Function Prototypes
void idleState();
void promptMeasurement();
void recordData();
void submitData();
void sendDataToServer(String Send_Data);

void setup()
{
  Serial.begin(9800); // initialize serial communication at 115200 bits per second:
    Serial.println("Initializing...");
    pinMode(LED, OUTPUT);
    RGB.control(true);  // take control of the RGB LED
    
    //subscriptions to Particle Webhooks
    Particle.subscribe("hook-response/bpm", handle, MY_DEVICES);
  // Initialize sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) //Use default I2C port, 400kHz speed
  {
    Serial.println(F("MAX30105 was not found. Please check wiring/power."));
    while (1);
  }

  byte ledBrightness = 60; //Options: 0=Off to 255=50mA
  byte sampleAverage = 4; //Options: 1, 2, 4, 8, 16, 32
  byte ledMode = 2; //Options: 1 = Red only, 2 = Red + IR, 3 = Red + IR + Green
  byte sampleRate = 100; //Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
  int pulseWidth = 411; //Options: 69, 118, 215, 411
  int adcRange = 4096; //Options: 2048, 4096, 8192, 16384

  particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange); //Configure sensor with these settings
}

void loop() {
    switch (currentState) {
        case IDLE:
            idleState();
            break;
        case PROMPTING:
            promptMeasurement();
            break;
        case RECORDING:
            recordData();
            break;
        case SUBMITTING:
            submitData();
            break;
    }
}

void idleState() {
    // Get the current time
    int currentHour = Time.hour();
    int currentMinute = Time.minute();

    // Check if the time is within the range
    if ((currentHour > startHour || (currentHour == startHour && currentMinute >= startMinute)) &&
        (currentHour < endHour || (currentHour == endHour && currentMinute < endMinute))) {
            
        String timeString = Time.timeStr().c_str();
        if ((timeString.substring(11, 12) >= String(startTime)) && (timeString.substring(11, 12) <= String(endTime))){  //check in 30 minutes
            if (millis() - lastMeasurementTime >= MEASURE_INTERVAL) {
            currentState = PROMPTING;
            }
        }
    }
}

void promptMeasurement() {
    RGB.color(0, 0, 255); //set color blue
    RGB.control(true);
    unsigned long startTime = millis();
    while (millis() - startTime < PROMPT_TIMEOUT) {
        if (userTakesMeasurement()) {
            RGB.control(false);
            currentState = RECORDING;
            return;
        }
    }
    RGB.control(false);
    currentState = IDLE;
}

void recordData() { //--------------------------------------------------------------------
    maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);

    String dataSend = "{\"heartRate\": heartRate, \"oxygenSaturation\": spo2, \"timestamp\": Time.now().c_str()}";

    if (WiFi.ready()) {
        currentState = SUBMITTING;
    } else {
        dataBuffer.push_back(dataSend);
        RGB.color(255, 255, 0); //set color yellow
        RGB.control(true);
        delay(500);
        RGB.control(false);
        currentState = IDLE;
    }
}

void submitData() {//----------------------------------------------------------------------------------
    if (!dataBuffer.empty()) {
        String dataSend = dataBuffer.front();
        sendDataToServer(dataSend);
        dataBuffer.erase(dataBuffer.begin());
    }
    currentState = IDLE;
    lastMeasurementTime = millis();
}

void sendDataToServer(String Send_Data) {

    Particle.publish("Activity14", Send_Data, PRIVATE);
}

bool userTakesMeasurement() {// check IRvalue---------------------------------------- 
    bufferLength = 100; //buffer length of 100 stores 4 seconds of samples running at 25sps
    for (byte i = 0 ; i < bufferLength ; i++)
    {
    while (particleSensor.available() == false) //do we have new data?
      particleSensor.check(); //Check the sensor for new data

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample(); //We're finished with this sample so move to next sample
    }
    //dumping the first 10 sets of samples in the memory and shift the last 90 sets of samples to the top
    for (byte i = 10; i < 100; i++)
    {
      redBuffer[i - 10] = redBuffer[i];
      irBuffer[i - 10] = irBuffer[i];
    }
    //take 10 sets of samples before calculating the heart rate.
    for (byte i = 90; i < 100; i++)
    {
      while (particleSensor.available() == false) //do we have new data?
        particleSensor.check(); //Check the sensor for new data
        
      redBuffer[i] = particleSensor.getRed();
      irBuffer[i] = particleSensor.getIR();
      particleSensor.nextSample(); //We're finished with this sample so move to next sample
    } 
    IRvalue = particleSensor.getIR();
    if(IRvalue > 50000) {
        return true;
    }
    return false;
}


