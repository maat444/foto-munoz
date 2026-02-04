// script.js - Archivo principal con todas las funcionalidades integradas

document.addEventListener('DOMContentLoaded', () => {
    console.log('FOTO MUÑOZ - Script inicializado');

    // ============================================
    // 1. CONFIGURACIONES INICIALES
    // ============================================

    // Actualizar año en el footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ============================================
    // 2. ANIMACIÓN "STUDIO PARTICLES" (Canvas JS)
    // ============================================

    const canvas = document.getElementById('studio-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        // Configuración de partículas mejorada
        const particleCount = 40;
        const colors = [
            'rgba(2, 2, 2, 0.45)',
            'rgba(212, 37, 31, 0.1)',
            'rgba(13, 240, 51, 0.1)',
            'rgba(236, 240, 13, 0.1)',
            'rgba(157, 13, 240, 0.25)',
            'rgba(11, 27, 245, 0.26)',
            'rgba(12, 234, 250, 0.24)',
            'rgba(182, 62, 238, 0.27)',   // Color del tema
            'rgba(37, 3, 53, 0.4)'   // Color highlight
        ];

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        class Particle {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * width;
                this.y = initial ? Math.random() * height : height + 10;
                this.size = Math.random() * 25 + 5;
                this.speed = Math.random() * 0.5 + 0.1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.type = Math.random() > 0.5 ? 'circle' : 'square';
                this.opacity = Math.random() * 0.5 + 0.1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
            }

            update() {
                this.x += this.speedX;
                this.y -= this.speed + this.speedY;

                // Movimiento sinusoidal suave
                this.x += Math.sin(this.y * 0.01) * 0.3;

                // Rebotar en los bordes laterales
                if (this.x < 0 || this.x > width) {
                    this.speedX *= -1;
                }

                // Reiniciar si sale por arriba
                if (this.y < -50) {
                    this.reset();
                }

                // Ajustar opacidad según posición
                this.opacity = Math.max(0.05, Math.min(0.3, (this.y / height) * 0.5));
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.beginPath();

                if (this.type === 'circle') {
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                } else {
                    ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                    // movimiento de cuadrados 
                    ctx.translate(this.x, this.y);
                    ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
                    ctx.resetTransform();
                }

                ctx.fill();
                ctx.restore();
            }
        }

        // Variables para control de ciclos de animación
        let isAnimating = true;
        let animationStartTime = Date.now();
        const ANIMATION_DURATION = 20000; // 20 segundos de animación
        const PAUSE_DURATION = 5000; // 5 segundos de pausa
        const FADE_DURATION = 6000;  //6 segundos para fade-out y fade-in

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function clearCanvas() {
            // Limpiar completamente el canvas
            ctx.fillStyle = 'rgba(15, 23, 42, 1)';
            ctx.fillRect(0, 0, width, height);
        }

        function setCanvasFade(opacity) {
            // Aplicar fade usando CSS opacity en el canvas
            canvas.style.opacity = opacity.toString();
            canvas.style.transition = 'opacity 0.1s ease-out';
        }

        function animate() {
            const currentTime = Date.now();
            const elapsedTime = currentTime - animationStartTime;

            if (isAnimating) {
                // Fase de animación (20 segundos)
                if (elapsedTime < ANIMATION_DURATION) {
                    // Calcular opacidad basada en el tiempo
                    let currentOpacity = 1;

                    // Fade-in en los primeros 6 segundos
                    if (elapsedTime <= FADE_DURATION) {
                        currentOpacity = Math.min(1, elapsedTime / FADE_DURATION);
                    }
                    // Fade-out en los últimos 6 segundos
                    else if (elapsedTime >= ANIMATION_DURATION - FADE_DURATION) {
                        const fadeOutProgress = (elapsedTime - (ANIMATION_DURATION - FADE_DURATION)) / FADE_DURATION;
                        currentOpacity = Math.max(0, 1 - fadeOutProgress);
                    }
                    // Opacidad completa en el medio
                    else {
                        currentOpacity = 1;
                    }

                    // Aplicar fade al canvas usando CSS
                    setCanvasFade(currentOpacity);

                    // Fondo semi-transparente para efecto de rastro suave
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
                    ctx.fillRect(0, 0, width, height);

                    // Dibujar partículas normalmente (sin globalAlpha)
                    particles.forEach(p => {
                        p.update();
                        p.draw();
                    });
                } else {
                    // Fin de la animación - fade out completo y pausar
                    setCanvasFade(0);
                    clearCanvas();
                    isAnimating = false;
                    animationStartTime = Date.now();
                }
            } else {
                // Fase de pausa (5 segundos)
                if (elapsedTime >= PAUSE_DURATION) {
                    // Reiniciar animación con fade-in
                    isAnimating = true;
                    animationStartTime = Date.now();
                    initParticles(); // Reiniciar partículas con nuevas posiciones
                    setCanvasFade(0); // Empezar desde 0 para fade-in
                } else {
                    // Mantener el canvas invisible durante la pausa
                    setCanvasFade(0);
                    clearCanvas();
                }
            }

            requestAnimationFrame(animate);
        }


        // Inicializar y manejar resize
        resize();
        initParticles();
        animate();

        window.addEventListener('resize', () => {
            resize();
            initParticles();
        });
    }

    // ============================================
    // 3. NAVBAR SCROLL EFFECT
    // ============================================

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Inicializar estado
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        }
    }

    // ============================================
    // 4. SCROLL SUAVE PARA ENLACES INTERNOS
    // ============================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Cerrar menú móvil si está abierto
                const navbarCollapse = document.querySelector('.navbar-collapse.show');
                if (navbarCollapse) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
            }
        });
    });

    // ============================================
    // 5. ANIMACIÓN DE SCROLL PARA CARDS DE SERVICIOS
    // ============================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Añadir animación de entrada
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);

    // Observar cards de servicios
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        observer.observe(card);
    });

    // Observar otros elementos para animación
    const animateElements = document.querySelectorAll('.section-header, .contact-item, .hero-content-wrapper');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // ============================================
    // 6. BOTÓN SCROLL TO TOP
    // ============================================

    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        // Click handler
        scrollTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // 7. FORMULARIO DE CONTACTO CON EMAILJS
    // ============================================

    setupContactForm();

    // ============================================
    // 8. INTERACTIVIDAD ADICIONAL
    // ============================================

    // Efecto hover en cards de servicios
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        });
    });

    // Efecto en imágenes del carrusel
    const carouselItems = document.querySelectorAll('.carousel-item');
    carouselItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            const img = this.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1.05)';
            }
        });

        item.addEventListener('mouseleave', function () {
            const img = this.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1)';
            }
        });
    });

    // Validación en tiempo real para formularios
    const formInputs = document.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (this.value.trim() === '') {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });

        input.addEventListener('input', function () {
            this.classList.remove('is-invalid', 'is-valid');
        });
    });

    // ============================================
    // 9. PRELOADER (Opcional - puede descomentarse si se necesita)
    // ============================================

    /*
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 500);
        }
    });
    */

    // ============================================
    // 10. DETECCIÓN DE DISPOSITIVO Y AJUSTES
    // ============================================

    function detectDevice() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

        if (isMobile) {
            document.body.classList.add('mobile-device');
            // Ajustar parámetros para móviles
            if (canvas) {
                // Reducir partículas en móviles
                particleCount = 20;
            }
        } else if (isTablet) {
            document.body.classList.add('tablet-device');
        } else {
            document.body.classList.add('desktop-device');
        }
    }

    detectDevice();
    window.addEventListener('resize', detectDevice);

    // ============================================
    // Manejo de imagenes en about-section
    // Configuración: listas de imágenes
    // ============================================
    const imagePaths = [
        "images/foto muñoz empresa1.webp",
        "images/foto muñoz empresa2.webp",
        "images/foto muñoz empresa3.webp",
        "images/foto muñoz empresa4.webp",
        "images/camera front logo.webp",
        "images/flash camera.webp",
        "images/impresión laser.webp"
    ];

    const intervalMs = 4000;
    const imgEl = document.getElementById("about-img");
    let intervalId; // Declarar en ámbito externo

    if (imgEl) {
        let idx = 0;

        // Función para cambiar la imagen
        function cycleImages() {
            // 1. Desvanecer la imagen actual
            imgEl.style.opacity = 0;

            // 2. Esperar a que termine la transición (400ms match CSS)
            setTimeout(() => {
                // 3. Cambiar el source
                idx = (idx + 1) % imagePaths.length;
                imgEl.src = imagePaths[idx];

                // 4. Asegurar que la imagen cargue antes de mostrarla (opcional pero recomendado)
                // Para simplificar y mantener la fluidez, confiamos en la caché local
                // o añadimos un pequeño listener, pero con timeout es suficiente para efecto visual

                // Restaurar opacidad
                imgEl.style.opacity = 1;
            }, 500); // Un poco más que la transición CSS para asegurar
        }

        // Iniciar el intervalo
        intervalId = setInterval(cycleImages, intervalMs);

        // Pausar al pasar el mouse
        imgEl.addEventListener("mouseenter", () => clearInterval(intervalId));
        imgEl.addEventListener("mouseleave", () => {
            clearInterval(intervalId); // Limpiar por si acaso
            intervalId = setInterval(cycleImages, intervalMs);
        });
    }
});

