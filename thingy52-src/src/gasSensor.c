#include "gasSensor.h"
#include <zephyr/drivers/sensor/ccs811.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <stdint.h>

const struct device *const ccs811 = DEVICE_DT_GET_ONE(ams_ccs811);

int initGasSensor() {
    return !device_is_ready(ccs811);
}

float getGasValue() {
    int err = 0;
    struct sensor_value co2, tvoc, voltage, current;
    // const struct ccs811_result_type *result = ccs811_result(dev);

    err = sensor_sample_fetch(ccs811);
    if(err != 0){
        printk("Error on sample fetching data from ccs811: %d\n", err);
        return -1;
    }

    sensor_channel_get(ccs811, SENSOR_CHAN_CO2, &co2);
    sensor_channel_get(ccs811, SENSOR_CHAN_VOC, &tvoc);
    sensor_channel_get(ccs811, SENSOR_CHAN_VOLTAGE, &voltage);
    sensor_channel_get(ccs811, SENSOR_CHAN_CURRENT, &current);
    float co2Value = (float) sensor_value_to_double(&co2);
    return co2Value;
}