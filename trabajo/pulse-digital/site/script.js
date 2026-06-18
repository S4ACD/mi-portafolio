document.getElementById('burger').addEventListener('click', function () {
  document.getElementById('mobileMenu').classList.toggle('open');
});
document.querySelectorAll('#mobileMenu a').forEach(function (a) {
  a.addEventListener('click', function () {
    document.getElementById('mobileMenu').classList.remove('open');
  });
});

var obs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.rv').forEach(function (el) { obs.observe(el); });
