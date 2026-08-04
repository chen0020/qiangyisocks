(function () {
  'use strict';

  /* Mobile nav */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('mainnav');
  if (burger && nav) {
    burger.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  /* Scroll reveal */
  var items = document.querySelectorAll('.rv');
  if (items.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Anchor offset for sticky header */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* Newsletter signup */
  var form = document.getElementById('signupForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('signupEmail');
      if (!email || !email.value) return;
      form.innerHTML = '<p style="font-weight:700;font-size:.95rem;margin:0 auto">Thanks — catalog is on its way to ' + email.value + '</p>';
    });
  }

  /* Inquiry form (contact page) */
  var inquiry = document.getElementById('inquiryForm');
  if (inquiry) {
    inquiry.addEventListener('submit', function (e) {
      var action = inquiry.getAttribute('action') || '';
      if (action.indexOf('your-form-id') === -1) return;
      e.preventDefault();
      var ok = true;
      ['name', 'company', 'email', 'product', 'quantity'].forEach(function (id) {
        var f = document.getElementById(id);
        if (f && !f.value) { ok = false; f.style.borderColor = '#e53935'; setTimeout(function () { f.style.borderColor = ''; }, 2000); }
      });
      if (!ok) { alert('Please fill in all required fields.'); return; }
      inquiry.style.display = 'none';
      var box = document.createElement('div');
      box.style.cssText = 'padding:44px 24px;background:#f3f3f2;border-radius:6px;text-align:center';
      box.innerHTML = '<h3 style="font-weight:900;text-transform:uppercase;margin-bottom:10px">Inquiry Sent</h3><p style="color:#6b6b6b">We will reply within 4 hours. For a faster response, message us on <a href="https://wa.me/8618875899527" style="text-decoration:underline">WhatsApp</a>.</p>';
      inquiry.parentNode.insertBefore(box, inquiry.nextSibling);
    });
  }

})();
