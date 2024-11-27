document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll(".animate");

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    },
        { threshold: 0.3 }
    );

    elements.forEach(element => observer.observe(element));
});

document.getElementById("profile").addEventListener("click", async () => {
    const profileElem = document.getElementById("profile-area");
    profileElem.innerHTML = `<img id="loading" src="media/loadingWheel.gif" alt="Loading..." />`;

    try {

        const response = await fetch("/profile");
        const data = await response.json();

        const profileInfo = document.createElement("div");
        profileInfo.id = "profile-info";
        profileInfo.style.display = "none";

        profileInfo.innerHTML = `
            <div>
                <img id="profile-img" src="${data.profile_img}" alt="Profile" />
            </div>
            <div>
                <p>User ID: ${data.id}</p>
                <p>Display Name: ${data.display_name}</p>
                <p>Profile URL: 
                    <a href="${data.profile_url}" target="_blank">${data.profile_url}</a>
                </p>
            </div>
        `;

        profileElem.appendChild(profileInfo);

        await new Promise((resolve, reject) => {
            const img = document.getElementById("profile-img");
            if (img) {
                img.onload = resolve;
                img.onerror = () => reject("Failed to load profile image.");
            } else {
                reject("Profile image element not found.");
            }
        });

        document.getElementById("loading").remove();
        profileInfo.style.display = "flex";
        document.getElementById("playlists").style.display = "inline";
    } catch (error) {
        console.error("Error fetching user profile or loading image:", error);
        profileElem.innerHTML = `<p>Error loading profile. Please try again.</p>`;
    }
});

function playlist_icon(info) {

    // Function to create playlist icons on page
    const name = info.name;
    const length = info.total_tracks;

    playlists = document.getElementById("list-of-playlists");

    const playlistName = document.createElement("h4");
    playlistName.innerHTML = name;

    const numberOfTracks = document.createElement("p");
    numberOfTracks.innerHTML = `${length} tracks`;

    const shuffleButton = document.createElement("button");
    shuffleButton.id = `${info.id}`;
    shuffleButton.innerHTML = "Shuffle"

    const playlist_elem = document.createElement("li");
    playlist_elem.appendChild(playlistName);
    playlist_elem.appendChild(numberOfTracks);
    playlist_elem.appendChild(shuffleButton);

    playlists.appendChild(playlist_elem);

    shuffleButton.addEventListener("click", async () => {
        shuffleButton.innerHTML = "Shuffling...";
        shuffleButton.disabled = true;

        await shufflePlaylist(shuffleButton.id);

        shuffleButton.innerHTML = "Shuffle";
        shuffleButton.disabled = false;
    });
}

document.getElementById("playlists").addEventListener("click", async () => {

    playlist_area = document.getElementById("playlist-area");
    playlist_list = document.createElement("ul");
    playlist_list.id = "list-of-playlists";
    playlist_area.innerHTML = `<img id="loading" src="media/loadingWheel.gif" alt="Loading..." />`;

    try {

        const respose = await fetch("/playlists");
        const data = await respose.json();

        playlist_area.innerHTML = "";
        playlist_area.appendChild(playlist_list);

        data.forEach(playlist_icon);
    }
    catch (error) {
        console.error("Error fetching playlists:", error)
    }
});

async function shufflePlaylist(id) {

    try{
        const response = await fetch("/shuffle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playlist_id: id}),
        });

        const message = await response.json();
        alert(message.message || "Shuffle successful!");
    }
    catch(error) {
        alert("Error shuffling playlist. Please try again.")
        console.error(error);
    }
    const playlistData = new FormData();
    playlistData.append("playlist_id", id);

    const response = await fetch("/shuffle", {
        method: "POST",
        body: playlistData
    });

    const message = await response.json();
}