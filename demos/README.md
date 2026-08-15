# /demos/ -- downloadable demonstration files

## unicode-gallery-safe-to-cat.txt

A display-only gallery of the Unicode character space. `cat` it in a normal
terminal and it prints a code-chart of every renderable block, then a labeled
specimen of each risk class -- homoglyphs, bidi controls, zero-width and
invisible bytes, non-ASCII spaces, combining marks, raw C0/C1 control bytes --
with honest foreign text as the non-attack contrast.

- **Safe to cat in ANY terminal.** Every raw control byte is followed by its own
  terminator on the same line, so the terminal returns to ground state at every
  newline: no unterminated control string, no window-title or alternate-screen
  change, nothing persists (no `reset` needed). The only side effect is one `BEL`
  beep; the bidi and combining specimens reorder/stack within their own line and
  recover at the newline. Nothing is copied to your clipboard, typed at your
  prompt, or run.
- **What it is for.** Feed the same file to a safe tool and watch it label every
  class: [secure-terminal](https://secure-terminal.github.io) tints each
  character by risk (the [gallery on the compatibility
  page](https://secure-terminal.github.io/compatibility/#unicode-gallery) shows
  it), `unicode-show` / `stcat` annotate it, or paste it into the [analyze
  x-ray](https://output-lies.github.io/analyze/). Its sibling
  [`art-safe-to-cat.txt`](art-safe-to-cat.txt) does the same for 24-bit colour.

### Regenerate

The bytes are the deterministic output of the `unicode-gallery.py` generator in
the derivative-maker `dist-ai` package -- the single source of truth, so the file
cannot drift from a hand edit. The header stamps the Unicode version it was built
against. To reproduce it from a `dist-ai` checkout:

    python3 usr/share/secure-terminal-shots/unicode-gallery.py > unicode-gallery-safe-to-cat.txt

## art-safe-to-cat.txt

A display-only piece of terminal art -- a 24-bit-colour scene (a sunset beach and
rolling green hills) drawn entirely from SGR truecolour and the upper-half-block
glyph, which doubles the vertical resolution for smooth gradients.

- **Safe to cat in ANY terminal.** It emits only SGR colour, the half-block glyph
  and newlines, and ends every line with a reset -- no cursor moves, no screen
  clear, no title or alternate-screen change, nothing that persists. It paints a
  scene and leaves your scrollback clean.
- **What it is for.** The colour counterpart to
  [`unicode-gallery-safe-to-cat.txt`](unicode-gallery-safe-to-cat.txt): a safe
  terminal is not a plain one. See it rendered on the
  [comparison page](https://secure-terminal.github.io/comparison/#truecolor).

### Regenerate

Deterministic output (a pure function of pixel position) of the `truecolor-art.py`
generator in the derivative-maker `dist-ai` package. From a `dist-ai` checkout:

    python3 usr/share/secure-terminal-shots/truecolor-art.py > art-safe-to-cat.txt

## terminal-attack-demo-WARNING-display-only-safe.txt

One safe, HONEST, self-labeling board that carries every terminal text-attack
*display* class at once. `cat` it in a normal terminal and it paints a
full-screen "what you see vs what is there" table -- a hijacked window title, a
DEC line-drawing frame, a homoglyph domain, a bidi override, zero-width and
invisible bytes, combining marks, fullwidth look-alikes, a control-byte repaint,
an SGR-hidden string, an OSC 8 link whose text is not its target, and a
`?1049h` alternate-screen switch -- with honest Greek text as the non-attack
contrast.

- **It is DISPLAY-ONLY and safe.** The only state it changes is the display: it
  sets the window title and switches to the alternate screen, both undone by
  `reset`. It copies nothing to your clipboard, types nothing at your prompt, and
  runs nothing. Its first bytes are a plaintext warning, and it runs on the
  alternate screen so your real scrollback is preserved.
- **Why this one ships as raw bytes.** The genuinely dangerous payloads (clipboard
  writes, input reflection, notification and RCE classes) are NOT here and are
  never shipped as a cat-able file -- they stay hex-encoded in the
  [terminal-poc-corpus](https://github.com/secure-terminal/terminal-poc-corpus),
  so viewing the repo never fires them. This board carries none of those; it is
  provably safe to cat, so it is shipped as real bytes you can run yourself.
- **Read it safely first**: `unicode-show`, `stcat`, or paste it into the
  [analyze x-ray](https://output-lies.github.io/analyze/); or feed it to
  [secure-terminal](https://secure-terminal.github.io), which neutralizes every
  class in one frame.

### Regenerate

The bytes are the terminal-poc-corpus `tui-showcase` PoC, stored read-safe as
hex. To reproduce this file from the corpus:

    python3 - <<'EOF'
    import binascii
    hx = open('poc/tui-showcase/payload.hex').read()
    b = ''.join(''.join(l.split('#',1)[0].split()) for l in hx.splitlines())
    open('terminal-attack-demo-WARNING-display-only-safe.txt','wb').write(binascii.unhexlify(b))
    EOF
