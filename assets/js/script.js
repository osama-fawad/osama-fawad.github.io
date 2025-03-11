document.addEventListener('DOMContentLoaded', function () {
    console.log("Portfolio Loaded Successfully!");

    const expertiseList = [
        "Artificial Intelligence",
        "Computer Vision",
        "Robotics",
        "LLM",
        "Perception",
        "Deep Learning",
        "Software Engineering"
    ];

    let currentIndex = 0;
    const dynamicText = document.getElementById("dynamic-text");

    function changeExpertise() {
        dynamicText.textContent = expertiseList[currentIndex];
        currentIndex = (currentIndex + 1) % expertiseList.length;
    }

    setInterval(changeExpertise, 1500);

    // Scroll Progress Bar
    const scrollProgress = document.createElement("div");
    scrollProgress.id = "scroll-progress";
    document.body.prepend(scrollProgress);

    window.addEventListener("scroll", function () {
        let scrollTop = window.scrollY;
        let scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        let scrollPercentage = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = scrollPercentage + "%";
    });

    // Active Section Highlighting in Navbar
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll("nav ul li a");

    function highlightSection() {
        let scrollPosition = window.scrollY;

        sections.forEach((section) => {
            let sectionTop = section.offsetTop - 100;
            let sectionHeight = section.clientHeight;
            let sectionId = section.getAttribute("id");

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${sectionId}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }

    window.addEventListener("scroll", highlightSection);
    highlightSection();  // Run initially to set the correct active section
});
