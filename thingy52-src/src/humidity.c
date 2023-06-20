#include "humidity.h"
#include <zephyr/drivers/sensor/ccs811.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <stdint.h>
#include <sfloat.h>

const struct device *const hts221 = DEVICE_DT_GET_ONE(st_hts221);

int initHumiditySensor(){
    return !device_is_ready(hts221);
}

int readHumiditySensor(){
    int err = sensor_sample_fetch(hts221);
    if(err != 0){
        printk("Error on sample fetching data from hts221: %d\n", err);
        return -1;
    }
    return 0;
}

uint16_t getHumidityValue(){
    struct sensor_value hum;
    sensor_channel_get(hts221, SENSOR_CHAN_HUMIDITY, &hum);
    float humValue = (float) sensor_value_to_double(&hum);
    return sfloat_from_float(humValue).val;
}

uint16_t getTemperatureValue() {
    struct sensor_value temp;
    sensor_channel_get(hts221, SENSOR_CHAN_AMBIENT_TEMP, &temp);
    float tempValue = (float) sensor_value_to_double(&temp);
    return sfloat_from_float(tempValue).val;
}