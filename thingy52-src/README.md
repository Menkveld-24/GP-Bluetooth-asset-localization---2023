# Thingy 52 firmware
NCS version: 2.2.0
This periodically transmits a BLE advertisement packet containing the humidity, co2 ppm, temperature, battery percentage and a packet id.

## SETUP
Install all the NCS SDK tools and setup VScode using their extension. Add a board configuration for: `thingy52_nrf52832`.

## FOTA
The project won't compile with default settings of the NCS SDK 2.2.0 due to a config flag which needs to be removed in the library. Follow the following steps carefully:

First, open a terminal with the SDK as the workdir (on mac: /opt/nordic/ncs/v2.2.0)

Then, go to the folder:
```sh
cd ./bootloader/mcuboot/boot/zephyr
```

Open the file on line 643:
```sh
nano +643 ./Kconfig
```
delete the line: `default n if SOC_FAMILY_NRF` and save the file.

Commit the change by:
```sh
git add .
git commit -m "added FOTA for thingy52"
```

List the git commit version by:
```sh
git show-ref
``` 
and find the hash for the ref: `refs/heads/manifest-rev`. (should be something like: 78fd7ff9f31d88b9119734965e2afdda0cb9689a).
Copy this value.

Go tho the nrf folder from the root (/opt/nordic/ncs/v2.2.0).
```sh
cd ./nrf
```

Open the west.yml file on line 110 and paste the commit hash after the 'revision: '.
```sh
nano +110 ./west.yml
```

like:
```
- name: mcuboot
      repo-path: sdk-mcuboot
      revision: 78fd7ff9f31d88b9119734965e2afdda0cb9689a
      path: bootloader/mcuboot
```