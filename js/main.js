// Mobile menu toggle
(function() {
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Inquiry form handling
  var form = document.getElementById('inquiryForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      // If formspree is configured, let it submit normally.
      // Otherwise, show success message locally.
      var action = form.getAttribute('action');
      if (action && action.indexOf('your-form-id') === -1) {
        return; // Valid formspree endpoint, submit normally
      }
      e.preventDefault();

      // Validate required fields
      var name = document.getElementById('name');
      var company = document.getElementById('company');
      var email = document.getElementById('email');
      var product = document.getElementById('product');
      var quantity = document.getElementById('quantity');

      if (!name.value || !company.value || !email.value || !product.value || !quantity.value) {
        alert('Please fill in all required fields (marked with *).');
        return;
      }

      // Show success
      form.style.display = 'none';
      var success = document.createElement('div');
      success.className = 'form-success';
      success.style.display = 'block';
      success.innerHTML = '<h3>✅ Inquiry Sent Successfully!</h3><p>Thank you for reaching out. We will get back to you within 4 hours.</p><p style="margin-top:12px">You can also reach us directly on WhatsApp for faster response.</p>';
      form.parentNode.insertBefore(success, form.nextSibling);
    });
  }

  // Add active class to current page nav link
  (function() {
    var current = window.location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.nav a');
    links.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href === current || (current === '' && href === '/')) {
        link.classList.add('active');
      }
    });
  })();
})();
