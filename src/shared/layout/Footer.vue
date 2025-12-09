<template>
    <footer class="site-footer">
        <div class="container footer-container">
            <div class="footer-content">
                <div class="footer-brand">
                    <h2>Dulce Fé</h2>
                </div>
                <div class="footer-info">
                    <div class="footer-column">
                        <h4>Ubicación</h4>
                        <p>Calle de ejemplo, 123<br>Nueva York, NY 12345</p>
                    </div>
                    <div class="footer-column">
                        <h4>Contacto</h4>
                        <p>correo@ejemplo.com<br>(555) 555-5555</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- WhatsApp Floating Button -->
        <a href="https://wa.me/51998265700" target="_blank" class="whatsapp-btn" aria-label="Chat on WhatsApp">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="0" fill="currentColor" class="whatsapp-icon">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.39C9.32 7.39 8.98 7.39 8.63 7.54C8.28 7.69 7.29 8.62 7.29 10.53C7.29 12.44 8.68 14.29 8.87 14.54C9.07 14.79 11.72 18.89 15.77 20.48C16.73 20.87 17.48 20.8 18.07 20.71C18.75 20.61 20.17 19.85 20.46 19.03C20.76 18.21 20.76 17.51 20.67 17.36C20.58 17.21 20.34 17.12 19.96 16.93C19.58 16.74 17.71 15.82 17.36 15.7C17.01 15.58 16.76 15.51 16.51 15.89C16.26 16.28 15.54 17.12 15.32 17.38C15.11 17.65 14.89 17.68 14.51 17.49C14.13 17.3 12.9 16.89 11.44 15.59C10.29 14.57 9.51 13.3 9.3 12.93C9.09 12.55 9.28 12.36 9.47 12.17C9.64 12 9.84 11.73 10.04 11.51C10.23 11.28 10.3 11.12 10.43 10.86C10.56 10.6 10.49 10.38 10.37 10.14C10.25 9.9 9.53 8.13 9.23 7.42C8.94 6.73 8.64 6.82 8.44 6.82C8.25 6.82 8.04 6.82 7.82 6.82L9.53 7.39Z"></path>
            </svg>
        </a>
    </footer>
</template>

<style scoped>
.site-footer {
    background-color: #1a1a1a;
    color: #EBE9E4;
    padding: 80px 0;
    position: relative; /* Ensure it contains absolute elements if not fixed */
}
/* ... existing styles ... */
.whatsapp-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: #25D366;
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    z-index: 1000;
    transition: transform 0.3s ease, background-color 0.3s ease;
}

.whatsapp-btn:hover {
    transform: scale(1.1);
    background-color: #128C7E;
}

.whatsapp-icon {
    width: 35px;
    height: 35px;
    fill: currentColor;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 50px;
}
.footer-brand h2 {
    font-family: var(--heading-font-family);
    font-size: 3rem;
    font-weight: 700;
}
.footer-info {
    display: flex;
    gap: 80px;
}
.footer-column h4 {
    font-family: var(--heading-font-family);
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 20px;
    color: #fff;
}
.footer-column p {
    font-family: var(--body-font-family);
    font-size: 0.9rem;
    line-height: 1.6;
    color: rgba(235, 233, 228, 0.7);
}
@media (max-width: 768px) {
    .footer-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .footer-info {
        flex-direction: column;
        gap: 40px;
    }
}
</style>
