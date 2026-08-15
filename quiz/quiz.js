// Client-side only. Nothing is transmitted; the score lives in this tab.
(function () {
  var qs = Array.prototype.slice.call(document.querySelectorAll('.q'));
  var total = qs.length, answered = 0, correct = 0;
  var streak = 0, bestStreak = 0, startTime = 0;
  var scoreEl = document.getElementById('scoreN');
  var msgEl = document.getElementById('scoreMsg');
  var boxEl = document.getElementById('scorebox');
  var progEl = document.getElementById('progress');
  var statsEl = document.getElementById('qstats');
  var cmsgEl = document.getElementById('qcmsg');

  function finish() {
    scoreEl.textContent = String(correct);
    var m;
    if (correct === total) m = 'Perfect. Now do it without the quiz telling you when to look.';
    else if (correct >= total - 1) m = 'Strong. The ones you missed are exactly the ones that ship in real repos.';
    else if (correct >= total / 2) m = 'Half-caught. That is why the advice is not "look harder" but "check the bytes".';
    else m = 'This is the normal human score. Eyes lose to homoglyphs. Tools do not.';
    msgEl.textContent = m;
    var secs = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    statsEl.textContent = 'Best streak: ' + bestStreak + ' in a row  -  Time: ' + secs + 's';
    boxEl.classList.add('show');
  }

  qs.forEach(function (q) {
    var want = q.getAttribute('data-answer');
    var btns = q.querySelectorAll('.qbtn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (q.classList.contains('answered')) return;
        if (startTime === 0) startTime = Date.now();
        var choice = btn.getAttribute('data-choice');
        var right = choice === want;
        q.classList.add('answered');
        btn.classList.add('chosen');
        var v = q.querySelector('.verdict');
        if (right) {
          correct++; streak++; if (streak > bestStreak) bestStreak = streak;
          v.classList.add('ok'); v.textContent = 'Correct';
        } else {
          streak = 0;
          v.classList.add('no'); v.textContent = want === 'lie' ? 'Missed - it was lying' : 'Missed - it was honest';
        }
        answered++;
        progEl.textContent = answered + ' of ' + total + ' answered';
        if (answered === total) finish();
      });
    });
  });

  document.getElementById('qcopy').addEventListener('click', function () {
    var text = 'I scored ' + correct + '/' + total + ' on Spot the lie (best streak ' + bestStreak +
      '). Can you tell honest text from a trap? https://output-lies.github.io/quiz/';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        cmsgEl.textContent = 'result copied'; setTimeout(function () { cmsgEl.textContent = ''; }, 2500);
      });
    }
  });
  document.getElementById('qretry').addEventListener('click', function () { location.reload(); });
})();
