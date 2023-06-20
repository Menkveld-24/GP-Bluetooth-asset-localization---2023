#include <dk_buttons_and_leds.h>
#include <zephyr/kernel.h>
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/hci.h>
#include <zephyr/bluetooth/conn.h>
#include <string.h>
#include <zephyr/settings/settings.h>
#include <zephyr/logging/log_ctrl.h>
#include <zephyr/logging/log.h>
#include "gasSensor.h"
#include "humidity.h"
#include "battery.h"

LOG_MODULE_REGISTER(main);

#define RUN_STATUS_LED          DK_LED1
#define ADV_DONE_LED            DK_LED3
#define MANUFACTURER_ID         0x4548
#define FW_VERSION              0x01
#define ADV_INTERVAL_MS         100

bool isRunning = true;

struct advertisementStruct {
    uint16_t companyID;
    uint8_t fwVersion;
    uint8_t rollover;
    float co2;
    uint16_t humidity;
    uint16_t temp;
    uint16_t batteryPercentage;
};

struct bt_le_ext_adv *advertisement;

struct advertisementStruct advertisementData = {
    MANUFACTURER_ID,
    FW_VERSION,
    0x00,
    0xFFFF,
    0xFF,
    0xFF,
    0xFF
};

struct bt_data advertisementPacket[] = {
    BT_DATA_BYTES(BT_DATA_FLAGS, (BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR)),
    BT_DATA(BT_DATA_MANUFACTURER_DATA, &advertisementData, sizeof(advertisementData))
};

void sentAdvertisement(struct bt_le_ext_adv *adv, struct bt_le_ext_adv_sent_info *info){    
    printk("Advertising packet transmitted successfully(%i).\n", info->num_sent);

    dk_set_led(ADV_DONE_LED, false);
    k_sleep(K_MSEC(10));
    dk_set_led(ADV_DONE_LED, true);

    // k_sleep(K_MSEC(ADV_INTERVAL_MS));
    sendAdvertisement();
}

static struct bt_le_ext_adv_cb advertisingCallbacks = {
    .sent = sentAdvertisement,
	.connected = NULL,
    .scanned = NULL
};

void sendAdvertisement(){
    int err;
    // setting new sensor values here
    advertisementData.rollover++;
    advertisementData.co2 = getGasValue();
    advertisementData.batteryPercentage = getBatteryPercentage();

    err = readHumiditySensor();
    if(err == 0){
        advertisementData.humidity = getHumidityValue();
        advertisementData.temp = getTemperatureValue();
    } else {
        advertisementData.humidity = 0xFF;
        advertisementData.temp = 0xFF;
    }

    err = bt_le_ext_adv_set_data(advertisement, advertisementPacket, ARRAY_SIZE(advertisementPacket), NULL, 0);
    if (err) {
            printk("Failed to set advertising data (%d)\n", err);
            isRunning = false;
    }
    err = bt_le_ext_adv_start(advertisement, BT_LE_EXT_ADV_START_PARAM(0, 1));
    if (err) {
            printk("Failed to start advertising set (%d)\n", err);
            isRunning = false;
    }
    printk("Advertising packet sent.\n");
}

void main(void)
{
    int err;

    LOG_INF("Built on %s at %s\n", __DATE__, __TIME__);

    // Initialize Bluetooth subsystem
    err = bt_enable(NULL);
    if (err) {
        printk("Bluetooth init failed (err %d)\n", err);
        return;
    }

    // err = bt_le_ext_adv_create(BT_LE_EXT_ADV_CODED_NCONN_IDENTITY, NULL, &adv);
    err = bt_le_ext_adv_create(BT_LE_ADV_NCONN_IDENTITY, &advertisingCallbacks, &advertisement);
    if (err) {
        printk("Extended advertisement creation failed (err %d)\n", err);
        return;
    }

    err = initGasSensor();
    if(err) {
        printk("Gas sensor init failed (err %d)\n", err);
        return;
    }

    err = initHumiditySensor();
    if(err) {
        printk("Humidity sensor init failed (err %d)\n", err);
        return;
    }

     err = initBattery();
    if(err) {
        printk("Battery init failed (err %d)\n", err);
        return;
    }

    sendAdvertisement();

    int blinkStatus = 0;
    while (isRunning) {
        k_sleep(K_MSEC(300));
        
        dk_set_led(RUN_STATUS_LED, (++blinkStatus) % 2);
    }
    return;
}
