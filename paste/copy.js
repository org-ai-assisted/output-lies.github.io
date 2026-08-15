/* Progressive enhancement only: reveal "Copy" buttons when JS + the async
   Clipboard API are present. With JS off the commands remain plain, fully
   selectable text: nothing here is required to read or use the page.
   All code is same-origin; no third-party origin is contacted. */
(function () {
  if (!navigator.clipboard) return;
  var boxes = document.querySelectorAll('.copybox');
  for (var i = 0; i < boxes.length; i++) {
    (function (box) {
      var cmd = box.querySelector('.cmd');
      var btn = box.querySelector('.copybtn');
      if (!cmd || !btn) return;
      btn.hidden = false;
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(cmd.textContent).then(function () {
          var prev = btn.textContent;
          btn.textContent = 'Copied';
          btn.classList.add('ok');
          setTimeout(function () {
            btn.textContent = prev;
            btn.classList.remove('ok');
          }, 1200);
        });
      });
    })(boxes[i]);
  }
})();
