/* "send to x-ray tool": fetch the same-origin demo board and hand it to the
   /analyze/ x-ray tool via sessionStorage, so the tool's own render() shows
   it (no analysis/render logic duplicated here). The anchor's href is the
   graceful fallback: with no JS (or no fetch) the click just opens the tool. */
(function () {
  var b = document.getElementById('board-send');
  if (!b || !window.fetch) { return; }
  b.addEventListener('click', function (e) {
    e.preventDefault();
    fetch('/demos/terminal-attack-demo-WARNING-display-only-safe.txt')
      .then(function (r) { return r.text(); })
      .then(function (t) {
        try { sessionStorage.setItem('ol-xray-input', t); } catch (err) {}
        location.href = '/analyze/#tool';
      })
      .catch(function () { location.href = '/analyze/#tool'; });
  });
})();
