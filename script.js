/* ═══════════════════════════════════════════════════════════════════
   KAISEKI 41°N — Script (Redesigned)
   Vanilla JavaScript — No dependencies
   ═══════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initNavScroll();
        initFullscreenMenu();
        initSmoothScroll();
        initRevealOnScroll();
        initReservationForm();
        initParallax();
    }


    /* ─── 1. Nav scroll state ──────────────────────────────────── */
    function initNavScroll() {
        var nav = document.getElementById('main-nav');
        if (!nav) return;

        function update() {
            if (window.scrollY > 80) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', throttle(update, 60), { passive: true });
        update();
    }


    /* ─── 2. Fullscreen menu overlay ───────────────────────────── */
    function initFullscreenMenu() {
        var hamburger = document.getElementById('nav-hamburger');
        var overlay = document.getElementById('menu-overlay');
        if (!hamburger || !overlay) return;

        hamburger.addEventListener('click', function () {
            var isOpen = overlay.classList.toggle('open');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
            overlay.setAttribute('aria-hidden', !isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';

            // Force nav text to white when menu is open
            var nav = document.getElementById('main-nav');
            if (isOpen) {
                nav.classList.remove('scrolled');
                nav.classList.add('menu-open');
            } else {
                nav.classList.remove('menu-open');
                // Re-apply scroll state
                if (window.scrollY > 80) nav.classList.add('scrolled');
            }
        });

        // Close on link click
        overlay.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                overlay.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                overlay.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                var nav = document.getElementById('main-nav');
                nav.classList.remove('menu-open');
                if (window.scrollY > 80) nav.classList.add('scrolled');
            });
        });
    }


    /* ─── 3. Smooth scroll ─────────────────────────────────────── */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var id = this.getAttribute('href');
                if (id === '#') return;
                var target = document.querySelector(id);
                if (!target) return;

                e.preventDefault();
                var top = target.getBoundingClientRect().top + window.pageYOffset;

                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            });
        });
    }


    /* ─── 4. Reveal on scroll ──────────────────────────────────── */
    function initRevealOnScroll() {
        // Also mark additional items as revealable
        document.querySelectorAll(
            '.text-band-inner, .split-text, .location-block, .quote-band blockquote'
        ).forEach(function (el) {
            if (!el.classList.contains('reveal')) el.classList.add('reveal');
        });

        var allReveals = document.querySelectorAll('.reveal');

        if (!('IntersectionObserver' in window)) {
            allReveals.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // Stagger siblings
                    var parent = entry.target.parentElement;
                    var siblings = parent ? parent.querySelectorAll('.reveal:not(.visible)') : [];
                    var delay = 0;

                    siblings.forEach(function (sib) {
                        if (sib === entry.target || isInView(sib)) {
                            setTimeout(function () { sib.classList.add('visible'); }, delay);
                            delay += 100;
                        }
                    });

                    if (!entry.target.classList.contains('visible')) {
                        entry.target.classList.add('visible');
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        allReveals.forEach(function (el) { observer.observe(el); });
    }

    function isInView(el) {
        var r = el.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
    }


    /* ─── 5. Reservation form ──────────────────────────────────── */
    function initReservationForm() {
        var form = document.getElementById('reservation-form');
        var success = document.getElementById('form-success');
        if (!form || !success) return;

        var dateInput = document.getElementById('guest-date');
        if (dateInput) {
            dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var fields = ['guest-name', 'guest-email', 'guest-date', 'guest-count'];
            var valid = true;

            fields.forEach(function (id) {
                var field = document.getElementById(id);
                if (!field || !field.value.trim()) {
                    field.style.borderColor = '#a0574e';
                    valid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            var email = document.getElementById('guest-email');
            if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                email.style.borderColor = '#a0574e';
                valid = false;
            }

            if (!valid) return;

            // Show success
            var grid = form.querySelector('.res-row');
            if (grid) form.querySelectorAll('.res-row, .res-field--full, .res-submit').forEach(function (el) {
                el.style.display = 'none';
            });
            success.classList.add('active');
        });
    }


    /* ─── 6. Parallax hero ─────────────────────────────────────── */
    function initParallax() {
        var heroImg = document.getElementById('hero-img');
        if (!heroImg || window.innerWidth < 768) return;

        window.addEventListener('scroll', function () {
            requestAnimationFrame(function () {
                var s = window.pageYOffset;
                if (s < window.innerHeight) {
                    heroImg.style.transform = 'scale(' + (1.08 - s * 0.00015) + ') translateY(' + (s * 0.2) + 'px)';
                }
            });
        }, { passive: true });
    }


    /* ─── Util: throttle ───────────────────────────────────────── */
    function throttle(fn, wait) {
        var last = 0;
        return function () {
            var now = Date.now();
            if (now - last >= wait) {
                last = now;
                fn.apply(this, arguments);
            }
        };
    }

})();
