<template>
    <section class="services-section" id="servicios">
        <div class="container">
            <h2 class="section-title">Nuestros servicios</h2>
            <div class="services-grid">
                <div class="service-card" v-for="(service, index) in services" :key="index">
                     <div class="service-image-placeholder"></div>
                     <div class="service-info">
                         <h3>{{ service.title }}</h3>
                         <span class="service-price">{{ service.price }}</span>
                         <p>{{ service.desc }}</p>
                     </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
const services = [
    { title: 'Servicio básico', price: 'USD 99.00', desc: 'Describe los detalles importantes, tales como el precio, el valor, la duración del servicio y por qué es exclusivo. También puedes usar estas secciones para mostrar distintos valores clave de tus productos o servicios.' },
    { title: 'Servicio intermedio', price: 'USD 149.00', desc: 'Describe los detalles importantes, tales como el precio, el valor, la duración del servicio y por qué es exclusivo. También puedes usar estas secciones para mostrar distintos valores clave de tus productos o servicios.' },
    { title: 'Servicio avanzado', price: 'USD 199.00', desc: 'Describe los detalles importantes, tales como el precio, el valor, la duración del servicio y por qué es exclusivo. También puedes usar estas secciones para mostrar distintos valores clave de tus productos o servicios.' }
];
</script>

<style scoped>
.services-section {
    background-color: #EBE9E4;
    color: #1a1a1a;
    padding: 100px 0;
    min-height: 80vh;
}
.section-title {
    font-family: var(--heading-font-family);
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 50px;
    text-align: left;
}
.services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
}
.service-card {
    display: flex;
    flex-direction: column;
}
.service-image-placeholder {
    background-color: #dcdcdc;
    height: 300px;
    width: 100%;
    margin-bottom: 20px;
}
.service-info h3 {
    font-family: var(--heading-font-family);
    font-size: 1.5rem;
    font-weight: 400;
    margin-bottom: 5px;
    color: #1a1a1a;
}
.service-price {
    display: block;
    font-family: var(--body-font-family);
    font-size: 0.9rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 15px;
}
.service-info p {
    font-size: 0.9rem;
    color: #4a4a4a;
    line-height: 1.6;
    max-width: 90%;
}
@media (max-width: 900px) {
    .services-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
@media (max-width: 600px) {
    .services-grid {
        grid-template-columns: 1fr;
    }
    .section-title {
        text-align: center;
    }
}
</style>
