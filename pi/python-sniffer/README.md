# Project Name

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project includes code from the following source:

Copyright (c) 2014-2019, Nordic Semiconductor ASA
[Link to BLE Sniffer](https://www.nordicsemi.com/Products/Development-tools/nrf-sniffer-for-bluetooth-le)

## Description

This repository listens for the custom BLE advertisement packets and pushed them onto a redis stream.

## Installation

This project is built with Python 3.11. Setup a pipenv or virtualenv as desired and install all the packages
from requirements.txt.

This projects uses the nRF Sniffer for Bluetooth LE project from Nordic Semiconductor to scan for the packets. 
As of this, a working and connected nRF Sniffer is required. This library is compatible with the nRF52 (DK/Dongle) and nRF51 (DK/Dongle).
One of those needs to be flashed with a .hex file from within the SnifferAPI_docs/hex folder. Or you could follow the
installation instructions from [Nordic Semiconductor](https://infocenter.nordicsemi.com/index.jsp?topic=%2Fug_sniffer_ble%2FUG%2Fsniffer_ble%2Finstalling_sniffer.html)

## Configuration

The root of the project must contain a "config.ini" configuration file with the following 4 entries.
- host: Host of the Redis stream
- port: Port of the Redis stream
- stream: Stream name of the Redis stream
- scan_interval_s: The interval (s) at which the code reads packets from the sniffer and uploads them to Redis

```
[REDIS]
host = localhost
port = 6370
stream = ble_packets
scan_interval_s = 0.1
```
