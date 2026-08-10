// ============================================================
// THC Business Solutions — Main JavaScript
// Stripe-quality animations: scroll reveals, counters, parallax
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- Navbar scroll state ----
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ---- Mobile menu toggle ----
  const toggle = document.querySelector('.nav-mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    const icon = toggle.querySelector('svg');

    function setMenuIcon(open) {
      if (!icon) return;
      icon.innerHTML = open
        ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
        : '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>';
    }

    toggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      setMenuIcon(isOpen);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        setMenuIcon(false);
      });
    });
  }

  // ---- Active nav link ----
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const observerOptions = { threshold: 0.08, rootMargin: '0px 0px -30px 0px' };

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // Individual fade elements
        if (entry.target.classList.contains('fade-in') ||
            entry.target.classList.contains('fade-scale') ||
            entry.target.classList.contains('fade-left') ||
            entry.target.classList.contains('fade-right')) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
        // Stagger groups
        if (entry.target.classList.contains('stagger-group')) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
        // Stat counters
        if (entry.target.classList.contains('stat-value') && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
          revealObserver.unobserve(entry.target);
        }
      }
    });
  }, observerOptions);

  // Observe all animatable elements (reveals, stagger groups, counters)
  document.querySelectorAll('.fade-in, .fade-scale, .fade-left, .fade-right, .stagger-group, .stat-value').forEach(function (el) {
    revealObserver.observe(el);
  });

  // ---- Counter animation ----
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion.matches) {
      el.textContent = target.toLocaleString() + suffix;
      return;
    }
    const duration = Math.min(2000, Math.max(800, target * 3));
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  // Observe stat counters
  document.querySelectorAll('.stat-value').forEach(function (el) {
    revealObserver.observe(el);
  });

  // ---- Gradient mesh parallax on scroll (rAF-throttled) ----
  const meshBg = document.querySelector('.mesh-bg');
  if (meshBg && !prefersReducedMotion.matches) {
    const hero = meshBg.closest('.mesh-hero');
    let ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        if (hero) {
          const rect = hero.getBoundingClientRect();
          const heroTop = rect.top + window.scrollY;
          const relativeScroll = window.scrollY - heroTop;
          if (relativeScroll > -hero.offsetHeight && relativeScroll < hero.offsetHeight) {
            meshBg.style.transform = 'translateY(' + (relativeScroll * 0.15) + 'px)';
          }
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // ---- Business wireframe lazy animation (starts on scroll into view) ----
  const wireframeSvgs = document.querySelectorAll('.wireframe-svg');
  wireframeSvgs.forEach(function (wireframeSvg) {
    const wireframeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          wireframeSvg.classList.add('is-revealed');
          wireframeObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });
    wireframeObserver.observe(wireframeSvg);
  });

  // ---- Tabbed industry fold ----
  const fold = document.querySelector('.industry-fold');
  if (fold) {
    const tabs = Array.from(fold.querySelectorAll('.tab'));
    const panels = Array.from(fold.querySelectorAll('.panel'));

    function selectTab(index) {
      tabs.forEach(function (tab, i) {
        const active = i === index;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
        const panel = panels[i];
        if (panel) panel.classList.toggle('is-active', active);
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { selectTab(index); });
      tab.addEventListener('keydown', function (e) {
        let next = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { next = (index + 1) % tabs.length; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { next = (index - 1 + tabs.length) % tabs.length; }
        if (e.key === 'Home') { next = 0; }
        if (e.key === 'End') { next = tabs.length - 1; }
        if (next >= 0) {
          e.preventDefault();
          selectTab(next);
          tabs[next].focus();
        }
      });
    });

    function currentIndex() {
      const index = tabs.findIndex(function (tab) {
        return tab.getAttribute('aria-selected') === 'true';
      });
      return index > -1 ? index : 0;
    }

    // ---- Swipe navigation (touch devices) ----
    const panelsEl = fold.querySelector('.panels');
    if (panelsEl) {
      let swipeStartX = null;
      let swipeStartY = null;
      panelsEl.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
          swipeStartX = e.touches[0].clientX;
          swipeStartY = e.touches[0].clientY;
        }
      }, { passive: true });
      panelsEl.addEventListener('touchend', function (e) {
        if (swipeStartX === null) { return; }
        const dx = e.changedTouches[0].clientX - swipeStartX;
        const dy = e.changedTouches[0].clientY - swipeStartY;
        swipeStartX = null;
        swipeStartY = null;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) { return; }
        const current = currentIndex();
        const next = dx < 0 ? (current + 1) % tabs.length : (current - 1 + tabs.length) % tabs.length;
        selectTab(next);
        const activeTab = tabs[next];
        if (activeTab && activeTab.scrollIntoView) {
          activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, { passive: true });
    }
  }

  // ---- Glow cards: one delegated mousemove listener (rAF-throttled) ----
  if (!prefersReducedMotion.matches) {
    let glowTicking = false;

    document.addEventListener('mousemove', function (e) {
      const card = e.target.closest ? e.target.closest('.glow-card') : null;
      if (!card || glowTicking) return;
      glowTicking = true;
      requestAnimationFrame(function () {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
        glowTicking = false;
      });
    });
  }

  // ---- Sub-service cards -> dialog popups ----
  let bodyScrollLocked = false;

  function setBodyLock(lock) {
    if (lock && !bodyScrollLocked) {
      document.body.style.overflow = 'hidden';
      bodyScrollLocked = true;
    } else if (!lock && bodyScrollLocked) {
      document.body.style.overflow = '';
      bodyScrollLocked = false;
    }
  }

  const subDialogs = document.querySelectorAll('.sub-dialog');

  subDialogs.forEach(function (dialog) {
    const closeBtn = dialog.querySelector('.sub-dialog__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () { dialog.close(); });
    }
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () { setBodyLock(false); });
  });

  document.querySelectorAll('.sub-card').forEach(function (card) {
    card.addEventListener('click', function () {
      const targetId = card.getAttribute('data-dialog-id');
      if (!targetId) return;
      const dialog = document.getElementById(targetId);
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
        setBodyLock(true);
        const closeBtn = dialog.querySelector('.sub-dialog__close');
        if (closeBtn) closeBtn.focus();
      }
    });
  });
});
