// Nav overlay
var navOverlay = document.getElementById('navOverlay');
document.getElementById('navTrigger').addEventListener('click', function () {
  navOverlay.classList.add('open');
});
document.getElementById('navClose').addEventListener('click', function () {
  navOverlay.classList.remove('open');
});
document.querySelectorAll('[data-navlink]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    navOverlay.classList.remove('open');
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

// Generative hero graphic — dots traveling along the signal path
var sgPath = document.getElementById('sgPath');
var sgDots = document.getElementById('sgDots');
if (sgPath && sgDots) {
  var pathLength = sgPath.getTotalLength();
  var dotCount = 3;
  var dots = [];
  for (var i = 0; i < dotCount; i++) {
    var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', i === 0 ? '5' : '3');
    dot.setAttribute('class', 'sg-dot');
    dot.style.opacity = i === 0 ? '1' : '0.35';
    sgDots.appendChild(dot);
    dots.push({ el: dot, offset: i / dotCount });
  }
  var startTime = null;
  var duration = 5200;
  function animateDots(ts) {
    if (!startTime) startTime = ts;
    var elapsed = (ts - startTime) % duration;
    var progress = elapsed / duration;
    dots.forEach(function (d) {
      var p = (progress + d.offset) % 1;
      var point = sgPath.getPointAtLength(p * pathLength);
      d.el.setAttribute('cx', point.x);
      d.el.setAttribute('cy', point.y);
    });
    requestAnimationFrame(animateDots);
  }
  requestAnimationFrame(animateDots);
}

// Practice rows — subtle stagger on scroll handled by .rv already

// Results horizontal track — allow drag-to-scroll on desktop
var track = document.getElementById('resultsTrack');
if (track) {
  var isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', function (e) {
    isDown = true;
    track.style.cursor = 'grabbing';
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', function () { isDown = false; track.style.cursor = 'grab'; });
  track.addEventListener('mouseup', function () { isDown = false; track.style.cursor = 'grab'; });
  track.addEventListener('mousemove', function (e) {
    if (!isDown) return;
    e.preventDefault();
    var x = e.pageX - track.offsetLeft;
    var walk = (x - startX) * 1.2;
    track.scrollLeft = scrollLeft - walk;
  });
  track.style.cursor = 'grab';
}
