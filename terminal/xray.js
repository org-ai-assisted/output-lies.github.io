/* Live x-ray of the combined board, reusing the shared analyzer (window.OL).
   Renders via DOM text nodes only (never innerHTML), so nothing can inject
   markup. If JavaScript is off, the static reveal above stands in. */
(function () {
  if (typeof OL === 'undefined') { return; }
  var box = document.getElementById('board-xray');
  if (!box) { return; }
  var ROWS = [
    ['Homoglyph (Cyrillic)',  'ex\u0430mple.com'],
    ['Homoglyph (Greek)',     'go\u03BFgle.com'],
    ['ASCII look-alike',      'rnicrosoft.com'],
    ['Bidi override (RTL)',   'report \u202Ecod.exe\u202C'],
    ['Zero-width space',      'veri\u200Bfied'],
    ['Invisible / BOM',       '\uFEFFbalance'],
    ['Combining (Zalgo)',     'h\u0301\u0300\u0323\u0308e\u0301\u0300\u0323\u0308llo'],
    ['Fullwidth forms',       '\uFF21\uFF22\uFF23'],
    ['Honest foreign (Greek)','\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC']
  ];
  function pad(s) { while (s.length < 22) { s += ' '; } return s; }
  function dim(t) { var s = document.createElement('span'); s.className = 'dim'; s.textContent = t; return s; }
  box.textContent = '';
  box.appendChild(dim('# each hidden/disguised codepoint, named -- x-rayed live by the analyzer:'));
  box.appendChild(document.createTextNode('\n'));
  var total = 0;
  ROWS.forEach(function (row) {
    box.appendChild(dim(pad(row[0])));
    var res = OL.analyze(row[1]);
    if (res.flagged === 0) {
      box.appendChild(document.createTextNode(row[1] + '  '));
      box.appendChild(dim('(pure ASCII -- rn reads as m)'));
    } else {
      res.items.forEach(function (it) {
        if (it.safe !== undefined) { box.appendChild(document.createTextNode(it.safe)); return; }
        var c = document.createElement('span');
        c.className = 'cp';
        c.textContent = '[' + OL.hex(it.cp) + ']';
        c.title = it.info.name + ' (' + it.info.cls + ')';
        box.appendChild(c);
        total++;
      });
      if (row[0].indexOf('Honest') === 0) { box.appendChild(document.createTextNode('  NOT an attack')); }
    }
    box.appendChild(document.createTextNode('\n'));
  });
  var sum = document.createElement('span');
  sum.className = 'cp';
  sum.textContent = '-> ' + total + ' hidden or disguised codepoints revealed';
  box.appendChild(sum);
})();
