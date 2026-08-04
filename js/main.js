(function(){
  'use strict';

  // Mobile menu
  var toggle=document.getElementById('menuToggle'),nav=document.getElementById('nav');
  if(toggle&&nav){toggle.addEventListener('click',function(){nav.classList.toggle('open')});nav.querySelectorAll('a').forEach(function(l){l.addEventListener('click',function(){nav.classList.remove('open')})})}

  // Scroll reveal
  var reveals=document.querySelectorAll('.reveal');
  if(reveals.length&&'IntersectionObserver'in window){var obs=new IntersectionObserver(function(e){e.forEach(function(en){if(en.isIntersecting){en.target.classList.add('visible');obs.unobserve(en.target)}})},{threshold:0.1,rootMargin:'0px 0px -30px 0px'});reveals.forEach(function(el){obs.observe(el)})}else{reveals.forEach(function(el){el.classList.add('visible')})}

  // Active nav
  (function(){var c=window.location.pathname.split('/').pop()||'index.html';if(c==='')c='index.html';document.querySelectorAll('.nav a').forEach(function(l){var h=l.getAttribute('href');if(h===c||(c==='index.html'&&h==='/'))l.classList.add('active')})})();

})();
