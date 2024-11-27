from flask import Flask, jsonify, request, send_from_directory
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from random import shuffle
from dotenv import load_dotenv
from os import getenv
from os.path import join, dirname

app = Flask(__name__, static_folder="../frontend", static_url_path="/")

def setup():
    load_dotenv()
    cid = getenv("CLIENT_ID")
    secret = getenv("CLIENT_SECRET")
    redirect_uri = getenv("REDIRECT_URI")
    cache_path = join(dirname(__file__), "cache", ".cache")

    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id=cid,
        client_secret=secret,
        redirect_uri=redirect_uri,
        scope="user-read-private playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private",
        cache_path=cache_path,
        show_dialog=False,
    ))
    return sp

spotify_client = setup()

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/profile", methods=["GET"])
def get_user_profile():
    
    """Funciton to fetch the users profile information/authenticate profile"""
    
    user_profile = spotify_client.current_user()
    profile_img_url = user_profile.get("images")[0].get("url") if user_profile.get("images") else None
    response = {
        "id": user_profile['id'],
        "display_name": user_profile['display_name'],
        "profile_url": user_profile['external_urls']['spotify'],
        "profile_img": profile_img_url
    }
    
    return jsonify(response)

@app.route("/playlists", methods=["GET"])
def get_playlists():
    
    playlists = []
    offset = 0
    limit = 50

    while True:
        
        current_playlists = spotify_client.current_user_playlists(offset=offset, limit=limit)
        playlists.extend(current_playlists["items"])
        offset += limit
        
        if len(current_playlists["items"]) < limit:
            break

    playlist_info = [
        {"name": p["name"],
         "id": p["id"],
         "total_tracks": p["tracks"]["total"]
         } for p in playlists]
    
    playlist_info = sorted(playlist_info, key=lambda x: x["name"].lower())
    
    return jsonify(playlist_info)

@app.route("/shuffle", methods=["POST"])
def shuffle_playlist():
    
    """Function to shuffle a playlist based on the ID that arrives"""
    
    data = request.get_json()
    playlist_id = data.get("playlist_id")
    
    if not playlist_id:
        return jsonify({"ERROR": "playlist_id not found"}, 400)
    
    track_ids =[]
    offset = 0
    limit = 50

    while True:
        
        playlist_tracks = spotify_client.playlist_tracks(playlist_id, offset=offset, limit=limit)
        for track in playlist_tracks["items"]:
            track_id = track["track"]["id"]
            if track_id is not None:
                track_ids.append(track_id)
                
        offset += limit
        
        if len(playlist_tracks["items"]) < limit:
            break

    shuffle(track_ids)
    
    chunk_size = 50
    
    spotify_client.playlist_replace_items(playlist_id, track_ids[:chunk_size])
    
    for i in range(chunk_size, len(track_ids), chunk_size):
        spotify_client.playlist_add_items(playlist_id, track_ids[i: i + chunk_size])
        
    return jsonify({"message": "Playlist shuffled successfully!"})
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)