from flask import Flask, jsonify, request, send_from_directory, redirect
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from random import shuffle
from dotenv import load_dotenv
from os import getenv
from os.path import join, dirname
import time

app = Flask(__name__, static_folder="../frontend", static_url_path="/")

def setup_auth_manager():
    print("Setting up Spotify OAuth Manager...")
    load_dotenv()
    cid = getenv("CLIENT_ID")
    secret = getenv("CLIENT_SECRET")
    redirect_uri = getenv("REDIRECT_URI")
    cache_path = join(dirname(__file__), "cache", ".cache")
    print(f"Client ID: {cid}, Redirect URI: {redirect_uri}, Cache Path: {cache_path}")

    auth_manager = SpotifyOAuth(
        client_id=cid,
        client_secret=secret,
        redirect_uri=redirect_uri,
        scope="user-read-private playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private",
        cache_path=cache_path,
    )
    print("Spotify OAuth Manager set up successfully.")
    return auth_manager

auth_manager = setup_auth_manager()
spotify_client = spotipy.Spotify(auth_manager=auth_manager)

@app.route("/")
def index():
    print("Serving index.html")
    return send_from_directory(app.static_folder, "index.html")

# New /login route to initiate the OAuth flow
@app.route("/login")
def login():
    auth_url = auth_manager.get_authorize_url()
    print(f"Redirecting user to Spotify login: {auth_url}")
    return redirect(auth_url)

@app.route("/callback")
def callback():
    print("Handling OAuth callback...")
    try:
        code = request.args.get("code")
        print(f"Authorization code received: {code}")
        token_info = auth_manager.get_access_token(code)
        print(f"Token info retrieved: {token_info}")
        if not token_info:
            print("Failed to retrieve access token.")
            return jsonify({"error": "Failed to retrieve access token"}), 500
        print("Access token retrieved successfully.")
        # Redirect to the index page with a query parameter indicating authentication success.
        return redirect("/?authenticated=true")
    except Exception as e:
        print(f"Callback error: {e}")
        return jsonify({"error": "Callback error", "details": str(e)}), 500

@app.route("/profile", methods=["GET"])
def get_user_profile():
    try:
        print("Fetching user profile...")
        token_info = auth_manager.get_cached_token()
        if not token_info:
            print("Cached token not found. User needs to authenticate.")
            return jsonify({"error": "User not authenticated"}), 401

        # Check if token has expired
        if token_info.get("expires_at", 0) < time.time():
            print("Token expired, refreshing...")
            token_info = auth_manager.refresh_access_token(token_info["refresh_token"])

        # Reinitialize the Spotify client with the current token
        spotify_client = spotipy.Spotify(auth=token_info["access_token"])
        user_profile = spotify_client.current_user()
        print(f"User profile retrieved: {user_profile}")
        
        profile_img_url = user_profile.get("images")[0].get("url") if user_profile.get("images") else None
        response = {
            "id": user_profile["id"],
            "display_name": user_profile["display_name"],
            "profile_url": user_profile["external_urls"]["spotify"],
            "profile_img": profile_img_url,
        }
        print(f"User profile response prepared: {response}")
        return jsonify(response)
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"error": "Failed to fetch profile", "details": str(e)}), 500

@app.route("/playlists", methods=["GET"])
def get_playlists():
    try:
        print("Fetching playlists...")
        playlists = []
        offset = 0
        limit = 50

        while True:
            print(f"Fetching playlists with offset {offset} and limit {limit}...")
            current_playlists = spotify_client.current_user_playlists(offset=offset, limit=limit)
            print(f"Playlists retrieved: {current_playlists}")
            playlists.extend(current_playlists["items"])
            offset += limit

            if len(current_playlists["items"]) < limit:
                print("No more playlists to fetch.")
                break

        playlist_info = [
            {"name": p["name"], "id": p["id"], "total_tracks": p["tracks"]["total"]}
            for p in playlists
        ]
        playlist_info = sorted(playlist_info, key=lambda x: x["name"].lower())
        print(f"Prepared playlist info: {playlist_info}")
        return jsonify(playlist_info)
    except Exception as e:
        print(f"Error fetching playlists: {e}")
        return jsonify({"error": "Failed to fetch playlists", "details": str(e)}), 500

@app.route("/shuffle", methods=["POST"])
def shuffle_playlist():
    try:
        print("Shuffling playlist...")
        data = request.get_json()
        print(f"Received data: {data}")
        playlist_id = data.get("playlist_id")
        
        if not playlist_id:
            print("Playlist ID not found in request.")
            return jsonify({"ERROR": "playlist_id not found"}, 400)
        
        track_ids = []
        offset = 0
        limit = 50

        while True:
            print(f"Fetching tracks for playlist {playlist_id} with offset {offset}...")
            playlist_tracks = spotify_client.playlist_tracks(playlist_id, offset=offset, limit=limit)
            print(f"Tracks retrieved: {playlist_tracks}")
            for track in playlist_tracks["items"]:
                track_id = track["track"]["id"]
                if track_id is not None:
                    track_ids.append(track_id)
            offset += limit
            
            if len(playlist_tracks["items"]) < limit:
                print("No more tracks to fetch.")
                break

        print(f"Shuffling track IDs: {track_ids}")
        shuffle(track_ids)

        chunk_size = 50
        spotify_client.playlist_replace_items(playlist_id, track_ids[:chunk_size])
        print(f"First {chunk_size} tracks replaced.")

        for i in range(chunk_size, len(track_ids), chunk_size):
            print(f"Adding tracks {i} to {i + chunk_size}...")
            spotify_client.playlist_add_items(playlist_id, track_ids[i: i + chunk_size])

        print("Playlist shuffled successfully.")
        return jsonify({"message": "Playlist shuffled successfully!"})
    except Exception as e:
        print(f"Error shuffling playlist: {e}")
        return jsonify({"error": "Failed to shuffle playlists", "details": str(e)}), 500

if __name__ == "__main__":
    print("Starting Flask app...")
    app.run(host="0.0.0.0", port=8080, debug=False)
