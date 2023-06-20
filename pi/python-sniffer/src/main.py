"""
Python BLE packet sniffer for the graduation project of Menke Veerman
at the University of Twente.

This code includes the SnifferAPI library from Nordic Semiconductor ASA

Date: 21-may-2023
Author: Menke Veerman
"""

from redisHelper import RedisHelper
from snifferHelper import SnifferHelper
from utils import log, BLEPacket
import time
import configparser
import traceback

config = configparser.ConfigParser()
config.read("config.ini")
redis = RedisHelper()
sniffer = SnifferHelper()
delay = float(config['REDIS']['scan_interval_s'])

while True:
    try:
        found_packets: list[BLEPacket] = sniffer.get_all_packets()
        if len(found_packets) > 0:
            log(f"Found {len(found_packets)} BLE packets!")
            redis.stream_packets(found_packets)
            log(f"Uploaded {len(found_packets)} BLE packets to redis!")
    except:
        log("An exception occurred!")
        traceback.print_exc()
    time.sleep(delay)