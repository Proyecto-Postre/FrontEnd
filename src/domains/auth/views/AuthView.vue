<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isLogin = ref(true);
const router = useRouter();

// Form Data Refs
const form = ref({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
});

const toggleMode = () => {
    isLogin.value = !isLogin.value;
    // Reset form
    form.value = { firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' };
};

const handleLogin = async () => {
    if (!form.value.email || !form.value.password) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        // Search user by email and password using json-server filter
        const response = await fetch(`/api/users?email=${form.value.email}&password=${form.value.password}`);
        const users = await response.json();

        if (users.length > 0) {
            const user = users[0];
            // Store user in local storage
            localStorage.setItem('user', JSON.stringify(user));
            
            // Redirect home and reload
            router.push('/');
            setTimeout(() => window.location.reload(), 100);
        } else {
            alert("Correo o contraseña incorrectos.");
        }
    } catch (error) {
        console.error('Login error:', error);
        alert("Hubo un error al intentar iniciar sesión.");
    }
};

const handleRegister = async () => {
    // Basic Validation
    if (form.value.password !== form.value.confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    try {
        // Check if user already exists
        const checkResponse = await fetch(`/api/users?email=${form.value.email}`);
        const existingUsers = await checkResponse.json();

        if (existingUsers.length > 0) {
            alert("Este correo ya está registrado.");
            return;
        }

        // Create new user object
        const newUser = {
            name: form.value.firstName, // Storing first name as 'name' for compatibility
            lastName: form.value.lastName,
            phone: form.value.phone,
            email: form.value.email,
            password: form.value.password // NOTE: In a real app, never store plain text passwords!
        };

        // Save to json-server
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (response.ok) {
            alert("Registro exitoso! Ahora inicia sesión.");
            toggleMode();
        } else {
            alert("Error al registrar usuario.");
        }

    } catch (error) {
        console.error('Registration error:', error);
        alert("Hubo un error de conexión.");
    }
};
</script>

<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2>{{ isLogin ? $t('auth.login_title') : $t('auth.register_title') }}</h2>
            
            <!-- Login Form -->
            <form v-if="isLogin" @submit.prevent="handleLogin" key="login-form">
                <div class="form-group">
                    <label>{{ $t('auth.email') }}</label>
                    <input type="email" v-model="form.email" placeholder="tucorreo@ejemplo.com" required>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.password') }}</label>
                    <input type="password" v-model="form.password" placeholder="••••••••" required>
                </div>

                <button type="submit" class="btn-primary full-width">{{ $t('auth.login_btn') }}</button>
            </form>

            <!-- Register Form -->
            <form v-else @submit.prevent="handleRegister" key="register-form">
                <div class="form-row-split">
                    <div class="form-group">
                        <label>{{ $t('auth.name') }}</label>
                        <input type="text" v-model="form.firstName" placeholder="Juan" required>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('auth.lastname') }}</label>
                        <input type="text" v-model="form.lastName" placeholder="Pérez" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.phone') }}</label>
                    <input type="tel" v-model="form.phone" placeholder="999 999 999" required>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.email') }}</label>
                    <input type="email" v-model="form.email" placeholder="tucorreo@ejemplo.com" required>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.password') }}</label>
                    <input type="password" v-model="form.password" placeholder="••••••••" required>
                </div>

                <div class="form-group">
                    <label>{{ $t('auth.confirm_password') }}</label>
                    <input type="password" v-model="form.confirmPassword" placeholder="••••••••" required>
                </div>

                <button type="submit" class="btn-primary full-width">{{ $t('auth.register_btn') }}</button>
            </form>

            <div class="auth-footer">
                <p>
                    {{ isLogin ? $t('auth.no_account') : $t('auth.has_account') }}
                    <a href="#" @click.prevent="toggleMode">
                        {{ isLogin ? $t('auth.register_btn') : $t('auth.login_btn') }}
                    </a>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-container {
    padding: 100px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    background-color: #f9f8f6;
}

.auth-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    width: 100%;
    max-width: 400px;
    text-align: center;
}

h2 {
    font-family: var(--heading-font-family);
    color: var(--primary-color);
    margin-bottom: 30px;
}

.form-group {
    margin-bottom: 20px;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    color: #666;
}

input {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #eee;
    border-radius: 10px;
    font-family: var(--body-font-family);
    outline: none;
    transition: all 0.3s;
}

input:focus {
    border-color: var(--primary-color);
}

.btn-primary.full-width {
    width: 100%;
    margin-top: 10px;
}

.form-row-split {
    display: flex;
    gap: 15px;
}
.form-row-split .form-group {
    width: 50%;
}

.auth-footer {
    margin-top: 20px;
    font-size: 0.9rem;
    color: #888;
}

.auth-footer a {
    color: var(--accent-color);
    font-weight: 700;
    text-decoration: none;
}
</style>
