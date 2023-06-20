from datetime import datetime
from dataclasses import dataclass
from typing import Any


def log(data: Any) -> None:
    """Log some data with a timestamp to the console
    :param data: Element to log
    :return: None
    """

    print(f"[{datetime.now()}] ", data)
    return

@dataclass
class BLEPacket:
    """BLE packet structure for redis"""
    mac: str
    timestamp: int
    rssi: int
    fwVersion: int
    rollover: int
    co2_ppm: int
    humidity: float
    temperature: float
    battery: float
