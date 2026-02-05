import './style.css'

document.addEventListener('DOMContentLoaded', () => {
    // Footer Logo Scroll Info
    const footerLogo = document.getElementById('footer-logo-top');
    if (footerLogo) {
        footerLogo.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Scroll Spy for Nav Items
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');

    // Config offset for sticky header match with CSS scroll-margin-top
    const scrollOffsetVar = getComputedStyle(document.documentElement).getPropertyValue('--scroll-offset').trim();
    const offset = parseInt(scrollOffsetVar) || 140;

    function highlightNav() {
        let scrollY = window.scrollY;
        let currentSectionId = '';

        // Get actual header height to use as offset dynamically
        const header = document.querySelector('.sticky-nav');
        const dynamicOffset = header ? header.offsetHeight + 30 : offset;

        sections.forEach(current => {
            const sectionTop = current.offsetTop - dynamicOffset;
            const sectionBottom = sectionTop + current.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                currentSectionId = current.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            item.classList.remove('active');
            if (currentSectionId && href && href.endsWith('#' + currentSectionId)) {
                item.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNav);

    // Polaroid Slideshow
    const visuals = document.querySelectorAll('.polaroid-img');
    const caption = document.querySelector('.polaroid-caption');

    if (visuals.length > 0) {
        let currentIndex = 0;

        // Initial set (just in case HTML static doesn't match)
        if (caption && visuals[0].getAttribute('title')) {
            caption.innerText = visuals[0].getAttribute('title');
        }

        setInterval(() => {
            visuals[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % visuals.length;
            visuals[currentIndex].classList.add('active');

            // Update caption
            if (caption) {
                const newTitle = visuals[currentIndex].getAttribute('title');
                if (newTitle) caption.innerText = newTitle;
            }
        }, 4000); // Change every 4 seconds
    }

    // AJAX Form Submission
    const form = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const formError = document.getElementById('form-status-error');
    const submitBtn = document.getElementById('submit-button');
    const resetBtn = document.getElementById('reset-form');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const data = new FormData(event.target);

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerText = 'ENVIANDO...';
            formError.style.display = 'none';

            try {
                const response = await fetch(event.target.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Hide form and show success
                    form.style.display = 'none';
                    formSuccess.style.display = 'block';
                    form.reset();
                } else {
                    formError.innerText = "Huy, algo ha ido mal. Por favor, inténtalo de nuevo.";
                    formError.style.display = 'block';
                }
            } catch (error) {
                formError.innerText = "Error de conexión. Revisa tu red e inténtalo de nuevo.";
                formError.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = 'ENVIAR EN UN CLIC';
            }
        });
    }

    // Phone Prefix Protection
    const phoneInput = document.getElementById('tel');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            const prefix = "+34 ";
            if (!e.target.value.startsWith(prefix)) {
                e.target.value = prefix;
            }
            // Optional: prevent more than 9 digits after prefix
            const numbersOnly = e.target.value.substring(prefix.length).replace(/\D/g, '');
            e.target.value = prefix + numbersOnly.substring(0, 9);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            formSuccess.style.display = 'none';
            form.style.display = 'flex';
            formError.style.display = 'none';
            if (phoneInput) phoneInput.value = "+34 ";
        });
    }

    // Feature Cards Flip Logic
    const flipCards = document.querySelectorAll('.feature-note-inner');
    flipCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling that might trigger multiple flips
            card.classList.toggle('is-flipped');
        });
    });

    // Mobile Scroll Highlight Logic
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '-40% 0% -40% 0%', // Target the center of the screen
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-centered');
                } else {
                    entry.target.classList.remove('is-centered');
                }
            });
        }, observerOptions);

        flipCards.forEach(card => observer.observe(card));
    }
});
