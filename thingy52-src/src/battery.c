/*
 * Copyright (c) 2018-2019 Peter Bigot Consulting, LLC
 * Copyright (c) 2019-2020 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: Apache-2.0
 */

#include "battery.h"
#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#include <zephyr/kernel.h>
#include <zephyr/init.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/adc.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>
#include <zephyr/logging/log_ctrl.h>
#include <sfloat.h>

#define VBATT DT_PATH(vbatt)
#define ZEPHYR_USER DT_PATH(zephyr_user)
#define BATTERY_ADC_GAIN ADC_GAIN_1

struct io_channel_config {
	uint8_t channel;
};

struct divider_config {
	struct io_channel_config io_channel;
	struct gpio_dt_spec power_gpios;
	/* output_ohm is used as a flag value: if it is nonzero then
	 * the battery is measured through a voltage divider;
	 * otherwise it is assumed to be directly connected to Vdd.
	 */
	uint32_t output_ohm;
	uint32_t full_ohm;
};

static const struct divider_config divider_config = {
	.io_channel = {
		DT_IO_CHANNELS_INPUT(VBATT),
	},
	.power_gpios = GPIO_DT_SPEC_GET_OR(VBATT, power_gpios, {}),
	.output_ohm = DT_PROP(VBATT, output_ohms),
	.full_ohm = DT_PROP(VBATT, full_ohms),
};

struct divider_data {
	const struct device *adc;
	struct adc_channel_cfg adc_cfg;
	struct adc_sequence adc_seq;
	int16_t raw;
};

static struct divider_data divider_data = {
	.adc = DEVICE_DT_GET(DT_IO_CHANNELS_CTLR(VBATT)),
};

int initBattery(){
	const struct divider_config *cfg = &divider_config;
	const struct io_channel_config *iocp = &cfg->io_channel;
	const struct gpio_dt_spec *gcp = &cfg->power_gpios;
	struct divider_data *ddp = &divider_data;
	struct adc_sequence *asp = &ddp->adc_seq;
	struct adc_channel_cfg *accp = &ddp->adc_cfg;
	int rc;

	#if DT_NODE_HAS_STATUS(VBATT, okay)
		printk("DT_NODE_STATUS_VBATT_OKAY");
	#endif

	#ifdef CONFIG_ADC_NRFX_SAADC
		printk("CONFIG_ADC_NRFX_SAADC");
	#endif

	if (!device_is_ready(ddp->adc)) {
		printk("ADC device is not ready %s", ddp->adc->name);
		return -ENOENT;
	}

	if (gcp->port) {
		if (!device_is_ready(gcp->port)) {
			printk("%s: device not ready", gcp->port->name);
			return -ENOENT;
		}
		rc = gpio_pin_configure_dt(gcp, GPIO_OUTPUT_INACTIVE);
		if (rc != 0) {
			printk("Failed to control feed %s.%u: %d",
				gcp->port->name, gcp->pin, rc);
			return rc;
		}
	}

	*asp = (struct adc_sequence){
		.channels = BIT(0),
		.buffer = &ddp->raw,
		.buffer_size = sizeof(ddp->raw),
		.oversampling = 4,
		.calibrate = true,
	};

	*accp = (struct adc_channel_cfg){
		.gain = BATTERY_ADC_GAIN,
		.reference = ADC_REF_INTERNAL,
		.acquisition_time = ADC_ACQ_TIME(ADC_ACQ_TIME_MICROSECONDS, 40),
	};

	if (cfg->output_ohm != 0) {
		accp->input_positive = SAADC_CH_PSELP_PSELP_AnalogInput0
			+ iocp->channel;
	} else {
		accp->input_positive = SAADC_CH_PSELP_PSELP_VDD;
	}

	asp->resolution = 14;

	rc = adc_channel_setup(ddp->adc, accp);
	printk("Setup AIN%u got %d", iocp->channel, rc);

	if(rc == 0){
		const struct gpio_dt_spec *gcp = &divider_config.power_gpios;
		if (gcp->port) {
			rc = gpio_pin_set_dt(gcp, true);
		}
	}

	if(rc == 0){
		printk("Battery setup OK");
	}
	else{
		printk("Battery setup failed");
	}
	return rc;
}

uint16_t getBatteryPercentage(){
	int rc = -ENOENT;

	struct divider_data *ddp = &divider_data;
	const struct divider_config *dcp = &divider_config;
	struct adc_sequence *sp = &ddp->adc_seq;

	rc = adc_read(ddp->adc, sp);
	sp->calibrate = false;
	if (rc == 0) {
		int32_t val = ddp->raw;

		adc_raw_to_millivolts(adc_ref_internal(ddp->adc),
						ddp->adc_cfg.gain,
						sp->resolution,
						&val);

		float batteryMillivolt = (float) (val * (uint64_t)dcp->full_ohm / dcp->output_ohm);
		//voltage formula: volt = 0.0105 * percentage + 3.1734
		// percentage formula: percentage = (volt - 3.1734) / 0.0105
		float percentage = (batteryMillivolt - 3173.4) / 10.5;
		printk("Battery percentage: %d", (int) percentage);
		return sfloat_from_float(percentage).val;
	} else {
		printk("Battery read failed: %d", rc);
	}

	return rc;
}
