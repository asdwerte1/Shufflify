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

    playlists = document.getElementById("playlist-area");

    const playlistIcon = document.createElement("div");
    playlistIcon.id = info.id;
    playlistIcon.classList.add("playlist-icon");

    const shuffleButton = document.createElement("button");
    shuffleButton.id = `${info.id}-button"`;
    shuffleButton.innerHTML = "Shuffle"

    playlistIcon.innerHTML = `
        <h4>${name}</h4>
        <p>${length} tracks
        <br />`;
    playlistIcon.appendChild(shuffleButton);
    playlists.appendChild(playlistIcon);
}

document.getElementById("playlists").addEventListener("click", async () => {

    playlist_area = document.getElementById("playlist-area");
    playlist_area.innerHTML = `<img id="loading" src="media/loadingWheel.gif" alt="Loading..." />`;

    try {

        const respose = await fetch("/playlists");
        const data = await respose.json();

        playlist_area.innerHTML = "";

        data.forEach(playlist_icon);
    }
    catch (error) {
        console.error("Error fetching playlists:", error)
    }
});