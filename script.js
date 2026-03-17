(function () {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    // ── CURSOR ──
    const dot = $('#cursorDot');
    const ring = $('#cursorRing');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px';
    });
    (function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    })();
    $$('a, button, .service-card, .why-box, .badge, .nav-link, .tcard, .faq-toggle').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });

    // ── NAV STICKY ──
    const nav = $('#nav');
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));

    // ── SMOOTH NAV ──
    $$('[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    // ── MATRIX CANVAS ──
    const canvas = $('#matrixCanvas');
    const ctx = canvas.getContext('2d');
    const GREEN = '#00ffff', PINKISH = '#9500ffff', ORANGE = '#ffa347ff';
    const FONT_SIZE = 13;
    const CHARS = '01アイウエオカキクケコTECRATABCDEF0123456789!@#$%^&*<>/\\;:';

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    let columns = Math.floor(canvas.width / FONT_SIZE);
    let drops = Array(columns).fill(1);

    function drawMatrix() {
        ctx.fillStyle = 'rgba(2,4,8,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drops.forEach((y, i) => {
            const char = CHARS[Math.floor(Math.random() * CHARS.length)];
            ctx.fillStyle = Math.random() > 0.98 ? PINKISH : GREEN;
            ctx.font = FONT_SIZE + 'px "Share Tech Mono", monospace';
            ctx.fillText(char, i * FONT_SIZE, y * FONT_SIZE);
            if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }
    window.addEventListener('resize', () => {
        resizeCanvas();
        columns = Math.floor(canvas.width / FONT_SIZE);
        drops = Array(columns).fill(1);
    });
    setInterval(drawMatrix, 40);

    // ── TYPEWRITER ──
    const phrases = [
        'Building reliable digital solutions...',
        'Delivering quality web and app experiences...',
        'Focused on performance and user experience.',
        'Transforming your ideas into reality.',
        'Creating modern web services...',
        'Your partner in digital growth.',
    ];
    const typeEl = $('#typeText');
    let pIdx = 0, cIdx = 0, deleting = false, pauseTick = 0;

    function typeWriter() {
        const phrase = phrases[pIdx];
        if (pauseTick > 0) { pauseTick--; setTimeout(typeWriter, 80); return; }
        if (!deleting) {
            typeEl.textContent = phrase.substring(0, cIdx + 1); cIdx++;
            if (cIdx === phrase.length) { pauseTick = 22; deleting = true; }
            setTimeout(typeWriter, 70);
        } else {
            typeEl.textContent = phrase.substring(0, cIdx - 1); cIdx--;
            if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; pauseTick = 8; }
            setTimeout(typeWriter, 40);
        }
    }
    typeWriter();

    // ── COUNTER (Why Us stats) ──
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const step = 16, total = Math.ceil(1800 / step);
        let tick = 0;
        const timer = setInterval(() => {
            tick++;
            el.textContent = Math.round(target * easeOut(tick / total));
            if (tick >= total) { el.textContent = target; clearInterval(timer); }
        }, step);
    }

    // Trigger counters when Why Us section enters viewport
    let whyCountersRan = false;
    const whySection = $('#why-us');
    if (whySection) {
        const whyObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !whyCountersRan) {
                whyCountersRan = true;
                $$('.why-stat-num').forEach(el => animateCounter(el));
            }
        }, { threshold: 0.3 });
        whyObserver.observe(whySection);
    }

    // ── SCROLL REVEAL ──
    const revealTargets = $$(
        '.section-title, .section-label, .about-text, .about-badges, .terminal-window, ' +
        'contact-desc, .contact-info, .contact-form-wrap, .section-sub, ' +
        '.why-stat-item, .why-stats-row, .tcard'
    );
    const revealCards = $$('.service-card, .why-box');

    revealTargets.forEach(el => el.classList.add('reveal'));
    revealCards.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.setProperty('--i', i % 3);
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    [...revealTargets, ...revealCards].forEach(el => observer.observe(el));

    // ── ACTIVE NAV ──
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');
    const secObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.getAttribute('id');
                navLinks.forEach(l => {
                    l.style.color = l.getAttribute('href') === '#' + id ? 'var(--green)' : '';
                });
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => secObserver.observe(s));

    // ── FORM ──
    const sendBtn = $('#sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const inputs = $$('.form-input');
            const ok = [...inputs].every(i => i.value.trim() !== '');
            if (!ok) {
                sendBtn.style.background = 'var(--orange)';
                sendBtn.innerHTML = '<span class="btn-border"></span>FILL ALL FIELDS ✕';
                setTimeout(() => { sendBtn.style.background = ''; sendBtn.innerHTML = '<span class="btn-border"></span>TRANSMIT →'; }, 2000);
                return;
            }
            sendBtn.style.background = 'var(--green)';
            sendBtn.innerHTML = '<span class="btn-border"></span>SIGNAL SENT ✓';
            sendBtn.style.color = 'var(--bg)';
            inputs.forEach(i => i.value = '');
            setTimeout(() => { sendBtn.style.background = ''; sendBtn.style.color = ''; sendBtn.innerHTML = '<span class="btn-border"></span>TRANSMIT →'; }, 3000);
        });
    }

    // ── FAQ ACCORDION ──
    const faqItems = $$('.faq-item.accordion');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-toggle');
        const content = item.querySelector('.faq-content');
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // close all
            faqItems.forEach(fi => {
                fi.classList.remove('active');
                fi.querySelector('.faq-content').style.maxHeight = null;
            });
            // open clicked if it wasn't open
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // ── SERVICE CARD MOUSE GLOW ──
    $$('.service-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width * 100) + '%');
            card.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height * 100) + '%');
        });
    });

    // ── GLITCH LOGO ──
    $$('.glitch').forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.animation = 'none';
            requestAnimationFrame(() => { el.style.animation = ''; });
        });
    });

    // ── CONSOLE EGG ──
    console.log('%c TECRAT ', 'background:#00ffff;color:#020408;font-weight:900;font-size:2rem;padding:0.5rem 1rem;');
    console.log('%c We build the future. tecrat001@gmail.com ', 'color:#00ffff;font-size:0.9rem;');

})();