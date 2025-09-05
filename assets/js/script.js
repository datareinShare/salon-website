
// ===== Salon Website - All-in-One Script (fixed mobile menu + duplicate removal) =====
document.addEventListener('DOMContentLoaded', () => {
  // Remove duplicate hamburger icons (keep the first)
  const toggles = document.querySelectorAll('.mobile-menu-toggle');
  if (toggles.length > 1) {
    toggles.forEach((el, i) => { if (i > 0) el.remove(); });
  }

  // -------------------- Hero Slider --------------------
  const slides = document.querySelectorAll('.hero-slide');
  const navBtns = document.querySelectorAll('.hero-nav-btn');
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    navBtns.forEach(b => b.classList.remove('active'));
    if (slides[index]) slides[index].classList.add('active');
    if (navBtns[index]) navBtns[index].classList.add('active');
  }

  function nextSlide() {
    if (slides.length === 0) return;
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  if (slides.length > 0) {
    showSlide(currentSlide);
    // Auto slide
    setInterval(nextSlide, 5000);
    // Manual nav
    navBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        currentSlide = i;
        showSlide(currentSlide);
      });
    });
  }

  // -------------------- Robust Mobile Menu --------------------
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const menuBtn = document.querySelector('.mobile-menu-toggle');

  // Ensure we have a computed header height CSS var
  const setHeaderHeightVar = () => {
    const h = header ? header.offsetHeight : 64;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  };
  setHeaderHeightVar();

  // Ensure menu is closed on first load (prevents "stuck open" states)
  const setMenuOpen = (open) => {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('active', open);
    menuBtn.classList.toggle('active', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };
  setMenuOpen(false);

  // Toggle handlers (click + touch for iOS Safari reliability)
  const toggleMenu = (e) => {
    if (e && e.type === 'touchstart') e.preventDefault(); // avoid 300ms delay / ghost click
    setHeaderHeightVar();
    const isOpen = nav.classList.contains('active');
    setMenuOpen(!isOpen);
  };
  if (menuBtn && nav) {
    // Improve accessibility even if it's a <div>
    menuBtn.setAttribute('role', 'button');
    menuBtn.setAttribute('tabindex', '0');
    menuBtn.setAttribute('aria-controls', 'site-nav');

    menuBtn.addEventListener('click', toggleMenu, { passive: true });
    menuBtn.addEventListener('touchstart', toggleMenu, { passive: false });

    // Close menu when clicking a link
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        setMenuOpen(false);
      }
    });

    // Keyboard support
    menuBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu(e);
      }
    });

    // Resize guard (switching to desktop width should reset the menu)
    window.addEventListener('resize', () => {
      setHeaderHeightVar();
      if (window.innerWidth > 768) setMenuOpen(false);
    });
  }

  // -------------------- Smooth Scroll (in-page anchors only) --------------------
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setMenuOpen(false); // close if opened on mobile
    });
  });

  // -------------------- Header background on scroll --------------------
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 100) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // -------------------- FAQ Accordion --------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // -------------------- Animate-in on view --------------------
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('animate-in');
    });
  }, { root: null, rootMargin: '0px', threshold: 0.1 });

  document.querySelectorAll('.improvement-card, .flow-step, .menu-card, .feature-card')
    .forEach(el => observer.observe(el));

  // -------------------- Simple Form Validation --------------------
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      const required = form.querySelectorAll('[required]');
      let ok = true;
      required.forEach(field => {
        if (!String(field.value || '').trim()) {
          field.classList.add('error');
          ok = false;
        } else {
          field.classList.remove('error');
        }
      });
      if (!ok) {
        e.preventDefault();
        alert('未入力の必須項目があります。ご確認ください。');
      }
    });
  });
});

// -------------------- CSS Injection (mobile menu + small UX polish) --------------------
(() => {
  const style = document.createElement('style');
  style.setAttribute('data-injected-by', 'salon-script');
  style.textContent = `
  /* Mobile menu presentation */
  @media (max-width: 768px) {
    .nav { display: none; }
    .nav.active {
      display: block;
      position: fixed;
      top: var(--header-h, 64px);
      left: 0;
      right: 0;
      background: #fff;
      box-shadow: 0 8px 24px rgba(0,0,0,.12);
      padding: 1.25rem 1.5rem;
      z-index: 1001; /* above .header (z-index:1000) */
    }
    .nav.active .nav-list {
      flex-direction: column;
      gap: 1rem;
    }

    /* Button -> X animation (works for the current <div> structure) */
    .mobile-menu-toggle.active span:nth-child(1){ transform: rotate(45deg) translate(5px, 5px); }
    .mobile-menu-toggle.active span:nth-child(2){ opacity: 0; }
    .mobile-menu-toggle.active span:nth-child(3){ transform: rotate(-45deg) translate(7px, -6px); }

    /* Lock body scroll when menu is open */
    body.menu-open { overflow: hidden; }
  }
  `;
  document.head.appendChild(style);
})();
