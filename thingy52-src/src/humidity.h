#ifndef HUMIDITY_H_
#define HUMIDITY_H_

#include <stdint.h>

int initHumiditySensor();
int readHumiditySensor();

uint16_t getHumidityValue();
uint16_t getTemperatureValue();

#endif /* HUMIDITY_H_ */
