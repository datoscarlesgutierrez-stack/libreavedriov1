import './style.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

document.addEventListener('DOMContentLoaded', () => {
    // Permitir reiniciar intro o rotación con ?intro=reset en la URL
    if (new URLSearchParams(window.location.search).get('intro') === 'reset') {
        sessionStorage.removeItem('intro_seen');
        sessionStorage.removeItem('hero_slide_index');
    }

    // 1. Hero Background: Rotación entre fotos de bosque_ empezando por una aleatoria en la sesión
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        const savedIndex = sessionStorage.getItem('hero_slide_index');
        let currentIndex;

        if (savedIndex === null || isNaN(parseInt(savedIndex, 10))) {
            // Primera imagen de la sesión: elegimos una aleatoria entre las fotos de bosque_
            currentIndex = Math.floor(Math.random() * heroSlides.length);
        } else {
            currentIndex = parseInt(savedIndex, 10) % heroSlides.length;
        }

        // Asignamos la imagen correspondiente a esta página
        heroSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });

        // Preparamos el índice de la siguiente imagen
        const nextIndex = (currentIndex + 1) % heroSlides.length;
        sessionStorage.setItem('hero_slide_index', nextIndex.toString());
    }

    // 2. Cinematic Initial Intro Animation (Solo en la primera visita a la Home en la sesión)
    const heroIntro = document.querySelector('.hero-intro');
    const isHomePage =
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('/');

    const introSeen = sessionStorage.getItem('intro_seen');

    if (isHomePage && !introSeen && heroIntro) {
        // Step 0: Full image only (100vh), logo & buttons hidden
        heroIntro.classList.add('is-animating');

        // Step 1: Logo appears at 800ms
        setTimeout(() => {
            heroIntro.classList.add('step-logo');
            alignLogoSubtitle();
        }, 800);

        // Step 2: Hero shrinks to configured height at 1800ms
        setTimeout(() => {
            heroIntro.classList.add('step-shrink');
            setTimeout(alignLogoSubtitle, 900);
        }, 1800);

        // Step 3: Buttons appear one by one at 2700ms
        setTimeout(() => {
            heroIntro.classList.add('step-buttons');
        }, 2700);

        // Step 4: Animation finished at 3600ms, mark as seen
        setTimeout(() => {
            heroIntro.classList.remove('is-animating', 'step-logo', 'step-shrink', 'step-buttons');
            sessionStorage.setItem('intro_seen', 'true');
            alignLogoSubtitle();
        }, 3600);
    }

    // 3. Sticky Nav Behavior on Scroll
    const nav = document.getElementById('main-nav');
    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (heroIntro && nav) {
            const heroBottom = heroIntro.offsetTop + heroIntro.offsetHeight - 65;
            if (scrollY >= heroBottom) {
                nav.classList.add('is-sticky');
            } else {
                nav.classList.remove('is-sticky');
            }
        }
    }
    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll();

    // 4. Dropdown Menu — Apertura rápida (50ms) y margen amplio de cierre (850ms)
    const dropdownContainers = document.querySelectorAll('.nav-dropdown');
    let activeCloseTimer = null;
    let activeOpenTimer = null;

    dropdownContainers.forEach((dropdown) => {
        const btn = dropdown.querySelector('.nav-dropdown-btn');

        function openThis() {
            clearTimeout(activeCloseTimer);
            clearTimeout(activeOpenTimer);
            // Cierra inmediatamente los otros dropdowns al abrir uno nuevo
            dropdownContainers.forEach((d) => {
                if (d !== dropdown) d.classList.remove('is-open');
            });
            dropdown.classList.add('is-open');
        }

        function closeThis() {
            clearTimeout(activeOpenTimer);
            dropdown.classList.remove('is-open');
        }

        // Click: toggle inmediato
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                clearTimeout(activeCloseTimer);
                clearTimeout(activeOpenTimer);
                const isOpen = dropdown.classList.contains('is-open');
                dropdownContainers.forEach((d) => d.classList.remove('is-open'));
                if (!isOpen) dropdown.classList.add('is-open');
            });
        }

        // Hover entrar: si ya había otro abierto abre al instante (0ms), si no abre muy rápido (50ms)
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(activeCloseTimer);
            const anyOpen = Array.from(dropdownContainers).some((d) => d.classList.contains('is-open'));
            if (anyOpen) {
                // Al cambiar entre dropdowns, el anterior se cierra y este se abre de inmediato
                openThis();
            } else {
                activeOpenTimer = setTimeout(openThis, 50);
            }
        });

        // Hover salir: tiempo de gracia amplio (850ms) para que no se cierre rápido
        dropdown.addEventListener('mouseleave', () => {
            clearTimeout(activeOpenTimer);
            activeCloseTimer = setTimeout(closeThis, 850);
        });
    });

    // Cierra al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            clearTimeout(activeCloseTimer);
            clearTimeout(activeOpenTimer);
            dropdownContainers.forEach((d) => d.classList.remove('is-open'));
        }
    });

    // 5. Polaroid Slideshow (On granja.html)
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

    // 5b. Post-it Card Slider interactivo con flechas y contador
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

            // Estado inicial
            updateSlide(0);
        });
    }

    // 6. OpenStreetMap with Leaflet (On index.html)
    let leafletMapInstance = null;
    let isMapFullscreen = false;

    function initLeafletMap() {
        const osmContainer = document.getElementById('osm-map');
        if (!osmContainer) return;

        // Reset previo
        isMapFullscreen = false;
        document.body.classList.remove('map-fullscreen-active');
        osmContainer.classList.remove('is-fullscreen');

        if (leafletMapInstance) {
            try {
                leafletMapInstance.remove();
            } catch (err) {
                console.warn(err);
            }
            leafletMapInstance = null;
        }

        try {
            const mapCoords = [41.055714517046276, -3.6072308811227165];
            const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window && window.innerWidth <= 768);

            leafletMapInstance = L.map('osm-map', {
                center: mapCoords,
                zoom: 15,
                dragging: !isMobile,        // Escritorio: libre total. Móvil: bloqueado para no estorbar el scroll
                touchZoom: true,            // Móvil: permite pinch-to-zoom con dos dedos
                scrollWheelZoom: !isMobile, // Escritorio: zoom con rueda. Móvil: desactivado
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
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -32]
            });

            const marker = L.marker(mapCoords, { icon: customIcon }).addTo(leafletMapInstance);

            const popupContent = `
                <div class="map-popup-card">
                    <h4>Granja Libreavedrio</h4>
                    <p>Piñuécar-Gandullas, Madrid</p>
                    <a href="https://www.google.com/maps?q=${mapCoords[0]},${mapCoords[1]}" target="_blank" rel="noopener" class="popup-link">Abrir en Google Maps</a>
                </div>
            `;
            marker.bindPopup(popupContent);

            // Botón Fullscreen integrado en el mapa
            const fsBtn = document.getElementById('map-fullscreen-toggle');
            if (fsBtn) {
                // Evitamos que los clicks en el botón se propaguen al mapa
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
                    // En pantalla completa: LIBERTAD TOTAL DE MOVIMIENTO en móvil y escritorio
                    leafletMapInstance.dragging.enable();
                    leafletMapInstance.touchZoom.enable();
                    leafletMapInstance.scrollWheelZoom.enable();

                    if (fsBtn) {
                        fsBtn.innerHTML = '<span class="fs-icon">✕</span> <span class="fs-text">CERRAR PANTALLA COMPLETA</span>';
                        fsBtn.setAttribute('aria-label', 'Cerrar pantalla completa');
                    }
                } else {
                    // Al volver a la vista embebida: si es móvil, re-bloqueamos el arrastre para el scroll seguro
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

            // Tecla Escape para salir de fullscreen
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isMapFullscreen) {
                    toggleMapFullscreen();
                }
            });

            // Ajuste al redimensionar ventana
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

    // 7. Contact Form (On contacto.html)
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
                        headers: {
                            'Accept': 'application/json'
                        }
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

    // 8. Ajuste exacto del subtítulo: siempre en una sola línea y con el mismo ancho exacto del logo
    function alignLogoSubtitle() {
        const wrappers = document.querySelectorAll('.logo-wrapper');
        wrappers.forEach((wrapper) => {
            const logo = wrapper.querySelector('.main-logo-graphic');
            const subtitle = wrapper.querySelector('.logo-subtitle');
            if (!logo || !subtitle) return;

            const targetWidth = logo.getBoundingClientRect().width;
            if (targetWidth <= 20) return;

            // Reset: sin letter-spacing ni font-size inline para medir el texto en estado natural
            subtitle.style.letterSpacing = '0px';
            subtitle.style.fontSize = '';

            // Medimos el ancho REAL del texto usando Range (evita el problema de scrollWidth
            // en elementos con width:100% que devuelve el ancho del contenedor, no del texto)
            const range = document.createRange();
            range.selectNodeContents(subtitle);
            const rawWidth = range.getBoundingClientRect().width;

            const text = (subtitle.textContent || '').trim();
            const charCount = text.length;

            if (charCount > 1 && rawWidth > 0) {
                const diff = targetWidth - rawWidth;
                if (diff >= 0) {
                    // letter-spacing CSS añade espacio tras CADA carácter incluyendo el último,
                    // por eso dividimos entre charCount (no charCount-1) para que el texto
                    // llegue exactamente al borde derecho sin desbordarse.
                    const perChar = diff / charCount;
                    subtitle.style.letterSpacing = perChar.toFixed(3) + 'px';
                } else {
                    // Texto más ancho que el logo (pantallas muy estrechas): reducir fuente
                    const scale = targetWidth / rawWidth;
                    const baseFont = parseFloat(window.getComputedStyle(subtitle).fontSize);
                    subtitle.style.fontSize = (baseFont * scale * 0.98).toFixed(2) + 'px';
                    subtitle.style.letterSpacing = '0px';
                }
            }
        });
    }

    if (document.fonts) {
        document.fonts.ready.then(alignLogoSubtitle);
    }
    const logoObserver = new ResizeObserver(() => {
        alignLogoSubtitle();
    });
    document.querySelectorAll('.logo-wrapper').forEach((w) => logoObserver.observe(w));
    window.addEventListener('resize', alignLogoSubtitle);

    // Aplicar inclinación orgánica y aleatoria casera a los celos de los postits
    function applyOrganicTapeTilt() {
        const tapes = document.querySelectorAll('.postit-tape');
        tapes.forEach((tape, i) => {
            // Genera una inclinación entre 1.2° y 3.5° hacia la izquierda o derecha
            const baseSign = (i % 2 === 0) ? -1 : 1;
            const magnitude = 1.2 + Math.random() * 2.2;
            const angle = (baseSign * magnitude).toFixed(1);
            tape.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        });
    }

    // Inicializar funciones de página
    function initPageFeatures() {
        initLeafletMap();
        initPolaroid();
        initPostitSlider();
        initContactForm();
        alignLogoSubtitle();
        applyOrganicTapeTilt();
    }
    initPageFeatures();

    // 8. Footer Logo Scroll to Top
    document.addEventListener('click', (e) => {
        if (e.target.closest('#footer-logo-top')) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // 9. NAVEGACIÓN CLIENT-SIDE (Cero parpadeo, cabecera y botones 100% estáticos)
    function getPageFileName(urlStr) {
        try {
            const url = new URL(urlStr, window.location.href);
            const path = url.pathname;
            const file = path.split('/').pop() || 'index.html';
            return file;
        } catch {
            return '';
        }
    }

    function updateActiveNav(targetFile) {
        const isTargetHome = targetFile === 'index.html' || targetFile === '';
        
        // Actualizar items de menú principal
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (!href) return;
            const itemFile = getPageFileName(href);
            item.classList.toggle('active', itemFile === targetFile);
        });

        // Actualizar botón dropdown ¿QUIÉNES SOMOS?
        const dropdownBtn = document.querySelector('.nav-dropdown-btn');
        if (dropdownBtn) {
            const isSubDropdownPage = targetFile === 'historia.html' || targetFile === 'principios.html';
            dropdownBtn.classList.toggle('active', isSubDropdownPage);
        }

        // Actualizar items dentro del dropdown
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            const href = item.getAttribute('href');
            if (!href) return;
            const itemFile = getPageFileName(href);
            item.classList.toggle('active', itemFile === targetFile);
        });
    }

    function advanceHeroSlide() {
        const slides = document.querySelectorAll('.hero-slide');
        if (!slides.length) return;
        let currentIdx = -1;
        slides.forEach((slide, i) => {
            if (slide.classList.contains('active')) currentIdx = i;
        });
        if (currentIdx === -1) currentIdx = 0;
        const nextIdx = (currentIdx + 1) % slides.length;
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === nextIdx);
        });
        sessionStorage.setItem('hero_slide_index', ((nextIdx + 1) % slides.length).toString());
    }

    let isNavigating = false;
    async function navigateTo(url, pushState = true) {
        const currentFile = getPageFileName(window.location.href);
        const targetFile = getPageFileName(url);

        // Si es la misma página: ¡absolutamente nada que hacer! Cero parpadeo
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
                // Cerrar cualquier dropdown abierto
                dropdownContainers.forEach((d) => d.classList.remove('is-open'));

                // Limpieza de Leaflet y polaroid anteriores
                if (leafletMapInstance) {
                    try { leafletMapInstance.remove(); } catch (e) { /* ignore */ }
                    leafletMapInstance = null;
                }
                if (polaroidInterval) {
                    clearInterval(polaroidInterval);
                    polaroidInterval = null;
                }

                // Transición suave y rápida de contenido (solo el main cambia, el header se queda intacto)
                currentMain.style.transition = 'opacity 0.14s ease';
                currentMain.style.opacity = '0';

                setTimeout(() => {
                    currentMain.innerHTML = newMain.innerHTML;
                    document.title = doc.title;
                    updateActiveNav(targetFile);

                    // Transición de imagen del hero con fade
                    advanceHeroSlide();

                    if (pushState) {
                        window.history.pushState(null, doc.title, url);
                    }

                    window.scrollTo({ top: 0, behavior: 'instant' });
                    handleNavScroll();

                    // Re-inicializar componentes
                    initPageFeatures();

                    currentMain.style.opacity = '1';
                    isNavigating = false;
                }, 140);
            } else {
                window.location.href = url;
            }
        } catch (err) {
            console.warn('Fallback standard navigation:', err);
            window.location.href = url;
        }
    }

    // Interceptar clicks de navegación
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Enlaces externos o especiales
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

        // Ancla en la misma página
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

        // Si es la misma página (ej: click en "LA GRANJA" estando en la granja)
        if (currentFile === targetFile && !href.includes('#')) {
            e.preventDefault();
            // ¡No hacer nada! Cero parpadeo
            return;
        }

        // Navegación suave sin recarga de cabecera
        e.preventDefault();
        navigateTo(href, true);
    });

    // Soporte para botones Atrás/Adelante del navegador
    window.addEventListener('popstate', () => {
        navigateTo(window.location.href, false);
    });
});
