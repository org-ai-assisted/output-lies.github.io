# /demos/ -- downloadable demonstration files

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
