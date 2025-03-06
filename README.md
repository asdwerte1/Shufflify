# Shufflify

**Shufflify** is a lightweight app that reorders your Spotify playlists into a truly random order. Unlike Spotify's built in shuffle - which can favour songs you play more often - this app ensures a completely randomised listening experience.

<p align="center">
  <img src="frontend/media/Logo - Shufflify.jpg" alt="Logo" width="25%" style="border: solid thin transparent; border-radius: 20px;" />
</p>

## Features

- Completely reorders your playlists to eliminate playback bias.
- Runs as a Docker container for simple deployment on your local network.
- Uses Spotify's Developer API to authenticate and modify playlists safely.

## How it works

Spotify's native shuffle algorithm will often replay frequently listened-to tracks. Shufflify works by:
1. Securely connecting to your Spotify account
2. Retrieving all playlists associated with your account
3. Shuffling the tracks in the playlist you choose with a simple randomisation algorithm.
4. Replacing the existing playlist with an updated one in a new order.
5. **NOTE** - For large playlists (over 50) you will see the tab refresh a number of times - this is due to the API limiting the number of songs, meaning the playlist is "rebuilt" in blocks of 50 songs - wait for this action to finish before closing the tab.

<br>

## Prerequisites

Before setting up ensure you have:

- Docker installed on your machine (currently only AMD64 architecture)
- (Optional) Docker Compose
- (Required for quick setup) Network setup -  Host machine IP address set to `192.168.1.150` and port 3030 not in use
- (Required for self hosted setup) A [Spotify Developer account](https://developer.spotify.com)

<br>

## Installation

### Option 1 - Quick Setup

This option uses a pre-built contianer which connects to the devlopers Spotofy Developer credentials. There is no additional setup required beyond the Network setup above.

#### Method A: Docker CLI

1. **Pull the pre-built image**
```bash
docker pull asdwerte1/shufflify:quick
```

2. **Run the container**
```bash
docker run -d -p 3030:3080 --name shufflify asdwerte1/shufflify:quick
```

3. **Verify functionality** Open your browser and navigate to `http://192.168.1.150:3030` to confirm the app loads and runs correctly

#### Method B: Docker Compose

1. **Create a file called `docker-compose.yml` and paste in**

```yaml
services:
  shufflify:
    image: asdwerte1/shufflify:quick
    container_name: shufflify
    ports:
      - "3030:8080"
    restart: unless-stopped
```

2. **Deploy with Docker Compose**

```bash
docker-compose up -d
```

3. **Verify functionality** Open your browser and navigate to `http://192.168.1.150:3030` to confirm the app loads and runs correctly

<br>

---
<br>

### Option 2 - Full Self Hosting

This option allows you to build and run the container with your own choice of IP and port, using your own Spotify Developer credentials. Setup a Spotify App and note the Client ID, Client Secret, and set the Redirect URI to match your desired address. You will also need to generate a secret-key string for the web app to function.

#### Method A: Docker CLI

1. **Pull the latest selfhost image**
```bash
docker pull asdwerte1/shufflify:selfhost
```

2. **Run the container** - replace the placeholders below with the deatils from your Spotify Developers dashboard
```bash
docker run -d -p 3030:8080 \
  --name shufflify \
  -e CLIENT_ID=your_spotify_client_id \
  -e CLIENT_SECRET=your_spotify_client_secret \
  -e REDIRECT_URI=http://your_ip:port/callback \
  -e SECRET_KEY=your_custom_key \
  asdwerte1/shufflify:selfhost
```

_Note - the redirect URI must exactly match what is on your Spotify Developer Dashboard_

3. **Verify functionality** Open your browser and navigate to `http://custom_ip:port` to confirm the app loads and runs correctly

#### Method B: Docker Compose

1. **Create a docker-compose.yml file**

```yaml
services:
  shufflify:
    image: asdwerte1/shufflify:selfhost
    container_name: shufflify
    ports:
      - "3030:8080"
    environment:
      CLIENT_ID: "your_spotify_client_id"
      CLIENT_SECRET: "your_spotofy_client_secret"
      REDIRECT_URI: "http://your_ip:port/callback"
      SECRET_KEY: "your_custom_key"
    restart: unless-stopped
```

2. **Deploy with Docker Compose**
```bash
docker-compose up -d
```

3. **Verify functionality** Open your browser and navigate to `http://custom_ip:port` to confirm the app loads and runs correctly


## Contributing

Contributions are welcome! Please open issues and submit pull requests for improvements, bug fixes or new features.