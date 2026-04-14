<template>
    <footer class="site-footer">
        <!-- Main footer content -->
        <div class="footer-main">
            <div class="container footer-grid">
                <!-- Brand Column -->
                <div class="footer-brand">
                    <h2 class="footer-logo">Dulce Fe</h2>
                    <p class="footer-tagline">{{ $t('footer.tagline') }}</p>
                    <div class="footer-social">
                        <a href="#" class="social-link" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#" class="social-link" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="#" class="social-link" aria-label="TikTok">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.19 8.19 0 0 0 4.78 1.52V6.82a4.85 4.85 0 0 1-1.01-.13z"/></svg>
                        </a>
                    </div>
                </div>

                <!-- Links Column -->
                <div class="footer-column">
                    <h4>{{ $t('footer.legal') }}</h4>
                    <ul>
                        <li><a href="#">{{ $t('footer.legal_notice') }}</a></li>
                        <li><a href="#">{{ $t('footer.privacy') }}</a></li>
                        <li><RouterLink to="/contacto">{{ $t('footer.contact') }}</RouterLink></li>
                    </ul>
                </div>

                <!-- Contact Column -->
                <div class="footer-column">
                    <h4>{{ $t('footer.location') }}</h4>
                    <ul>
                        <li>Lima, Perú</li>
                        <li>
                            <a href="https://wa.me/51998265700" target="_blank">
                                +51 998 265 700
                            </a>
                        </li>
                        <li>dulcefe@ejemplo.com</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Footer bar -->
        <div class="footer-bar">
            <div class="container footer-bar-inner">
                <span>{{ $t('footer.copyright', { year: new Date().getFullYear() }) }}</span>
                <span class="footer-bar-made">{{ $t('footer.made_in') }}</span>
            </div>
        </div>

        <!-- WhatsApp Floating Button -->
        <a href="https://wa.me/51998265700" target="_blank" class="whatsapp-btn" aria-label="Chat on WhatsApp">
            <svg viewBox="0 0 448 512" width="28" height="28" fill="currentColor">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
        </a>
    </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
/* ── Footer Main ───────────────────────────────────────────── */
.site-footer {
    background-color: var(--surface-alt);
    border-top: 1px solid var(--border-color);
    margin-top: 0;
}

.footer-main {
    padding: 60px 0 40px;
}

.footer-grid {
    display: grid;
    grid-template-columns: 1.6fr 1fr 1fr;
    gap: 50px;
}

/* ── Brand ─────────────────────────────────────────────────── */
.footer-logo {
    font-family: var(--heading-font-family);
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 10px;
}

.footer-tagline {
    font-family: var(--body-font-family);
    color: var(--text-muted);
    font-size: 0.95rem;
    font-style: italic;
    margin-bottom: 24px;
}

.footer-social {
    display: flex;
    gap: 12px;
}

.social-link {
    width: 40px;
    height: 40px;
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    text-decoration: none;
    transition: all 0.25s;
}

.social-link:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    transform: translateY(-2px);
}

/* ── Columns ───────────────────────────────────────────────── */
.footer-column h4 {
    font-family: var(--body-font-family);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--primary-color);
    margin-bottom: 18px;
}

.footer-column ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.footer-column ul li,
.footer-column ul li a {
    font-size: 0.92rem;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
}

.footer-column ul li a:hover { color: var(--primary-color); }

/* ── Bar ───────────────────────────────────────────────────── */
.footer-bar {
    background-color: var(--primary-color);
    padding: 14px 0;
}

.footer-bar-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.75);
}

.footer-bar-made { color: rgba(255, 255, 255, 0.6); }

/* ── WhatsApp Button ───────────────────────────────────────── */
.whatsapp-btn {
    position: fixed;
    bottom: 28px;
    right: 28px;
    background-color: #25D366;
    color: white;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 16px rgba(37, 211, 102, 0.45);
    z-index: 900;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    text-decoration: none;
}

.whatsapp-btn:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 8px 24px rgba(37, 211, 102, 0.5);
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 768px) {
    .footer-grid {
        grid-template-columns: 1fr;
        gap: 35px;
    }

    .footer-bar-inner {
        flex-direction: column;
        gap: 6px;
        text-align: center;
    }
}
</style>
