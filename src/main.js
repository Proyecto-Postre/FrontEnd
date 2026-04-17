import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Interceptor global de fetch para asegurar compatibilidad y autenticación
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    let [resource, config] = args;
    const apiUrl = import.meta.env.VITE_API_URL || 'https://backend-q47c.onrender.com';
    
    if (typeof resource === 'string' && resource.includes('/api')) {
        // 1. Asegurar URL absoluta con prefijo v1
        if (resource.startsWith('/api') && !resource.startsWith('/api/v1')) {
            resource = apiUrl + resource.replace('/api', '/api/v1');
        } else if (resource.startsWith('/api/v1')) {
            resource = apiUrl + resource;
        }

        // 2. Inyección automática de Token (Resiliencia)
        config = config || {};
        config.headers = config.headers || {};
        
        const token = localStorage.getItem('dulcefe_token');
        if (token && !config.headers['Authorization'] && !config.headers['authorization']) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 3. Adaptación para Login Legado
        if (resource.includes('/api/v1/Users?email=') && resource.includes('password=')) {
            const urlParams = new URL(resource).searchParams;
            resource = apiUrl + '/api/v1/Authentication/sign-in';
            config.method = 'POST';
            config.headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify({ 
                username: urlParams.get('email'), 
                password: urlParams.get('password') 
            });
        }
    }
    
    const response = await originalFetch(resource, config);

    // Solo parchear .json() si la respuesta es OK o si es el login para compatibilidad
    if (response.ok || (typeof resource === 'string' && resource.includes('/Authentication/'))) {
        const clonedResponse = response.clone();
        response.json = async () => {
            let data;
            try {
                data = await clonedResponse.json();
            } catch (e) {
                return {};
            }
            
            // Unificar formato de respuesta para el frontend antiguo
            if (typeof resource === 'string' && resource.includes('/Authentication/sign-in')) {
                return Array.isArray(data) ? data : [ data.user || data ];
            }
            
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                if (Array.isArray(data.data)) return data.data;
                if (Array.isArray(data.value)) return data.value;
            }
            return data;
        };
    }

    return response;
};

const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount('#app')
