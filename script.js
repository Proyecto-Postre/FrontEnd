document.addEventListener('DOMContentLoaded', () => {
    console.log('Dulce Fé Landing Page Loaded');

    const header = document.querySelector('.site-header');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Calculate opacity based on scroll position (0 to 300px)
        // Max opacity is 0.95
        const maxOpacity = 0.95;
        const fadeDistance = 300;
        let opacity = Math.min(scrollY / fadeDistance, maxOpacity);

        header.style.backgroundColor = `rgba(235, 233, 228, ${opacity})`;

        // Toggle class for text color shift faster/at specific point
        if (scrollY > 150) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
