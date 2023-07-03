# The dashboard
This directory holds the dashboard of the Bluetooth Asset localization Graduation project. The backend is a Node.Js application that uses Express.js. The frontend is Vue + TailwindCSS.

## Development installation
### Requirements
- Make sure to have Node.JS 18 installed (installation via [NVM](https://github.com/nvm-sh/nvm) is recommended)
- A working [Docker](https://docs.docker.com/desktop/) instance 

### Setting up the backend
Starting the database and cache (from the /dashboard folder)
```sh
docker compose up -d
```

To install the backend: go to the '/backend' directory
```sh
cd ./backend
```

Make sure to use Node.Js 18
```sh
nvm use
```

Copy the .env.example to .env
```sh
cp .env.example .env
```

Install the dependencies
```sh
npm install
```

### Setting up the frontend
To install the frontend: go to the '/frontend' directory
```sh
cd ./frontend
```

Make sure to use Node.Js 18
```sh
nvm use
```

Copy the .env.example to .env
```sh
cp .env.example .env
```

Set a valid mapbox token in the .env (see Creating a Mapbox token):
```env
VITE_MAPBOX_TOKEN=pk.ey....
```

Install the dependencies
```sh
npm install
```

### Running the dev environment
The dev environment works by hosting the backend at port 3001 (by default) and the Vite dev server (used by Vue) at port 3000 (by default). All routes should be pointed to the Vite dev server (port 3000), Vite has a reverse proxy setup where it proxies all paths with the prefix '/api' to the backend. Note: the dev environment is dependent on a working Apache Kafka installation.

The Vite dev server (for the frontend) can be started by running the following command in the '/frontend' folder:
```sh
npm run dev
```

The backend can be started by running the following command in the '/backend' folder:
```sh
npm run dev
```

Start the docker dev environment:
```sh
docker compose up -d
```

### Ports and hosts
After the dev setup the following things should be available at: 
- PhpMyAdmin (MySQL database management panel): `http://localhost:8008` 
- RedisInsight: `http://localhost:8002`
- Redis: available at port `6377`
- MySQL: available at port `3307`

All dev credentials can be found and changed in docker-compose.yml

### Creating a Mapbox token
- Go to: `https://account.mapbox.com/` and create an account or log in.
- In the dashboard select `Create a Token`.
- Leave all boxes at their default values (all public scopes ticked and none of the secret scopes)
- A token URL can be left empty or set to the production url of the dashboard (recommended for production usage)
- Paste the token in the `VITE_MAPBOX_TOKEN` .env in the /frontend and either restart the frontend's dev server (npm run dev) or rebuild it.

### Prettier and ESLint
Eslint and prettier are set up in this project. 
You can install the Prettier plugin in VScode to set this up or run any of the 4 commands:
```sh
npm run format:check
npm run format:write
npm run lint:check
npm run lint:fix
```