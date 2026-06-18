// Mobile menu
document.getElementById('burger').addEventListener('click', function () {
  document.getElementById('mobileMenu').classList.toggle('open');
});
document.querySelectorAll('#mobileMenu a').forEach(function (a) {
  a.addEventListener('click', function () {
    document.getElementById('mobileMenu').classList.remove('open');
  });
});

// Scroll reveal
var obs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.rv').forEach(function (el) { obs.observe(el); });

// Custom cursor — annotation mark
var cursor = document.getElementById('cursorMark');
var cx = 0, cy = 0, rx = 0, ry = 0;
if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', function (e) {
    cx = e.clientX; cy = e.clientY;
    cursor.classList.add('show');
  });
  document.addEventListener('mouseleave', function () { cursor.classList.remove('show'); });
  (function loop() {
    rx += (cx - rx) * 0.18;
    ry += (cy - ry) * 0.18;
    cursor.style.left = rx + 'px';
    cursor.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, .docket-item, .dep-dot').forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursor.classList.add('big'); });
    el.addEventListener('mouseleave', function () { cursor.classList.remove('big'); });
  });
}

// Live folio date/time stamp
var folioTime = document.getElementById('folioTime');
function updateFolio() {
  var d = new Date();
  var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  folioTime.textContent = months[d.getMonth()] + ' ' + d.getFullYear() + ' REPORT';
}
updateFolio();

// Count-up numbers in the cover ledger
var ledgerRows = document.querySelectorAll('.ledger-row');
var countedOnce = false;
var ledgerObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting && !countedOnce) {
      countedOnce = true;
      ledgerRows.forEach(function (row) {
        var target = parseFloat(row.getAttribute('data-target'));
        var decimals = parseInt(row.getAttribute('data-decimal') || '0', 10);
        var numEl = row.querySelector('[data-count]');
        var start = 0;
        var duration = 1400;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = start + (target - start) * eased;
          numEl.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current);
          if (progress < 1) requestAnimationFrame(step);
          else numEl.textContent = decimals > 0 ? target.toFixed(decimals) : target;
        }
        requestAnimationFrame(step);
      });
    }
  });
}, { threshold: 0.4 });
var ledgerSection = document.querySelector('.cover-ledger');
if (ledgerSection) ledgerObs.observe(ledgerSection);

// Animate ledger-table bars on scroll
var ltRows = document.querySelectorAll('.lt-row:not(.lt-head)');
var ltObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      ltObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
ltRows.forEach(function (row) { ltObs.observe(row); });

// Testimonial rotator
var testimonials = [
  { text: "Pulse Digital was the first agency that told us a channel wasn't working before we noticed it ourselves. That's a strange thing to be grateful for, but we are.", name: "Diane Holt", role: "VP Marketing, Verdant Foods Co." },
  { text: "We've worked with three agencies before this one. Pulse Digital is the only team that sent a report we didn't have to translate for our CFO.", name: "Marcus Ibe", role: "Founder, Meridian Outfitters" },
  { text: "Our cost per acquisition dropped within the first quarter, and it stayed down. That's the part most agencies can't manage.", name: "Renata Solis", role: "Head of Growth, Northbound" }
];
document.querySelectorAll('.dep-dot').forEach(function (dot) {
  dot.addEventListener('click', function () {
    var i = parseInt(dot.getAttribute('data-i'), 10);
    document.getElementById('tstText').textContent = testimonials[i].text;
    document.getElementById('tstName').textContent = testimonials[i].name;
    document.getElementById('tstRole').textContent = testimonials[i].role;
    document.querySelectorAll('.dep-dot').forEach(function (d) { d.classList.remove('active'); });
    dot.classList.add('active');
  });
});
