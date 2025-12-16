<template>
    <div class="marquee-container">
        <div class="marquee-content">
            <span>Descubre el mundo dulce de los postres &nbsp; Descubre el mundo dulce de los postres &nbsp;</span>
            <span>Descubre el mundo dulce de los postres &nbsp; Descubre el mundo dulce de los postres &nbsp;</span>
        </div>
    </div>
</template>

<style scoped>
.marquee-container {
    overflow: hidden;
    white-space: nowrap;
    background-color: transparent;
    padding: 0;
    position: absolute;
    bottom: -15px;
    width: 100%;
    z-index: 10;
}

.marquee-content {
    display: inline-block;
    animation: marquee 40s linear infinite;
}

.marquee-content span {
    font-family: var(--heading-font-family);
    font-size: 7rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    display: inline-block;
    padding-right: 50px;
    line-height: 1;
}

@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

@media (max-width: 768px) {
    .marquee-content span {
        font-size: 1.5rem; /* Reduced from 3rem to be less overwhelming */
        padding-right: 20px; /* Reduced padding */
    }
    .marquee-container {
        bottom: 0; /* Align to bottom edge on mobile so it's not cut off */
    }
}
</style>
