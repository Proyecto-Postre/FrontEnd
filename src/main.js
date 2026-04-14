import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Interceptar fetch de manera global para redirigir todas las llamadas /api al backend en la nube
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    let [resource, config] = args;
    const apiUrl = import.meta.env.VITE_API_URL || 'https://backend-q47c.onrender.com';
    
    // Si la ruta comienza con /api, le anteponemos la URL del backend y agregamos v1
    if (typeof resource === 'string' && resource.startsWith('/api') && !resource.startsWith('/api/v1')) {
        resource = apiUrl + resource.replace('/api', '/api/v1');
    } else if (typeof resource === 'string' && resource.startsWith('/api/v1')) {
        resource = apiUrl + resource;
    }
    
    // Adaptación para Login (Frontend mandaba GET /users?email=X&password=Y -> Backend espera POST /Authentication/sign-in)
    if (typeof resource === 'string' && resource.includes('/api/v1/Users?email=') && resource.includes('password=')) {
        const urlParams = new URL(resource).searchParams;
        resource = apiUrl + '/api/v1/Authentication/sign-in';
        config = {
            ...config,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(config?.headers || {}) },
            body: JSON.stringify({ username: urlParams.get('email'), password: urlParams.get('password') })
        };
    }
    // Adaptación para Registro individual
    else if (typeof resource === 'string' && resource.endsWith('/api/v1/Users') && config?.method === 'POST') {
        resource = apiUrl + '/api/v1/Authentication/sign-up';
    }
    
    const response = await originalFetch(resource, config);
    // Interceptar el método .json() para adaptar la estructura del nuevo backend al formato que esperaba el frontend (json-server)
    const clonedResponse = response.clone();
    response.json = async () => {
        const data = await clonedResponse.json();
        
        // Mock para el Login: El frontend esperaba un arreglo donde el primer elemento es el usuario
        if (typeof resource === 'string' && resource.includes('/Authentication/sign-in')) {
            if (!Array.isArray(data)) {
                return [ data.user || data ]; // Enviamos un array de 1 solo elemento
            }
        }
        
        // Si el backend devuelve { data: [...] } o { value: [...] }, lo extraemos a un array directo
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            if (Array.isArray(data.data)) return data.data;
            if (Array.isArray(data.value)) return data.value;
        }
        return data;
    };
    return response;
};

const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount('#app')
