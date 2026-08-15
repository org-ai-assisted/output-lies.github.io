/* Framed playback. No external library; frames are set via textContent only.
   A reusable little primitive for showing a sequence of terminal states. */
(function () {
  var screen = document.getElementById('as-screen');
  var cap = document.getElementById('as-cap');
  var btn = document.getElementById('as-play');
  var state = document.getElementById('as-state');
  if (!screen || !cap || !btn) { return; }
  var PRIMARY =
    '$ ls\n' +
    'deploy.log  rollback.sh  README.md\n' +
    '$ cat deploy.log\n';
  var ALT =
    '+--------------------------------------------------+\n' +
    '|   DEPLOY MONITOR                    [ ALL GREEN ] |\n' +
    '|                                                  |\n' +
    '|   db migrate ................... OK              |\n' +
    '|   cache warm ................... OK              |\n' +
    '|   health probe ................. OK              |\n' +
    '|   canary 5% .................... OK              |\n' +
    '|                                                  |\n' +
    '|   all systems nominal.  press q to quit.         |\n' +
    '+--------------------------------------------------+\n';
  var RESTORED = PRIMARY + '$ \n';
  var FRAMES = [
    { cap: 'primary screen',                 body: PRIMARY,  wait: 1100 },
    { cap: 'ALTERNATE screen (fake output)', body: ALT,      wait: 2200 },
    { cap: 'primary screen (restored)',      body: RESTORED, wait: 1600 }
  ];
  var END = 'primary screen -- scrollback shows NOTHING was painted';
  var timer = null, i = 0;
  function stopTimer() { if (timer) { clearTimeout(timer); timer = null; } }
  function show(n) {
    var f = FRAMES[n];
    cap.textContent = f.cap;
    screen.textContent = f.body;
  }
  function step() {
    show(i);
    var f = FRAMES[i];
    if (i < FRAMES.length - 1) {
      i++;
      timer = setTimeout(step, f.wait);
    } else {
      cap.textContent = END;
      if (state) { state.textContent = 'the fake dashboard is gone without a trace -- press Play to replay'; }
      btn.textContent = 'Replay';
      btn.disabled = false;
    }
  }
  function play() {
    stopTimer();
    i = 0;
    btn.disabled = true;
    btn.textContent = 'Playing...';
    if (state) { state.textContent = 'a safe re-enactment -- no real terminal is touched'; }
    step();
  }
  btn.addEventListener('click', play);
})();
