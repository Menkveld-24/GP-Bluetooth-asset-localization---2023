import configparser
import struct
import binascii
import time
from SnifferAPI import UART, Sniffer
from utils import BLEPacket, log


def convert_2s_complement(bits) -> int:
    """Convert a 4-bits 2's complement to decimal
    :param bits: 4 bits (2's complement)
    :return: The decimal representation
    """

    if bits & 0b1000:
        bits = ~bits & 0b1111
        bits = -(bits + 1)

    return bits


def parse_short_float(bytes) -> float:
    """Parse a 2-byte short float (IEEE 11073-20601-2008) to a floating value
    :param bytes: 2 bytes (LE)
    :return: The floating representation
    """

    # The sfloat in short: the first 4 bits is the exponent in 2's complement,
    # the remaining 12 bits is the mantissa. The mantissa does not follow standar IEEE 754
    # float notation. Lets take 74.5, which equals 745 * 10^-1, this is exactly the sfloat.
    # 745 (0b1011101001) is the mantissa and -1 (0b1111) the exponent. Making the total
    # byte: 1111 0010 1110 1001, however, note that the input of this function is LE.
    exponent = convert_2s_complement(bytes[1] >> 4)
    mantissa = int(((bytes[1] & 0x0F) << 8) | bytes[0])
    return mantissa * (10 ** exponent)


class SnifferHelper:

    # The vendor id as specified in the thingy code, they are compared to 2 entries of the payload of a packet
    VENDOR_ID_L: int = 0x45
    VENDOR_ID_H: int = 0x48
    # All packets contain the same data structure and thereof all have the same (fixed)
    # length for the payload
    THINGY_PACKET_LENGTH: int = 30

    packet_tracker: dict = dict()

    def __init__(self):
        log("Searching for BLE sniffers... (this might take a while)")
        ports: list = UART.find_sniffer()
        if len(ports) == 0:
            log("No serial ports found with a BLE sniffer!")

        log("Starting BLE sniffer!")
        # If you are using an old firmware version <= 2.0.0, simply remove the baudrate parameter here.
        self.sniffer = Sniffer.Sniffer(portnum=ports[0], baudrate=1000000)
        self.sniffer.start()
        self.sniffer.scan()

        log("Started BLE sniffer!")

        config = configparser.ConfigParser()
        config.read("config.ini")
        self.scan_interval: float = max(2, 2 * float(config['REDIS']['scan_interval_s']))

    def get_all_packets(self) -> list[BLEPacket]:
        """Retrieve all scanned BLE packets from the sniffer which could possibly be ours
        (those that have a specific vendor ID set and payload length)
        :return: set All found packets
        """

        packets: list = []
        scanned_packets = self.sniffer.getPackets()
        timestamp = int(time.time())

        for packet in scanned_packets:
            # Check if the blepacket is valid/exists
            if packet.valid == False or packet.blePacket is None:
                continue

            # If the packet length is not equal to THINGY_PACKET_LENGTH it isn't our packet
            # as those all have the same (fixed) length
            if len(packet.blePacket.payload) is not self.THINGY_PACKET_LENGTH:
                continue

            payload = packet.blePacket.payload

            # Check the vendor id of the packet
            if payload[12] is not self.VENDOR_ID_L or payload[11] is not self.VENDOR_ID_H:
                continue

            # Mac address extraction to: AABBCCDDEEFF
            mac = binascii.hexlify(bytes(payload[0:6:1])).upper().decode()

            # After all (basic) validation, the packet could possibly be ours, parsing time!
            # Note: sfloat is a shortfloat (2-bytes compared to 4) and encoded as per IEEE 11073-20601-2008
            # Deconstructed packet payload (length = 30):
            #   # Decimal values             # Index       # Description
            # [
            #   227, 212, 132, 96, 53, 205,  ---  0/5  --- This is the mac address (LE)
            #   2, 1, 6,                     ---  6/8  --- These are the flags (length, type, flags)
            #   17,                          ---   9   --- This is the length of our data
            #   255,                         ---  10   --- This defines that the packet is manufacturerspecific
            #   72, 69,                      --- 11/12 --- This is the manufacturerID of the packet (LE, uint)
            #   1,                           ---  13   --- This is the firmware version (uint)
            #   68,                          ---  14   --- This is the rollover byte (uint)
            #   0, 192, 23, 68,              --- 15/18 --- This is the co2 (LE, float)
            #   239, 241,                    --- 19/20 --- This is the humidity (LE,sfloat)
            #   0, 241,                      --- 21/22 --- This is the temperature (LE, sfloat)
            #   5, 243,                      --- 23/24 --- This is the battery percentage (LE, sfloat)
            #   0, 0,                        --- 25/26 --- Idk, these are smh added
            #   196, 84, 56                  --- 27/29 --- This is the CRC of the packet
            # ]

            # Struct unpack all LE, uint_16, uint_8, uint_8, float
            manufacturer_id, fw_version, rollover, co2_ppm = struct.unpack('<HBBf', bytes(payload[11:19]))

            tracker_entry = self.packet_tracker.get(mac, False)
            if tracker_entry:
                # If the previous packet's timestamp + some time is smaller than now and it is the same rollover,
                # assume that this is a duplicate entry, skip
                if (tracker_entry['timestamp'] + self.scan_interval) > timestamp \
                        and tracker_entry['rollover'] == rollover:
                    continue

            # IEEE 11073-20601-2008 shortFloat unpacking
            humidity = parse_short_float(bytes(payload[19:21]))
            temperature = parse_short_float(bytes(payload[21:23]))
            battery = parse_short_float(bytes(payload[23:25]))
            # Mac address extraction to: AABBCCDDEEFF
            mac = binascii.hexlify(bytes(payload[0:6:1])).upper().decode()

            self.packet_tracker[mac] = {
                "timestamp": time.time(),
                "rollover": rollover
            }

            packets.append(BLEPacket(
                mac=mac,
                timestamp=timestamp,
                rssi=packet.RSSI,
                fwVersion=fw_version,
                rollover=rollover,
                co2_ppm=round(co2_ppm, 1),
                humidity=round(humidity, 1),
                temperature=round(temperature, 1),
                battery=round(battery, 1)
            ))

        return packets
