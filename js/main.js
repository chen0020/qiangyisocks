/**
 * Qiangyi Socks — Main JavaScript
 * Scroll animations, counter, FAQ, mobile menu, form handling
 */
(function () {
  'use strict';

  /* ===== Mobile Menu ===== */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    // Close menu on link click
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
      });
    });
  }

  /* ===== Header Scroll Effect ===== */
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  /* ===== Scroll Reveal (Intersection Observer) ===== */
  var reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (reveals.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else if (reveals.length) {
    // Fallback: show all immediately
    reveals.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ===== Counter Animation ===== */
  function animateCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1600;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
          el.classList.add('counted');
        }
      }
      requestAnimationFrame(step);
    });
  }

  // Observe counters when they enter viewport
  var counterSection = document.querySelector('.hero-stats');
  if (counterSection && 'IntersectionObserver' in window) {
    var counterObserved = false;
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counterObserved) {
            counterObserved = true;
            animateCounters();
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterObserver.observe(counterSection);
  } else {
    animateCounters();
  }

  /* ===== FAQ Accordion ===== */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-q');
    if (question) {
      question.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        // Close all
        faqItems.forEach(function (other) {
          other.classList.remove('open');
        });
        // Toggle clicked
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  /* ===== Scroll to Top Button ===== */
  var scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });
  }

  /* ===== Smooth Scroll for Anchor Links ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var headerHeight = header ? header.offsetHeight : 72;
        var position = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top: position, behavior: 'smooth' });
      }
    });
  });

  /* ===== Active Nav Link Highlight ===== */
  (function () {
    var current = window.location.pathname.split('/').pop() || 'index.html';
    if (current === '') current = 'index.html';
    var links = document.querySelectorAll('.nav a');
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === current || (current === 'index.html' && href === '/')) {
        link.classList.add('active');
      }
    });
  })();

  /* ===== Inquiry Form ===== */
  var form = document.getElementById('inquiryForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      var action = form.getAttribute('action');
      if (action && action.indexOf('your-form-id') === -1) return;
      e.preventDefault();

      var required = ['name', 'company', 'email', 'product', 'quantity'];
      var valid = true;
      required.forEach(function (id) {
        var field = document.getElementById(id);
        if (field && !field.value) {
          valid = false;
          field.style.borderColor = 'var(--accent)';
          setTimeout(function () { field.style.borderColor = ''; }, 2000);
        }
      });
      if (!valid) {
        alert('Please fill in all required fields (marked with *).');
        return;
      }

      form.style.display = 'none';
      var success = document.createElement('div');
      success.className = 'form-success';
      success.style.cssText = 'display:block;text-align:center;padding:48px 24px;background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border);';
      success.innerHTML = '<h3 style="color:var(--green);font-size:1.4rem;margin-bottom:12px">✓ Inquiry Sent Successfully!</h3><p style="color:var(--text-muted);margin-bottom:12px">Thank you for reaching out. We will respond within 4 hours.</p><p style="color:var(--text-muted)">You can also reach us directly on <a href="https://wa.me/8618875899527" style="color:var(--accent)">WhatsApp</a> for faster response.</p>';
      form.parentNode.insertBefore(success, form.nextSibling);
    });
  }

  /* ===== Section Label Animation via Observer (subtle) ===== */
  var labels = document.querySelectorAll('.section-label');
  if (labels.length && 'IntersectionObserver' in window) {
    var labelObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            labelObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    labels.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      labelObserver.observe(el);
    });
  }

  /* ===== Trust Bar Items Sequential Reveal ===== */
  var trustItems = document.querySelectorAll('.trust-bar .reveal');
  if (trustItems.length && 'IntersectionObserver' in window) {
    var trustObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            trustObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    trustItems.forEach(function (el) {
      trustObserver.observe(el);
    });
  }

})();
