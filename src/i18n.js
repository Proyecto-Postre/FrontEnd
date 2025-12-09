import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';

const i18n = createI18n({
    legacy: false, // Use Composition API mode
    locale: 'es', // Default locale
    fallbackLocale: 'en',
    messages: {
        es,
        en
    }
});

export default i18n;
