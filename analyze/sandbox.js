// Build-a-trap + safe-paste sandbox. Reuses the shared OL classifier.
(function () {
  if (typeof OL === 'undefined') return;
  var CLSMAP = { bidi:'m-bidi', zw:'m-zw', ctrl:'m-ctrl', space:'m-space',
    homo:'m-homo', wide:'m-wide', comb:'m-comb', other:'m-other' };

  function renderInto(el, str) {
    el.textContent = '';
    var res = OL.analyze(str);
    res.items.forEach(function (it) {
      if (it.safe !== undefined) {
        var t = document.createElement('span'); t.className = 'safe'; t.textContent = it.safe; el.appendChild(t);
      } else {
        var s = document.createElement('span');
        s.className = 'mark ' + (CLSMAP[it.info.cls] || 'm-other');
        s.title = it.info.name + ' ' + OL.hex(it.cp);
        if (it.info.visible) {
          var g = document.createElement('span'); g.className = 'g'; g.textContent = it.ch;
          s.appendChild(g); s.appendChild(document.createTextNode(' ' + OL.hex(it.cp)));
        } else { s.textContent = OL.hex(it.cp); }
        el.appendChild(s);
      }
    });
    return res;
  }

  // ---- build a trap (benign, for education) --------------------------------
  var HOMO = { a:0x0430, c:0x0441, e:0x0435, i:0x0456, j:0x0458, o:0x043E,
    p:0x0440, s:0x0455, x:0x0445, y:0x0443 };
  function forgeHomoglyph(s) {
    return Array.from(s).map(function (ch) {
      var m = HOMO[ch.toLowerCase()];
      return m ? String.fromCodePoint(m) : ch;
    }).join('');
  }
  function forgeZeroWidth(s) {
    return s.replace(/([A-Za-z0-9]{2})([A-Za-z0-9])/, function (m, a, b) { return a + '\u200B' + b; });
  }
  function forgeBidi(s) {
    var parts = s.split(/(\s+)/);
    for (var i = parts.length - 1; i >= 0; i--) {
      if (/\S/.test(parts[i])) { parts[i] = '\u202E' + parts[i] + '\u202C'; break; }
    }
    return parts.join('');
  }

  var btIn = document.getElementById('bt-in'), btOut = document.getElementById('bt-out'),
      btV = document.getElementById('bt-verdict'), btMsg = document.getElementById('bt-msg');
  var forged = '';
  function btRun() {
    var picked = document.querySelector('input[name=bt-mode]:checked');
    var mode = picked ? picked.value : 'homoglyph';
    var src = btIn.value;
    forged = mode === 'homoglyph' ? forgeHomoglyph(src) : mode === 'zerowidth' ? forgeZeroWidth(src) : forgeBidi(src);
    var res = renderInto(btOut, forged);
    if (res.flagged) {
      btV.textContent = 'Forged: renders as an honest string, carries ' + res.flagged +
        ' hidden codepoint' + (res.flagged === 1 ? '' : 's') + '.';
      btV.className = 'verdictline dirty';
    } else {
      btV.textContent = 'No change (nothing in that input to disguise with this mode).';
      btV.className = 'verdictline';
    }
  }
  document.getElementById('bt-go').addEventListener('click', btRun);
  Array.prototype.forEach.call(document.querySelectorAll('input[name=bt-mode]'), function (r) {
    r.addEventListener('change', btRun);
  });
  document.getElementById('bt-copy').addEventListener('click', function () {
    if (!forged || !navigator.clipboard || !navigator.clipboard.writeText) return;
    navigator.clipboard.writeText(forged).then(function () {
      btMsg.textContent = 'copied'; setTimeout(function () { btMsg.textContent = ''; }, 2000);
    });
  });
  document.getElementById('bt-send').addEventListener('click', function () {
    var x = document.getElementById('in');
    if (x && forged) { x.value = forged; x.dispatchEvent(new Event('input')); location.hash = '#tool'; }
  });
  btRun();

  // ---- safe-paste sandbox (secure-terminal preview) ------------------------
  var sbIn = document.getElementById('sb-in'), sbRaw = document.getElementById('sb-raw'),
      sbSafe = document.getElementById('sb-safe'), sbT = document.getElementById('sb-tallies'),
      sbHint = document.getElementById('sb-hint'), sbLive = document.getElementById('sb-live'),
      sbMsg = document.getElementById('sb-msg');
  function sbRun() {
    var str = sbIn.value;
    if (!str) { sbLive.hidden = true; sbHint.hidden = false; sbT.textContent = ''; return; }
    sbHint.hidden = true; sbLive.hidden = false;
    renderInto(sbRaw, str);
    var safe = OL.toAscii(str);
    sbSafe.textContent = safe;
    var stripped = Array.from(str).length - Array.from(safe).length;
    sbT.textContent = stripped
      ? stripped + ' unsafe codepoint' + (stripped === 1 ? '' : 's') + ' would be refused.'
      : 'All printable ASCII; a safe terminal accepts it unchanged.';
  }
  sbIn.addEventListener('input', sbRun);
  function sbFlash(m) { sbMsg.textContent = m; setTimeout(function () { sbMsg.textContent = ''; }, 2000); }
  function sbCopy(text, okmsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { sbFlash(okmsg); }, function () { sbFlash('clipboard blocked'); });
    } else { sbFlash('clipboard unavailable'); }
  }
  document.getElementById('sb-copy-in').addEventListener('click', function () {
    if (sbIn.value) sbCopy(sbIn.value, 'copied what you pasted');
  });
  document.getElementById('sb-copy-safe').addEventListener('click', function () {
    if (sbIn.value) sbCopy(OL.toAscii(sbIn.value), 'copied the kept ASCII-only text');
  });
  document.getElementById('sb-send').addEventListener('click', function () {
    var x = document.getElementById('in');
    if (x && sbIn.value) { x.value = sbIn.value; x.dispatchEvent(new Event('input')); location.hash = '#tool'; }
  });
  sbRun();
})();
