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

document.getElementById("profile").addEventListener("click", () => {
    fetch("/profile")

        .then(response => response.json())
        .then(data => {
            document.getElementById("output").innerHTML = `
                <p>User ID: ${data.id}</p>
                <p>Display Name: ${data.display_name}</p>
                <p>Profile URL: ${data.profile_url}</p>
            `;
        })
        .catch(error => console.error("Error fetching profile:", error));
});