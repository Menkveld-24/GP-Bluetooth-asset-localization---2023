# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(blinky)

target_sources(app PRIVATE src/main.c src/gasSensor.h src/gasSensor.c src/humidity.h src/humidity.c src/battery.h src/battery.c)
