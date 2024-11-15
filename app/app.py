import spotipy
from spotipy.oauth2 import SpotifyOAuth
from random import shuffle
from dotenv import load_dotenv
from os import getenv

def setup():
    load_dotenv()
    cid = getenv("CLIENT_ID")
    secret = getenv("CLIENT_SECRET")
    redirect_uri = getenv("REDIRECT_URI")

    print("Creating Connection")
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id=cid,
        client_secret=secret,
        redirect_uri=redirect_uri,
        scope="user-read-private playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private"
    ))
    print(f"Connection made!")
    return sp

def get_and_display_profile_info(sp):
    print("Fetching user profile information...")
    user_profile = sp.current_user()
    print(f"\tUser ID: {user_profile['id']}")
    print(f"\tDisplay Name: {user_profile['display_name']}")
    print(f"\tProfile URL: {user_profile['external_urls']['spotify']}")
    print(f"\nFetching {user_profile['display_name']}\'s playlists...")
    return user_profile

# TODO - split logic into fetch and shuffle playlists

def get_playlists(sp):
    
    playlists = []
    offset = 0
    limit = 50

    while True:
        
        current_playlists = sp.current_user_playlists(offset=offset, limit=limit)
        playlists.extend(current_playlists["items"])
        offset += limit
        
        if len(current_playlists["items"]) < limit:
            break

    print(f"\tTotal playlists fetched: {len(playlists)}")
    
    return playlists

def shuffle_playlist(sp):

    playlist_name = input("Enter playlist to shuffle: ")

    for playlist in playlists:
        
        if playlist["name"].find(playlist_name) != -1:
            
            print("\nPlaylist found:")
            print(f"\tTotal Tracks: {playlist['tracks']['total']}")
            print(f"\tPlaylist URL: {playlist['external_urls']['spotify']}")
            
            playlist_id = playlist["id"]
            track_ids = []  
            offset = 0
            limit = 50

            while True:
                
                playlist_tracks = sp.playlist_tracks(playlist_id, offset=offset, limit=limit)
                for track in playlist_tracks["items"]:
                    track_id = track["track"]["id"]
                    if track_id is not None:
                        track_ids.append(track_id)
                    else:
                        print(f"Invalid track ID: {track['track']['name']}")
                offset += limit
                
                if len(playlist_tracks["items"]) < limit:
                    break

            shuffle(track_ids)
            
            chunk_size = 50
            print("\nUpdating playlist with shuffled tracks...")
            
            sp.playlist_replace_items(playlist_id, track_ids[:chunk_size])
            
            for i in range(chunk_size, len(track_ids), chunk_size):
                sp.playlist_add_items(playlist_id, track_ids[i: i + chunk_size])
                
            print("Playlist tracks successfully shuffled!")
        
if __name__ == "__main__":
    connection = setup()
    user = get_and_display_profile_info(connection)
    playlists = get_playlists(connection)
    shuffle_playlist(connection)