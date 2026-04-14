<template>
    <div class="marquee-wrapper">
        <div class="marquee-container">
            <div class="marquee-content">
                <span>
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item1') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item2') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item3') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item4') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item5') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item6') }}
                    &nbsp;&nbsp;&nbsp;
                </span>
                <!-- Duplicate for seamless loop -->
                <span>
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item1') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item2') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item3') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item4') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item5') }}
                    <span class="marquee-dot">✦</span> {{ $t('marquee.item6') }}
                    &nbsp;&nbsp;&nbsp;
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.marquee-wrapper {
    background-color: var(--primary-color);
    overflow: hidden;
    padding: 14px 0;
}

.marquee-container {
    overflow: hidden;
    white-space: nowrap;
}

.marquee-content {
    display: inline-block;
    animation: marquee 35s linear infinite;
}

.marquee-content span {
    font-family: var(--body-font-family);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.88);
    display: inline-block;
}

.marquee-dot {
    color: rgba(255, 255, 255, 0.5);
    margin: 0 14px;
    font-size: 0.6rem;
    vertical-align: middle;
}

@keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

@media (max-width: 768px) {
    .marquee-content span { font-size: 0.78rem; }
    .marquee-wrapper { padding: 10px 0; }
}
</style>
