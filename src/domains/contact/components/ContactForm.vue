<template>
    <section class="contact-section" id="contacto">
        <div class="container contact-container">
            <div class="contact-grid">
                <div class="contact-text">
                    <h2 class="section-title">Contáctanos</h2>
                    <p>¿Quieres que trabajemos juntos? Ingresa tus datos y nos pondremos en contacto contigo en
                        breve. Esperamos tener noticias tuyas pronto.</p>
                </div>
                <div class="contact-form-wrapper">
                    <!-- FormSubmit Configuration -->
                    <form action="https://formsubmit.co/jafethworren@gmail.com" method="POST" class="contact-form">
                        <!-- Redirect after submission (optional, stays on page or goes to a thank you page if defined, here we leave default or add a hidden next) -->
                        <input type="hidden" name="_next" value="http://localhost:5173/"> <!-- NOTE: In production this should be the render URL, we can leave it auto or set it to home -->
                        <input type="hidden" name="_subject" value="Nuevo contacto de Dulce Fé">
                        <input type="hidden" name="_captcha" value="false">

                        <div class="form-row">
                            <div class="form-group">
                                <label for="nombre">Nombre <span class="required-text">(obligatorio)</span></label>
                                <input type="text" name="name" id="nombre" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label for="apellido">Apellido</label>
                                <input type="text" name="apellido" id="apellido" class="form-input">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="email">Correo electrónico <span class="required-text">(obligatorio)</span></label>
                            <input type="email" name="email" id="email" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="mensaje">Mensaje <span class="required-text">(obligatorio)</span></label>
                            <textarea name="message" id="mensaje" class="form-input" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Enviar</button>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
// No custom script needed for FormSubmit
</script>

<style scoped>
.contact-section {
    background-color: #EBE9E4;
    color: #1a1a1a;
    padding: 100px 0;
}
.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 80px;
    align-items: flex-start;
}
.contact-text .section-title {
    font-size: 4rem;
    font-family: var(--heading-font-family);
    font-weight: 700;
    margin-bottom: 30px;
    line-height: 1;
    letter-spacing: -1px;
}
.contact-text p {
    font-size: 1rem;
    line-height: 1.6;
    color: #4a4a4a;
    max-width: 90%;
}
.contact-form {
    display: flex;
    flex-direction: column;
    gap: 25px;
}
.form-row {
    display: flex;
    gap: 20px;
}
.form-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
}
.form-group label {
    font-family: var(--heading-font-family);
    font-size: 0.95rem;
    color: #1a1a1a;
    font-weight: 500;
}
.required-text {
    font-size: 0.8rem;
    font-weight: 300;
    color: #666;
    font-family: var(--body-font-family);
    font-style: italic;
}
.form-input {
    width: 100%;
    padding: 12px 20px;
    background-color: transparent;
    border: 1px solid #1a1a1a;
    border-radius: 50px;
    font-family: var(--body-font-family);
    font-size: 1rem;
    outline: none;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}
.form-input:focus {
    background-color: rgba(255, 255, 255, 0.5);
    border-color: #000;
}
textarea.form-input {
    border-radius: 20px;
    resize: vertical;
}
.contact-form .btn-primary {
    align-self: flex-start;
    margin-top: 10px;
    padding: 15px 60px;
}
@media (max-width: 900px) {
    .contact-grid {
        grid-template-columns: 1fr;
        gap: 50px;
    }
    .contact-text .section-title {
        font-size: 3rem;
        text-align: center;
    }
    .contact-text p {
        text-align: center;
        margin: 0 auto;
    }
    .form-row {
        flex-direction: column;
        gap: 20px;
    }
}
</style>
