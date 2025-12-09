<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(null);

// Form State
const isEditing = ref(false);
const form = ref({
    name: '',
    lastName: '',
    phone: '',
    email: ''
});

onMounted(async () => {
    // 1. Get user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        user.value = JSON.parse(storedUser);
        // Init form
        form.value = { ...user.value };
    } else {
        router.push('/login'); // Protected route
    }
});

const toggleEdit = () => {
    if (isEditing.value) {
        // Cancel logic: reset to saved
        form.value = { ...user.value }; 
    }
    isEditing.value = !isEditing.value;
};

const saveProfile = async () => {
    // Basic validation
    if (!form.value.name || !form.value.lastName || !form.value.phone) {
        alert("Por favor completa todos los campos requeridos.");
        return;
    }

    // Update Local State
    user.value = { ...form.value };
    localStorage.setItem('user', JSON.stringify(user.value));

    // Optional: Try to update backend (mock)
    try {
        if (user.value.id) {
             await fetch(`/api/users/${user.value.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user.value)
            });
        }
    } catch (e) {
        console.warn("Could not sync with backend", e);
    }

    isEditing.value = false;
    alert("¡Perfil actualizado correctamente!");
    
    // Force reload to update header instantly
    window.location.reload(); 
};

const logout = () => {
    localStorage.removeItem('user');
    router.push('/');
    setTimeout(() => {
        window.location.reload(); // Ensure header updates
    }, 100);
};
</script>

<template>
    <div class="account-container container">
        <div class="account-header">
            <h2>{{ $t('account.title') }}</h2>
            <p>{{ $t('account.subtitle') }}</p>
        </div>

        <div class="account-card" v-if="user">
            <div class="card-header">
                <h3>{{ $t('account.personal_data') }}</h3>
                <div class="header-actions">
                     <button v-if="!isEditing" @click="toggleEdit" class="btn-edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        {{ $t('account.edit') }}
                    </button>
                    <button v-else @click="toggleEdit" class="btn-cancel">{{ $t('account.cancel') }}</button>
                </div>
            </div>

            <form @submit.prevent="saveProfile" class="account-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>{{ $t('auth.name') }}</label>
                        <input type="text" v-model="form.name" :disabled="!isEditing" required>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('auth.lastname') }}</label>
                        <input type="text" v-model="form.lastName" :disabled="!isEditing" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>{{ $t('auth.phone') }}</label>
                    <input type="tel" v-model="form.phone" :disabled="!isEditing" required>
                </div>
                <div class="form-group">
                    <label>{{ $t('auth.email') }}</label>
                    <input type="email" v-model="form.email" disabled class="disabled-input">
                </div>

                <div class="form-actions" v-if="isEditing">
                    <button type="submit" class="btn-save">{{ $t('account.save') }}</button>
                </div>
            </form>

            <div class="logout-section">
                <button class="btn-logout" @click="logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    {{ $t('account.logout') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.account-container {
    padding: 60px 20px;
    min-height: 70vh;
    max-width: 800px;
}

.account-header {
    text-align: center;
    margin-bottom: 40px;
}

.account-header h2 {
    font-family: var(--heading-font-family);
    font-size: 2.5rem;
    color: var(--text-color);
}

.account-card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 20px;
}

.card-header h3 {
    font-family: var(--heading-font-family);
    font-size: 1.5rem;
    color: var(--text-color);
}

.btn-edit, .btn-cancel {
    background: none;
    border: none;
    color: var(--accent-color);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
}

.btn-cancel {
    color: #999;
}

.account-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

@media (max-width: 600px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 600;
    color: #555;
    font-size: 0.95rem;
}

.form-group input {
    padding: 12px 15px;
    border: 2px solid #eee;
    border-radius: 12px;
    font-family: var(--body-font-family);
    font-size: 1rem;
    transition: all 0.3s;
}

.form-group input:disabled {
    background-color: #f9f9f9;
    border-color: transparent;
    color: #777;
}

.form-group input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(85, 139, 110, 0.1);
}

.disabled-input {
    background-color: #f5f5f5 !important;
    cursor: not-allowed;
}

.btn-save {
    background-color: var(--primary-color);
    color: white;
    padding: 15px;
    width: 100%;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-save:hover {
    background-color: var(--primary-dark);
}

.logout-section {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 2px solid #f0f0f0;
    display: flex;
    justify-content: center;
}

.btn-logout {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff0f0;
    color: #d32f2f;
    border: none;
    padding: 12px 30px;
    border-radius: 50px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.3s;
    font-size: 1rem;
}

.btn-logout:hover {
    background: #ffe0e0;
}
</style>
