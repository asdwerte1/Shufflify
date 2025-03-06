document.addEventListener("DOMContentLoaded", async () => {
    // Intersection Observer code (for animations)
    const elements = document.querySelectorAll(".animate");
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    elements.forEach(element => observer.observe(element));

    // Auto-fetch profile if URL contains ?authenticated=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("authenticated") === "true") {
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
            console.error("Error fetching user profile automatically:", error);
            profileElem.innerHTML = `<p>Error loading profile. Please try again.</p>`;
        }
    }
});

// Update "Authenticate" button to redirect to /login to start the OAuth flow.
document.getElementById("profile").addEventListener("click", () => {
    window.location.href = "/login";
});

function playlist_icon(info) {
    // Function to create playlist icons on page
    const name = info.name;
    const length = info.total_tracks;

    const playlists = document.getElementById("list-of-playlists");

    const playlistName = document.createElement("h4");
    playlistName.innerHTML = name;

    const numberOfTracks = document.createElement("p");
    numberOfTracks.innerHTML = `${length} tracks`;

    const shuffleButton = document.createElement("button");
    shuffleButton.id = `${info.id}`;
    shuffleButton.innerHTML = "Shuffle";

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
    const playlist_area = document.getElementById("playlist-area");
    const playlist_list = document.createElement("ul");
    playlist_list.id = "list-of-playlists";
    playlist_area.innerHTML = `<img id="loading" src="media/loadingWheel.gif" alt="Loading..." />`;

    try {
        const response = await fetch("/playlists");
        const data = await response.json();

        playlist_area.innerHTML = "";
        playlist_area.appendChild(playlist_list);

        data.forEach(playlist_icon);
    } catch (error) {
        console.error("Error fetching playlists:", error);
    }
});

async function shufflePlaylist(id) {
    try {
        const response = await fetch("/shuffle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playlist_id: id }),
        });
        const message = await response.json();
        alert(message.message || "Shuffle successful!");
    } catch (error) {
        alert("Error shuffling playlist. Please try again.");
        console.error(error);
    }
    
    // Fallback if needed using FormData (if your backend supports it)
    const playlistData = new FormData();
    playlistData.append("playlist_id", id);
    const response = await fetch("/shuffle", {
        method: "POST",
        body: playlistData
    });
    const message = await response.json();
}
