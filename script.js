document.addEventListener('DOMContentLoaded', () => {
    console.log('Dulce Fé Landing Page Loaded');

    const header = document.querySelector('.site-header');

    // Modal Implementation
    const modal = document.getElementById('infoModal');
    const closeBtn = document.querySelector('.close-modal');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const modalImageCol = document.querySelector('.modal-image-col');
    const modalTextCol = document.querySelector('.modal-text-col');

    const modalData = {
        hero: {
            title: "Experiencia Dulce",
            content: `
                <p>En Dulce Fé, cada postre es una obra de arte diseñada para deleitar tus sentidos. Utilizamos técnicas artesanales combinadas con innovación moderna.</p>
                <p>Nuestra misión es transformar momentos cotidianos en recuerdos extraordinarios a través del sabor.</p>
            `,
            imageColor: "#e6c9b8" // Example dynamic color or image logic
        },
        about: {
            title: "Nuestra Historia",
            content: `
                <p>Todo comenzó en una pequeña cocina con una gran pasión: llevar alegría a través de la repostería. Hoy, somos una familia dedicada a la excelencia.</p>
                <p>Nos enorgullece seleccionar ingredientes locales y sostenibles para garantizar la máxima frescura y calidad.</p>
            `,
            imageColor: "#dcdcdc"
        }
    };

    function openModal(e) {
        e.preventDefault();
        const btn = e.target.closest('.open-modal-btn');
        const type = btn.getAttribute('data-modal-type');

        if (modalData[type]) {
            // Update Title
            const titleEl = modalTextCol.querySelector('h3');
            if (titleEl) titleEl.textContent = modalData[type].title;

            // Update Content (paragraphs)
            // We remove old p's and add new ones, or just reset internal HTML after title?
            // Safer to find paragraphs and replace, or simpler to rebuild text col part.
            // Let's keep h3 and replace the rest.

            // Re-render text column content: Keep h3, replace rest
            modalTextCol.innerHTML = `
                <h3>${modalData[type].title}</h3>
                ${modalData[type].content}
            `;

            // Optional: Change image placeholder color to simulate change
            if (modalData[type].imageColor) {
                const imgPlaceholder = modalImageCol.querySelector('.modal-img-placeholder');
                if (imgPlaceholder) imgPlaceholder.style.backgroundColor = modalData[type].imageColor;
            }
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Event Listeners for triggers
    openBtns.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Click outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

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
