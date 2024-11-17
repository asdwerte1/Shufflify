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
})