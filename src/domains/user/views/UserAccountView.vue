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

const orders = ref([]);

onMounted(async () => {
    // 1. Get user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        user.value = JSON.parse(storedUser);
        // Init form
        form.value = { ...user.value };

        // 2. Fetch Orders
        try {
            const res = await fetch(`/api/orders?userId=${user.value.id}&_sort=id&_order=desc`);
            if (res.ok) {
                orders.value = await res.json();
            }
        } catch (e) {
            console.error("Error fetching orders:", e);
        }
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

        <div class="grid-layout">
            <!-- LEFT COLUMN: PERSONAL DATA -->
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

            <!-- RIGHT COLUMN: MY ORDERS -->
             <div class="account-card orders-card">
                <div class="card-header">
                    <h3>Mis Pedidos 📦</h3>
                </div>
                
                <div v-if="orders.length === 0" class="empty-orders">
                    <p>Aún no has realizado pedidos.</p>
                    <RouterLink to="/menu" class="btn-link">Ir al Menú</RouterLink>
                </div>

                <div v-else class="orders-list">
                    <div v-for="order in orders" :key="order.id" class="order-item">
                        <div class="order-header">
                            <span class="order-date">{{ new Date(order.date).toLocaleDateString() }}</span>
                            <span class="order-status" :class="order.status">{{ order.status || 'pendiente' }}</span>
                        </div>
                        <div class="order-body">
                            <div class="order-summary">
                                <span class="item-count">{{ order.items.length }} productos</span>
                                <span class="total-price">S/ {{ order.total }}</span>
                            </div>
                            <ul class="order-items-preview">
                                <li v-for="item in order.items" :key="item.id">
                                    {{ item.quantity }}x {{ item.title }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    </div>
</template>

<style scoped>
.account-container {
    padding: 60px 20px;
    min-height: 80vh;
    max-width: 1200px; /* Increased max-width for 2 cols */
}

/* GRID LAYOUT */
.grid-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    align-items: start;
}

@media (max-width: 900px) {
    .grid-layout {
        grid-template-columns: 1fr; /* Stack on mobile */
    }
}

.account-header {
    text-align: center;
    margin-bottom: 50px;
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

/* FORM STYLES (Existing) */
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

.btn-cancel { color: #999; }

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
}

/* ORDER HISTORY STYLES */
.orders-card {
    min-height: 400px;
}

.empty-orders {
    text-align: center;
    padding: 40px 0;
    color: #888;
}

.btn-link {
    display: inline-block;
    margin-top: 15px;
    color: var(--primary-color);
    font-weight: 700;
    text-decoration: none;
}

.orders-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.order-item {
    border: 1px solid #eee;
    border-radius: 15px;
    padding: 20px;
    transition: all 0.3s;
}

.order-item:hover {
    border-color: var(--primary-color);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    font-size: 0.9rem;
    color: #666;
    font-weight: 600;
}

.order-status {
    text-transform: capitalize;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
}

.order-status.pendiente { background: #fff3cd; color: #856404; }
.order-status.atendido { background: #d4edda; color: #155724; }
.order-status.cancelado { background: #f8d7da; color: #721c24; }

.order-summary {
    display: flex;
    justify-content: space-between;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 10px;
    color: var(--text-color);
}

.total-price {
    color: var(--primary-color);
}

.order-items-preview {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.9rem;
    color: #777;
    border-top: 1px dashed #eee;
    padding-top: 10px;
}
</style>
