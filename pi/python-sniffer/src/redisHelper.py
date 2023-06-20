import dataclasses
import time
import redis
import json
import configparser
from utils import log, BLEPacket


class RedisHelper:

    def __init__(self):
        # Load configs and json parser
        self.config = configparser.ConfigParser()
        self.config.read('config.ini')
        self.json_parser = json.JSONEncoder()

        # Setup redis connection
        self._wait_for_redis()

    def _wait_for_redis(self) -> bool:
        """Create the redis instance and attempt to connect to it
        :return: bool On connection success
        :raise Exception On connection failure
        """

        self.redis = redis.Redis(
            host=self.config['REDIS']['host'],
            port=int(self.config['REDIS']['port'])
        )

        ATTEMPTS: int = 5
        DELAY: int = 1

        for i in range(ATTEMPTS):
            log(f"Connection check {i + 1}")
            if self.redis.ping():
                log("Connected!")
                return True

            log("Connection not present yet, attempting again soon...")
            time.sleep(DELAY)

        raise Exception("Unable to ping redis! Check the connection settings!")

    def stream_packets(self, formatted_packets: list[BLEPacket]) -> None:
        """Send an array of BLEPackets to the redis stream
        :param formatted_packets: Array of BLEPackets to be sent
        :return: None
        """

        for packet in formatted_packets:
            entry_id = self._xadd(packet)
            # log(f"Added a packet for {packet.mac} with id {entry_id}")
        return

    def _xadd(self, formatted_packet: BLEPacket) -> int:
        """JSON encode and add a BLEPacket to the redis stream
        :param formatted_packet: BLEPacket
        :return: entry_id of the item to the redis stream
        """

        entry_id = self.redis.xadd(
            self.config['REDIS']['stream'],
            {
                'data': self.json_parser.encode(
                    dataclasses.asdict(formatted_packet)
                ),
            }
        )
        return entry_id
