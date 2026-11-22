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

    // 5b. Post-it Slider con soporte Touch & Drag (swipe / arrastrar izquierda-derecha)
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
            const imageContainer = card.querySelector('.postit-image-container') || card;

            let currentIndex = 0;
            const totalSlides = slides.length;

            if (totalSlides > 1) {
                card.classList.add('has-multiple-slides');
            }

            // ==========================================
            // Gestos Swipe y Drag & Drop (Touch + Mouse)
            // Permite ver la foto siguiente/anterior en tiempo real al arrastrar
            // ==========================================
            let isAnimating = false;
            let currentDragCard = null; // Control para drag de ratón por tarjeta

            function applySlideClasses(activeIdx) {
                slides.forEach((s, idx) => {
                    const isActive = idx === activeIdx;
                    s.classList.toggle('active', isActive);
                    s.classList.remove('is-incoming');
                    s.style.transform = '';
                    s.style.transition = '';
                    s.style.opacity = '';
                    s.style.zIndex = isActive ? '2' : '1';
                });
            }

            function updateSlide(index, direction = 0) {
                if (isAnimating) return;

                if (direction === 0) {
                    applySlideClasses(index);
                } else {
                    isAnimating = true;
                    const prevIndex = (direction > 0)
                        ? (index - 1 + totalSlides) % totalSlides
                        : (index + 1) % totalSlides;
                    const currentEl = slides[prevIndex];
                    const nextEl = slides[index];

                    slides.forEach((s, idx) => {
                        if (idx !== prevIndex && idx !== index) {
                            s.classList.remove('active', 'is-incoming');
                            s.style.transform = '';
                            s.style.transition = '';
                            s.style.opacity = '0';
                            s.style.zIndex = '0';
                        }
                    });

                    currentEl.classList.add('active');
                    currentEl.style.zIndex = '2';
                    currentEl.style.opacity = '1';
                    currentEl.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
                    currentEl.style.transform = direction > 0 ? 'translateX(-100%)' : 'translateX(100%)';

                    nextEl.classList.add('is-incoming');
                    nextEl.style.zIndex = '3';
                    nextEl.style.opacity = '1';
                    nextEl.style.transition = 'none';
                    nextEl.style.transform = direction > 0 ? 'translateX(100%)' : 'translateX(-100%)';
                    // Forzar reflow
                    void nextEl.offsetWidth;

                    nextEl.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
                    nextEl.style.transform = 'translateX(0)';

                    setTimeout(() => {
                        applySlideClasses(index);
                        isAnimating = false;
                    }, 320);
                }

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

            function goToPrev() {
                if (isAnimating) return;
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateSlide(currentIndex, -1);
            }

            function goToNext() {
                if (isAnimating) return;
                currentIndex = (currentIndex + 1) % totalSlides;
                updateSlide(currentIndex, 1);
            }

            if (prevBtn) {
                prevBtn.onclick = (e) => {
                    e.preventDefault();
                    goToPrev();
                };
            }

            if (nextBtn) {
                nextBtn.onclick = (e) => {
                    e.preventDefault();
                    goToNext();
                };
            }

            if (totalSlides > 1 && imageContainer) {
                let startX = 0;
                let startY = 0;
                let currentX = 0;
                let currentY = 0;
                let isDragging = false;
                let isHorizontal = null;
                let incomingSlide = null;
                let targetIncomingIndex = -1;

                function getActiveSlide() {
                    return slides[currentIndex];
                }

                function resetDragStyles() {
                    slides.forEach((s, idx) => {
                        s.classList.remove('is-incoming');
                        s.classList.toggle('active', idx === currentIndex);
                        s.style.transform = '';
                        s.style.transition = '';
                        s.style.opacity = '';
                        s.style.zIndex = idx === currentIndex ? '2' : '1';
                    });
                    incomingSlide = null;
                    targetIncomingIndex = -1;
                }

                function onDragMove(diffX) {
                    const activeSlide = getActiveSlide();
                    if (!activeSlide) return;

                    const containerWidth = imageContainer.offsetWidth || 300;

                    let newIncomingIndex = -1;
                    if (diffX < 0) {
                        newIncomingIndex = (currentIndex + 1) % totalSlides;
                    } else if (diffX > 0) {
                        newIncomingIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                    }

                    if (newIncomingIndex !== targetIncomingIndex) {
                        if (incomingSlide) {
                            incomingSlide.classList.remove('is-incoming');
                            incomingSlide.style.transform = '';
                            incomingSlide.style.transition = '';
                            incomingSlide.style.opacity = '';
                            incomingSlide.style.zIndex = '1';
                        }
                        targetIncomingIndex = newIncomingIndex;
                        if (targetIncomingIndex >= 0 && targetIncomingIndex !== currentIndex) {
                            incomingSlide = slides[targetIncomingIndex];
                            incomingSlide.classList.add('is-incoming');
                            incomingSlide.style.transition = 'none';
                            incomingSlide.style.opacity = '1';
                            incomingSlide.style.zIndex = '3';
                        } else {
                            incomingSlide = null;
                        }
                    }

                    activeSlide.style.transition = 'none';
                    activeSlide.style.transform = `translateX(${diffX}px)`;
                    activeSlide.style.zIndex = '2';

                    if (incomingSlide) {
                        const offset = diffX < 0 ? containerWidth + diffX : -containerWidth + diffX;
                        incomingSlide.style.transform = `translateX(${offset}px)`;
                    }
                }

                function onDragEnd() {
                    if (!isDragging) return;
                    isDragging = false;
                    currentDragCard = null;
                    card.classList.remove('is-dragging');

                    const diffX = currentX - startX;
                    const containerWidth = imageContainer.offsetWidth || 300;
                    const threshold = Math.min(45, containerWidth * 0.15);

                    const activeSlide = getActiveSlide();

                    if (isHorizontal && Math.abs(diffX) >= threshold && incomingSlide && targetIncomingIndex >= 0) {
                        isAnimating = true;
                        const toNext = diffX < 0;
                        const targetIndex = targetIncomingIndex;

                        activeSlide.style.transition = 'transform 0.25s ease-out';
                        activeSlide.style.transform = toNext ? `translateX(${-containerWidth}px)` : `translateX(${containerWidth}px)`;

                        incomingSlide.style.transition = 'transform 0.25s ease-out';
                        incomingSlide.style.transform = 'translateX(0px)';

                        setTimeout(() => {
                            currentIndex = targetIndex;
                            resetDragStyles();
                            isAnimating = false;

                            if (captionEl) {
                                const newCaption = slides[currentIndex].getAttribute('data-caption') || slides[currentIndex].getAttribute('alt') || '';
                                captionEl.textContent = newCaption;
                            }
                            if (counterEl) {
                                const curStr = String(currentIndex + 1).padStart(2, '0');
                                const totStr = String(totalSlides).padStart(2, '0');
                                counterEl.textContent = `${curStr} / ${totStr}`;
                            }
                        }, 260);
                    } else {
                        // Cancelar arrastre, volver a posición original
                        if (activeSlide) {
                            activeSlide.style.transition = 'transform 0.2s ease-out';
                            activeSlide.style.transform = 'translateX(0px)';
                        }
                        if (incomingSlide) {
                            incomingSlide.style.transition = 'transform 0.2s ease-out';
                            const targetOffset = diffX < 0 ? containerWidth : -containerWidth;
                            incomingSlide.style.transform = `translateX(${targetOffset}px)`;
                        }

                        setTimeout(() => {
                            resetDragStyles();
                        }, 210);
                    }

                    isHorizontal = null;
                }

                // Touch Events (Mobile)
                imageContainer.addEventListener('touchstart', (e) => {
                    if (isAnimating || e.touches.length !== 1) return;
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                    currentX = startX;
                    currentY = startY;
                    isDragging = true;
                    isHorizontal = null;
                    incomingSlide = null;
                    targetIncomingIndex = -1;
                }, { passive: true });

                imageContainer.addEventListener('touchmove', (e) => {
                    if (!isDragging || e.touches.length !== 1) return;
                    currentX = e.touches[0].clientX;
                    currentY = e.touches[0].clientY;
                    const diffX = currentX - startX;
                    const diffY = currentY - startY;

                    if (isHorizontal === null) {
                        if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
                            isHorizontal = Math.abs(diffX) > Math.abs(diffY);
                        }
                    }

                    if (isHorizontal) {
                        onDragMove(diffX);
                    }
                }, { passive: true });

                imageContainer.addEventListener('touchend', () => {
                    if (isDragging) onDragEnd();
                });

                imageContainer.addEventListener('touchcancel', () => {
                    if (isDragging) {
                        isDragging = false;
                        isHorizontal = null;
                        resetDragStyles();
                    }
                });

                // Mouse Events (Desktop Drag & Drop)
                imageContainer.addEventListener('mousedown', (e) => {
                    if (isAnimating || e.button !== 0) return;
                    startX = e.clientX;
                    currentX = startX;
                    isDragging = true;
                    isHorizontal = true;
                    currentDragCard = card;
                    incomingSlide = null;
                    targetIncomingIndex = -1;
                    card.classList.add('is-dragging');
                    e.preventDefault();
                });

                window.addEventListener('mousemove', (e) => {
                    if (!isDragging || currentDragCard !== card) return;
                    currentX = e.clientX;
                    const diffX = currentX - startX;
                    onDragMove(diffX);
                });

                window.addEventListener('mouseup', () => {
                    if (isDragging && currentDragCard === card) onDragEnd();
                });
            }

            // Estado inicial
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
            // Detectar dispositivo táctil / móvil con precisión (incluyendo apaisado/landscape)
            function isTouchOrMobileDevice() {
                return (
                    'ontouchstart' in window ||
                    navigator.maxTouchPoints > 0 ||
                    window.matchMedia('(pointer: coarse)').matches ||
                    window.matchMedia('(max-width: 900px)').matches
                );
            }

            const isTouch = isTouchOrMobileDevice();

            leafletMapInstance = L.map('osm-map', {
                center: mapCoords,
                zoom: 15,
                zoomControl: false, // Desactivamos el zoom por defecto arriba a la izquierda para ponerlo abajo
                dragging: !isTouch,
                touchZoom: true,
                scrollWheelZoom: !isTouch,
                doubleClickZoom: true,
                boxZoom: !isTouch,
                keyboard: !isTouch,
            });

            // Colocar los botones de zoom (+ / -) en la esquina inferior izquierda
            L.control.zoom({
                position: 'bottomleft'
            }).addTo(leafletMapInstance);

            // Atribución y prefijo de Leaflet configurables desde config.css
            const mapPrefix = (getComputedStyle(document.documentElement).getPropertyValue('--map-prefix-attribution') || '').trim().replace(/^['"]|['"]$/g, '');
            const mapAttr = (getComputedStyle(document.documentElement).getPropertyValue('--map-attribution') || '').trim().replace(/^['"]|['"]$/g, '');

            if (leafletMapInstance.attributionControl) {
                leafletMapInstance.attributionControl.setPrefix(mapPrefix ? mapPrefix : false);
            }

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: mapAttr || false,
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
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapCoords[0]},${mapCoords[1]}`;

            const computedRoot = getComputedStyle(document.documentElement);
            const popupTitle = (computedRoot.getPropertyValue('--map-popup-title') || '').trim().replace(/^['"]|['"]$/g, '') || 'GRANJA LIBREAVEDRIO';
            const popupSubtitle = (computedRoot.getPropertyValue('--map-popup-subtitle') || '').trim().replace(/^['"]|['"]$/g, '') || 'Piñuécar-Gandullas, Sierra Norte';
            const popupBtnText = (computedRoot.getPropertyValue('--map-popup-btn-text') || '').trim().replace(/^['"]|['"]$/g, '') || 'Abrir en Google Maps &rarr;';

            const popupContent = `
                <div class="map-popup-card">
                    <h4>${popupTitle}</h4>
                    <p class="popup-sub">${popupSubtitle}</p>
                    <a href="${googleMapsUrl}" target="_blank" rel="noopener" class="popup-link">
                        ${popupBtnText}
                    </a>
                </div>
            `;
            marker.bindPopup(popupContent, {
                maxWidth: 240,
                minWidth: 160,
                autoPan: true,
                autoPanPadding: [15, 15]
            });

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
                    const currentlyTouch = isTouchOrMobileDevice();
                    if (currentlyTouch) {
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
                const touchNow = isTouchOrMobileDevice();
                if (!isMapFullscreen) {
                    if (touchNow) {
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

    // 9. Contacto - Revelar Email y Teléfono (Protección anti-spam con soporte click y touch)
    function initContactReveal() {
        const handleReveal = (e) => {
            const btn = e.target.closest('.btn-reveal-contact');
            if (!btn) return;
            const wrapper = btn.closest('.protected-contact-wrapper');
            if (!wrapper || wrapper.dataset.revealed === 'true') return;

            e.preventDefault();
            wrapper.dataset.revealed = 'true';
            const type = wrapper.getAttribute('data-type');
            const c1 = wrapper.getAttribute('data-chunk1') || '';
            const c2 = wrapper.getAttribute('data-chunk2') || '';
            let decoded = '';
            try {
                decoded = atob(c1) + atob(c2);
            } catch (err) {
                console.error('Error decoding contact info:', err);
                return;
            }

            let contentHtml = '';
            if (type === 'phone') {
                const raw = wrapper.getAttribute('data-raw') ? atob(wrapper.getAttribute('data-raw')) : decoded.replace(/\s+/g, '');
                const cleanNum = raw.replace(/\D/g, ''); // 34626887384
                const telLink = `tel:${raw}`;
                const waLink = `https://wa.me/${cleanNum}`;
                const tgLink = `https://t.me/+${cleanNum}`;
                const signalLink = `https://signal.me/#p/+${cleanNum}`;

                contentHtml = `
                    <div class="revealed-phone-block">
                        <a href="${telLink}" class="contact-revealed-link" title="Llamar">${decoded}</a>
                        <div class="contact-apps-row">
                            <a href="${waLink}" target="_blank" rel="noopener" class="contact-app-badge wa" title="Abrir en WhatsApp">
                                💬 WhatsApp
                            </a>
                            <a href="${tgLink}" target="_blank" rel="noopener" class="contact-app-badge tg" title="Abrir en Telegram">
                                ✈️ Telegram
                            </a>
                            <a href="${signalLink}" target="_blank" rel="noopener" class="contact-app-badge signal" title="Abrir en Signal">
                                🔒 Signal
                            </a>
                        </div>
                    </div>
                `;
            } else if (type === 'email') {
                contentHtml = `
                    <span class="revealed-contact-box">
                        <a href="mailto:${decoded}" class="contact-revealed-link">${decoded}</a>
                    </span>
                `;
            }

            wrapper.innerHTML = contentHtml;
        };

        // Event delegation global: funciona tanto al entrar directamente como navegando por SPA
        document.removeEventListener('click', handleReveal);
        document.addEventListener('click', handleReveal);
    }

    // 8. Textos de Footer configurables desde config.css
    function applyFooterConfig() {
        const computed = getComputedStyle(document.documentElement);
        const textLeft = (computed.getPropertyValue('--footer-text-left') || '').trim().replace(/^['"]|['"]$/g, '');
        const textRight = (computed.getPropertyValue('--footer-text-right') || '').trim().replace(/^['"]|['"]$/g, '');

        if (textLeft) {
            const leftEl = document.querySelector('.footer-col-left .footer-item');
            if (leftEl) leftEl.textContent = textLeft;
        }

        if (textRight) {
            const rightEl = document.querySelector('.footer-col-right .footer-item');
            if (rightEl) rightEl.textContent = textRight;
        }
    }

    // Inicializador global de componentes por página
    function initPageFeatures() {
        initLeafletMap();
        initPolaroid();
        initPostitSlider();
        initContactForm();
        initContactReveal();
        applyFooterConfig();
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
