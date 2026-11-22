import './style.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { initHeroSlideshow, playIntroAnimation, triggerLogoReplaySequence, advanceHeroSlide } from './animations.js';
import { alignLogoSubtitle } from './subtitle.js';
import { getPageFileName, getCssConfigBool } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Permitir reiniciar intro con ?intro=reset en la URL
    if (new URLSearchParams(window.location.search).get('intro') === 'reset') {
        sessionStorage.removeItem('intro_seen');
        sessionStorage.removeItem('hero_slide_index');
    }

    // 1. Inicialización de fotos de fondo (rotación aleatoria y secuencial)
    initHeroSlideshow();

    // 2. Animación cinematográfica inicial
    // Se ejecuta al cargar la página principal por primera vez en la sesión.
    // Arranca a pantalla completa (100vh), aparece el logo, luego se encoge a 50vh y entran los botones.
    const heroIntro = document.querySelector('.hero-intro');
    const isHomePage =
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('');

    const introSeen = sessionStorage.getItem('intro_seen');

    if (isHomePage && !introSeen && heroIntro) {
        playIntroAnimation();
    }

    // 3. Comportamiento Sticky del Nav en Scroll
    const nav = document.getElementById('main-nav');
    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (heroIntro && nav) {
            const heroBottom = heroIntro.offsetTop + heroIntro.offsetHeight - 65;
            nav.classList.toggle('is-sticky', scrollY >= heroBottom);
        }
    }
    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll();

    // Anclas directas en URL (ej: /granja-parque.html#contenido)
    function scrollToHashTarget() {
        if (window.location.hash) {
            const targetAnchor = document.querySelector(window.location.hash);
            if (targetAnchor) {
                const targetY = Math.max(0, targetAnchor.getBoundingClientRect().top + window.scrollY - 70);
                window.scrollTo({ top: targetY, behavior: 'instant' });
                handleNavScroll();
            }
        }
    }
    if (window.location.hash) {
        setTimeout(scrollToHashTarget, 20);
        window.addEventListener('load', scrollToHashTarget);
    }

    // 4. Menú Dropdown
    const dropdownContainers = document.querySelectorAll('.nav-dropdown');
    let activeCloseTimer = null;
    let activeOpenTimer = null;

    dropdownContainers.forEach((dropdown) => {
        const btn = dropdown.querySelector('.nav-dropdown-btn');

        function openThis() {
            clearTimeout(activeCloseTimer);
            clearTimeout(activeOpenTimer);
            dropdownContainers.forEach((d) => {
                if (d !== dropdown) d.classList.remove('is-open');
            });
            dropdown.classList.add('is-open');
        }

        function closeThis() {
            clearTimeout(activeCloseTimer);
            clearTimeout(activeOpenTimer);
            dropdown.classList.remove('is-open');
        }

        if (btn) {
            btn.addEventListener('click', (e) => {
                const isMobile = window.matchMedia('(max-width: 900px)').matches;
                if (isMobile) {
                    const isOpen = dropdown.classList.contains('is-open');
                    dropdownContainers.forEach((d) => d.classList.remove('is-open'));
                    if (!isOpen) {
                        e.preventDefault();
                        dropdown.classList.add('is-open');
                    }
                } else {
                    if (dropdown.classList.contains('is-open')) {
                        closeThis();
                    } else {
                        openThis();
                    }
                }
            });
        }

        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(activeCloseTimer);
            activeOpenTimer = setTimeout(openThis, 50);
        });

        dropdown.addEventListener('mouseleave', () => {
            clearTimeout(activeOpenTimer);
            activeCloseTimer = setTimeout(closeThis, 850);
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            clearTimeout(activeCloseTimer);
            clearTimeout(activeOpenTimer);
            dropdownContainers.forEach((d) => d.classList.remove('is-open'));
        }
    });

    // 5. Polaroid Slideshow (granja.html)
    let polaroidInterval = null;
    function initPolaroid() {
        if (polaroidInterval) {
            clearInterval(polaroidInterval);
            polaroidInterval = null;
        }

        const visuals = document.querySelectorAll('.polaroid-img');
        const caption = document.querySelector('.polaroid-caption');

        if (visuals.length > 0) {
            let currentIndex = 0;
            if (caption && visuals[0].getAttribute('title')) {
                caption.innerText = visuals[0].getAttribute('title');
            }

            polaroidInterval = setInterval(() => {
                visuals[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % visuals.length;
                visuals[currentIndex].classList.add('active');

                if (caption) {
                    const newTitle = visuals[currentIndex].getAttribute('title');
                    if (newTitle) caption.innerText = newTitle;
                }
            }, 4000);
        }
    }

    // 5b. Post-it Slider
    function initPostitSlider() {
        const postitCards = document.querySelectorAll('.postit-card');
        if (!postitCards.length) return;

        postitCards.forEach(card => {
            const slides = card.querySelectorAll('.postit-slide');
            if (!slides.length) return;

            const parent = card.closest('.home-hero-visual, .editorial-visual, .granja-visuals') || card.parentElement;
            const captionEl = card.querySelector('.postit-caption') || parent.querySelector('.postit-caption');
            const counterEl = card.querySelector('.postit-counter') || parent.querySelector('.postit-counter');
            const prevBtn = card.querySelector('.postit-arrow-btn[data-action="prev"], #postit-prev, .postit-prev') || parent.querySelector('.postit-arrow-btn[data-action="prev"], #postit-prev, .postit-prev');
            const nextBtn = card.querySelector('.postit-arrow-btn[data-action="next"], #postit-next, .postit-next') || parent.querySelector('.postit-arrow-btn[data-action="next"], #postit-next, .postit-next');

            let currentIndex = 0;
            const totalSlides = slides.length;

            function updateSlide(index) {
                slides.forEach((s, idx) => {
                    s.classList.toggle('active', idx === index);
                });

                if (captionEl) {
                    const newCaption = slides[index].getAttribute('data-caption') || slides[index].getAttribute('alt') || '';
                    captionEl.style.opacity = '0';
                    setTimeout(() => {
                        captionEl.textContent = newCaption;
                        captionEl.style.opacity = '1';
                    }, 150);
                }

                if (counterEl) {
                    const curStr = String(index + 1).padStart(2, '0');
                    const totStr = String(totalSlides).padStart(2, '0');
                    counterEl.textContent = `${curStr} / ${totStr}`;
                }
            }

            if (prevBtn) {
                prevBtn.onclick = (e) => {
                    e.preventDefault();
                    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                    updateSlide(currentIndex);
                };
            }

            if (nextBtn) {
                nextBtn.onclick = (e) => {
                    e.preventDefault();
                    currentIndex = (currentIndex + 1) % totalSlides;
                    updateSlide(currentIndex);
                };
            }

            updateSlide(0);
        });
    }

    // 6. Mapa con Leaflet (index.html)
    let leafletMapInstance = null;
    let isMapFullscreen = false;

    function initLeafletMap() {
        const osmContainer = document.getElementById('osm-map');
        if (!osmContainer) return;

        isMapFullscreen = false;
        document.body.classList.remove('map-fullscreen-active');
        osmContainer.classList.remove('is-fullscreen');

        if (leafletMapInstance) {
            try { leafletMapInstance.remove(); } catch (err) { /* ignore */ }
            leafletMapInstance = null;
        }

        try {
            const mapCoords = [41.055714517046276, -3.6072308811227165];
            const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window && window.innerWidth <= 768);

            leafletMapInstance = L.map('osm-map', {
                center: mapCoords,
                zoom: 15,
                dragging: !isMobile,
                touchZoom: true,
                scrollWheelZoom: !isMobile,
                doubleClickZoom: true,
                boxZoom: !isMobile,
                keyboard: !isMobile,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(leafletMapInstance);

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: '<div class="custom-pin-marker"><span>🥚</span></div>',
                iconSize: [44, 44],
                iconAnchor: [22, 44],
                popupAnchor: [0, -44]
            });

            const marker = L.marker(mapCoords, { icon: customIcon }).addTo(leafletMapInstance);
            const popupContent = `
                <div class="map-popup-card">
                    <h4>GRANJA LIBREAVEDRIO</h4>
                    <p class="popup-sub">Piñuécar-Gandullas, Sierra Norte de Madrid</p>
                    <a href="https://maps.app.goo.gl/9y5j3v7y2z1" target="_blank" rel="noopener" class="popup-link">
                        Abrir en Google Maps &rarr;
                    </a>
                </div>
            `;
            marker.bindPopup(popupContent);

            const fsBtn = document.getElementById('map-fullscreen-btn');
            if (fsBtn) {
                L.DomEvent.disableClickPropagation(fsBtn);
                fsBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMapFullscreen();
                };
            }

            function toggleMapFullscreen() {
                isMapFullscreen = !isMapFullscreen;
                osmContainer.classList.toggle('is-fullscreen', isMapFullscreen);
                document.body.classList.toggle('map-fullscreen-active', isMapFullscreen);

                if (isMapFullscreen) {
                    leafletMapInstance.dragging.enable();
                    leafletMapInstance.touchZoom.enable();
                    leafletMapInstance.scrollWheelZoom.enable();
                    if (fsBtn) {
                        fsBtn.innerHTML = '<span class="fs-icon">✕</span> <span class="fs-text">CERRAR PANTALLA COMPLETA</span>';
                        fsBtn.setAttribute('aria-label', 'Cerrar pantalla completa');
                    }
                } else {
                    const currentlyMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window && window.innerWidth <= 768);
                    if (currentlyMobile) {
                        leafletMapInstance.dragging.disable();
                        leafletMapInstance.scrollWheelZoom.disable();
                    } else {
                        leafletMapInstance.dragging.enable();
                        leafletMapInstance.scrollWheelZoom.enable();
                    }
                    if (fsBtn) {
                        fsBtn.innerHTML = '<span class="fs-icon">⤢</span> <span class="fs-text">AMPLIAR MAPA</span>';
                        fsBtn.setAttribute('aria-label', 'Ampliar mapa a pantalla completa');
                    }
                }

                setTimeout(() => {
                    leafletMapInstance.invalidateSize();
                }, 100);
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isMapFullscreen) {
                    toggleMapFullscreen();
                }
            });

            window.addEventListener('resize', () => {
                if (!leafletMapInstance) return;
                const mobileNow = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window && window.innerWidth <= 768);
                if (!isMapFullscreen) {
                    if (mobileNow) {
                        leafletMapInstance.dragging.disable();
                        leafletMapInstance.scrollWheelZoom.disable();
                    } else {
                        leafletMapInstance.dragging.enable();
                        leafletMapInstance.scrollWheelZoom.enable();
                    }
                }
                leafletMapInstance.invalidateSize();
            });

        } catch (err) {
            console.error('Error initializing Leaflet map:', err);
        }
    }

    // 7. Formulario de Contacto
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const formSuccess = document.getElementById('form-success');
        const formError = document.getElementById('form-status-error');
        const submitBtn = document.getElementById('submit-button');
        const resetBtn = document.getElementById('reset-form');
        const phoneInput = document.getElementById('tel');

        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const prefix = '+34 ';
                if (!e.target.value.startsWith(prefix)) {
                    e.target.value = prefix;
                }
                const numbersOnly = e.target.value.substring(prefix.length).replace(/\D/g, '');
                e.target.value = prefix + numbersOnly.substring(0, 9);
            });
        }

        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const data = new FormData(event.target);

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'ENVIANDO...';
                }
                if (formError) formError.style.display = 'none';

                try {
                    const response = await fetch(event.target.action, {
                        method: form.method,
                        body: data,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        form.style.display = 'none';
                        if (formSuccess) formSuccess.style.display = 'block';
                        form.reset();
                    } else {
                        if (formError) {
                            formError.innerText = 'Huy, algo ha ido mal. Por favor, inténtalo de nuevo.';
                            formError.style.display = 'block';
                        }
                    }
                } catch (error) {
                    if (formError) {
                        formError.innerText = 'Error de conexión. Revisa tu red e inténtalo de nuevo.';
                        formError.style.display = 'block';
                    }
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'ENVIAR EN UN CLIC';
                    }
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (formSuccess) formSuccess.style.display = 'none';
                if (form) form.style.display = 'flex';
                if (formError) formError.style.display = 'none';
                if (phoneInput) phoneInput.value = '+34 ';
            });
        }
    }

    // 8. Alineación de Subtítulo y Cinta Adhesiva de Postits
    if (document.fonts) {
        document.fonts.ready.then(alignLogoSubtitle);
    }
    const logoObserver = new ResizeObserver(() => alignLogoSubtitle());
    document.querySelectorAll('.logo-wrapper').forEach((w) => logoObserver.observe(w));
    window.addEventListener('resize', alignLogoSubtitle);

    function applyOrganicTapeTilt() {
        const tapes = document.querySelectorAll('.postit-tape');
        tapes.forEach((tape, i) => {
            const baseSign = (i % 2 === 0) ? -1 : 1;
            const magnitude = 1.2 + Math.random() * 2.2;
            const angle = (baseSign * magnitude).toFixed(1);
            tape.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        });
    }

    // 9. Contacto - Revelar Email y Teléfono (Protección anti-spam)
    function initContactReveal() {
        const revealBtn = document.getElementById('reveal-contact-btn');
        const contactDetails = document.getElementById('protected-contact-details');
        const revealWrapper = document.getElementById('contact-reveal-wrapper');
        const emailLink = document.getElementById('protected-email-link');
        const phoneLink = document.getElementById('protected-phone-link');

        if (!revealBtn || !contactDetails || !emailLink || !phoneLink) return;

        const emailUser = 'granjalibreavedrio';
        const emailDomain = 'gmail.com';
        const phoneRaw = '697475149';
        const phoneDisplay = '697 47 51 49';

        revealBtn.addEventListener('click', () => {
            const emailFull = `${emailUser}@${emailDomain}`;
            emailLink.href = `mailto:${emailFull}`;
            emailLink.textContent = emailFull;

            phoneLink.href = `tel:+34${phoneRaw}`;
            phoneLink.textContent = phoneDisplay;

            revealWrapper.style.display = 'none';
            contactDetails.style.display = 'block';
        });
    }

    // Inicializador global de componentes por página
    function initPageFeatures() {
        initLeafletMap();
        initPolaroid();
        initPostitSlider();
        initContactForm();
        initContactReveal();
        alignLogoSubtitle();
        applyOrganicTapeTilt();
    }
    initPageFeatures();

    // Scroll to Top en logo de footer
    document.addEventListener('click', (e) => {
        if (e.target.closest('#footer-logo-top')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // 10. Navegación Client-Side (SPA suave sin parpadeos)
    function updateActiveNav(targetFile) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (!href) return;
            const itemFile = getPageFileName(href);
            item.classList.toggle('active', itemFile === targetFile);
        });

        const dropdownBtn = document.querySelector('.nav-dropdown-btn');
        if (dropdownBtn) {
            const isSubDropdownPage = targetFile === 'historia.html' || targetFile === 'principios.html';
            dropdownBtn.classList.toggle('active', isSubDropdownPage);
        }

        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            const href = item.getAttribute('href');
            if (!href) return;
            const itemFile = getPageFileName(href);
            item.classList.toggle('active', itemFile === targetFile);
        });
    }

    let isNavigating = false;
    async function navigateTo(url, pushState = true) {
        const currentFile = getPageFileName(window.location.href);
        const targetFile = getPageFileName(url);

        if (currentFile === targetFile && !url.includes('#')) {
            return;
        }

        if (isNavigating) return;
        isNavigating = true;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');

            if (newMain && currentMain) {
                dropdownContainers.forEach((d) => d.classList.remove('is-open'));

                if (leafletMapInstance) {
                    try { leafletMapInstance.remove(); } catch (e) { /* ignore */ }
                    leafletMapInstance = null;
                }
                if (polaroidInterval) {
                    clearInterval(polaroidInterval);
                    polaroidInterval = null;
                }

                currentMain.style.transition = 'opacity 0.14s ease';
                currentMain.style.opacity = '0';

                setTimeout(() => {
                    currentMain.innerHTML = newMain.innerHTML;
                    document.title = doc.title;
                    updateActiveNav(targetFile);
                    advanceHeroSlide();

                    if (pushState) {
                        window.history.pushState(null, doc.title, url);
                    }

                    const hashIndex = url.indexOf('#');
                    if (hashIndex !== -1) {
                        const hash = url.substring(hashIndex);
                        const targetAnchor = document.querySelector(hash);
                        if (targetAnchor) {
                            const targetY = Math.max(0, targetAnchor.getBoundingClientRect().top + window.scrollY - 70);
                            window.scrollTo({ top: targetY, behavior: 'instant' });
                        } else {
                            window.scrollTo({ top: 0, behavior: 'instant' });
                        }
                    } else {
                        window.scrollTo({ top: 0, behavior: 'instant' });
                    }
                    handleNavScroll();

                    initPageFeatures();
                    currentMain.style.opacity = '1';
                    isNavigating = false;
                }, 140);
            } else {
                window.location.href = url;
            }
        } catch (err) {
            console.warn('Fallback navigation:', err);
            window.location.href = url;
        }
    }

    // Interceptar clicks de navegación
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        if (
            link.target === '_blank' ||
            href.startsWith('http://') ||
            href.startsWith('https://') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('javascript:')
        ) {
            return;
        }

        if (href.startsWith('#')) {
            const targetEl = document.querySelector(href);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        const currentFile = getPageFileName(window.location.href);
        const targetFile = getPageFileName(href);

        const isLogoClick = !!link.closest('.logo-link');
        const replayIntroOnLogo = isLogoClick && getCssConfigBool('--logo-click-replay-intro', false);

        // Clic en el logo con animación configurada:
        if (isLogoClick && replayIntroOnLogo) {
            e.preventDefault();
            triggerLogoReplaySequence(href, updateActiveNav, initPageFeatures);
            return;
        }

        // Si es la misma página sin ser logo:
        if (currentFile === targetFile && !href.includes('#')) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        navigateTo(href, true);
    });

    window.addEventListener('popstate', () => {
        navigateTo(window.location.href, false);
    });
});