// ============================================
// FUNCIÓN DEL FORMULARIO DE CONTACTO
// ============================================

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');

    if (!contactForm) {
        console.warn('Formulario de contacto no encontrado');
        return;
    }

    // Crear elemento para mensajes
    const formStatus = document.getElementById('form-status');
    let statusElement = formStatus;

    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'form-status';
        statusElement.className = 'mt-3 text-center';
        contactForm.appendChild(statusElement);
    }

    // Validación de email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Mostrar mensaje de estado
    function showFormMessage(message, type = 'success') {
        statusElement.textContent = message;
        statusElement.style.display = 'block';

        switch (type) {
            case 'success':
                statusElement.style.color = '#10b981';
                statusElement.className = 'mt-3 text-center fw-bold success';
                break;
            case 'error':
                statusElement.style.color = '#ef4444';
                statusElement.className = 'mt-3 text-center fw-bold error';
                break;
            case 'info':
                statusElement.style.color = '#3eb6ee';
                statusElement.className = 'mt-3 text-center fw-bold info';
                break;
        }

        // Ocultar después de 5 segundos
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }

    // Estado para prevenir envíos múltiples
    let isSubmitting = false;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (isSubmitting) return;
        isSubmitting = true;

        // Obtener valores
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
        const service = document.getElementById('service') ? document.getElementById('service').value : '';

        // Validaciones
        if (!name || !email || !message) {
            showFormMessage('Por favor, completa todos los campos obligatorios.', 'error');
            isSubmitting = false;
            return;
        }

        if (!isValidEmail(email)) {
            showFormMessage('Por favor, ingresa un correo electrónico válido.', 'error');
            isSubmitting = false;
            return;
        }

        // Botón de envío
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : 'Enviar Mensaje';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Enviando...';
        }

        showFormMessage('Enviando mensaje...', 'info');

        try {
            // Verificar si EmailJS está disponible
            if (typeof emailjs === 'undefined') {
                throw new Error('EmailJS no está disponible');
            }

            // Inicializar EmailJS (si no está inicializado)
            if (!window.emailjsInitialized) {
                emailjs.init("WbZJkQyxs3HslGBAe");
                window.emailjsInitialized = true;
            }

            // Preparar mensaje completo
            let fullMessage = `Nombre: ${name}\nEmail: ${email}\n`;
            if (phone) fullMessage += `Teléfono: ${phone}\n`;
            if (service) fullMessage += `Servicio de interés: ${service}\n`;
            fullMessage += `\nMensaje:\n${message}`;

            // Parámetros para EmailJS
            const templateParams = {
                from_name: name,
                from_email: email,
                from_phone: phone || 'No proporcionado',
                service: service || 'No especificado',
                message: fullMessage,
                to_email: 'compendiocircular8@gmail.com',
                date: new Date().toLocaleDateString('es-ES')
            };

            // Enviar con EmailJS
            const response = await emailjs.send(
                'service_z3psntg',   // Service ID
                'template_tba06be',  // Template ID
                templateParams
            );

            console.log('Email enviado exitosamente:', response);

            // Mostrar éxito
            showFormMessage('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');

            // Resetear formulario
            contactForm.reset();

            // Quitar clases de validación
            const formInputs = contactForm.querySelectorAll('.form-control');
            formInputs.forEach(input => {
                input.classList.remove('is-valid');
            });

        } catch (error) {
            console.error('Error al enviar email:', error);

            let errorMessage = 'Error al enviar el mensaje. Por favor, intenta nuevamente.';

            if (error.status === 0) {
                errorMessage = 'Error de conexión. Verifica tu internet.';
            } else if (error.text) {
                // Intentar extraer mensaje más específico
                try {
                    const errorObj = JSON.parse(error.text);
                    errorMessage = errorObj.message || error.text;
                } catch {
                    errorMessage = error.text;
                }
            }

            showFormMessage(errorMessage, 'error');

            // Fallback: Envío mediante Formspree si EmailJS falla
            console.log('Intentando método alternativo de envío...');

            // Aquí podrías añadir una llamada a Formspree o similar
            // como respaldo si EmailJS falla

        } finally {
            // Restaurar botón
            isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });

    // Validación en tiempo real
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            if (this.value && !isValidEmail(this.value)) {
                this.classList.add('is-invalid');
                showFormMessage('Por favor, ingresa un correo electrónico válido.', 'error');
            } else if (this.value) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    }
}

// ============================================
// 11. POLYFILLS Y COMPATIBILIDAD
// ============================================

// Smooth scroll polyfill para navegadores antiguos
if (!('scrollBehavior' in document.documentElement.style)) {
    import('https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js').then(() => {
        console.log('Smoothscroll polyfill cargado');
    });
}

// Intersection Observer polyfill si es necesario
if (!('IntersectionObserver' in window)) {
    import('https://unpkg.com/intersection-observer@0.12.0/intersection-observer.js').then(() => {
        console.log('IntersectionObserver polyfill cargado');
    });
}

// ============================================
// 12. UTILIDADES GLOBALES
// ============================================

// Función para formatear teléfono
function formatPhoneNumber(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

// Función para validar formulario
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Exportar funciones si es necesario (para módulos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupContactForm,
        formatPhoneNumber,
        validateForm
    };
}