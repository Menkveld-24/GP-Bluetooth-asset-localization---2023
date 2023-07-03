# Simulators
This folder contains 2 simple scripts that can simulate a whitelist API and another one that can simulate BLE packets/Thingies.

## BLE/Thingy simulator
To start run: `npm run thingy`. This simulates random locations for an array of thingies. The following variables can be changed in the 'thingySimulator.js' file.
- The array of whitelisted MAC addresses
- The number of packets to simulate per thingy
- The speed at which to simulate thingies
- The Redis connection settings + stream name
- Pipelining: this combines packets into one queue to speed up pushing

## API
This is a dummy api that is available at /api/general/whitelist. It is identical to the api in the backend and returns an array of mac addresses of whitelisted thingies. Start via `npm run api`.