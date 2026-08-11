/*
  output-lies text analyzer -- shared, DOM-free classifier. AI-Assisted.
  Source: https://github.com/output-lies/output-lies.github.io

  Pure functions only, so it runs identically in the browser (window.OL) and
  under node (module.exports) for the dist-ai test suite. It flags codepoints
  that are not plain printable ASCII and names the class of deception each
  belongs to. It deliberately does NOT try to judge intent, and it cannot catch
  all-ASCII homoglyphs (rn vs m) -- those need a human reading char by char.

  Homoglyphs are named by the ASCII character they imitate ("looks like 'a'"),
  resolved by an exact algorithmic map for fullwidth forms and the mathematical
  alphanumeric symbols, plus a curated table of the well-known cross-script
  confusables (Cyrillic / Greek / Armenian). A non-ASCII letter that is NOT a
  known look-alike is still surfaced, but labelled by its script rather than
  mislabelled a homoglyph.
*/
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OL = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function inRange(cp, a, b) { return cp >= a && cp <= b; }

  // --- confusable resolution: the ASCII char a codepoint imitates, or null ----

  // Mathematical Alphanumeric Symbols (U+1D400..U+1D7FF): 13 styled A-Z/a-z
  // blocks of 52, then 5 styled 0-9 blocks of 10. Reserved holes inside a block
  // are unassigned (the styled glyph lives in the Letterlike Symbols block and is
  // handled by CONFUSABLES below), so real input never lands on a hole and plain
  // block arithmetic is exact.
  var MATH_LETTER_BLOCKS = [
    0x1D400, 0x1D434, 0x1D468, 0x1D49C, 0x1D4D0, 0x1D504, 0x1D538,
    0x1D56C, 0x1D5A0, 0x1D5D4, 0x1D608, 0x1D63C, 0x1D670
  ];
  var MATH_DIGIT_BLOCKS = [0x1D7CE, 0x1D7D8, 0x1D7E2, 0x1D7EC, 0x1D7F6];

  // Reserved (unassigned) positions inside the letter blocks: the styled glyph
  // lives in the Letterlike Symbols block instead (see CONFUSABLES). Excluded
  // from the arithmetic so a pasted unassigned scalar is never reported as a
  // false look-alike -- it has no glyph resembling any ASCII letter.
  var MATH_RESERVED = {
    0x1D455: 1,
    0x1D49D: 1, 0x1D49E: 1, 0x1D49F: 1, 0x1D4A5: 1, 0x1D4A6: 1, 0x1D4A9: 1, 0x1D4AA: 1, 0x1D4AB: 1,
    0x1D4BA: 1, 0x1D4BC: 1, 0x1D4C4: 1,
    0x1D506: 1, 0x1D50B: 1, 0x1D50C: 1, 0x1D515: 1, 0x1D51D: 1,
    0x1D53A: 1, 0x1D53F: 1, 0x1D545: 1, 0x1D547: 1, 0x1D548: 1, 0x1D549: 1, 0x1D551: 1
  };

  function mathAlnum(cp) {
    var i, s;
    if (MATH_RESERVED[cp]) return null;
    for (i = 0; i < MATH_LETTER_BLOCKS.length; i++) {
      s = MATH_LETTER_BLOCKS[i];
      if (cp >= s && cp < s + 52) {
        var d = cp - s;
        return d < 26 ? String.fromCharCode(65 + d) : String.fromCharCode(97 + d - 26);
      }
    }
    for (i = 0; i < MATH_DIGIT_BLOCKS.length; i++) {
      s = MATH_DIGIT_BLOCKS[i];
      if (cp >= s && cp < s + 10) return String.fromCharCode(48 + (cp - s));
    }
    return null;
  }

  // Curated cross-script look-alikes -> ASCII. The well-established IDN-homograph
  // set: Cyrillic and Greek are textbook-safe; Armenian is the high-confidence
  // subset; the styled Letterlike Symbols fill the Math-block holes above.
  var CONFUSABLES = {
    // Cyrillic lowercase
    0x0430: 'a', 0x0435: 'e', 0x043E: 'o', 0x0440: 'p', 0x0441: 'c',
    0x0443: 'y', 0x0445: 'x', 0x0456: 'i', 0x0458: 'j', 0x0455: 's',
    0x04CF: 'l', 0x0501: 'd', 0x051B: 'q', 0x051D: 'w', 0x04BB: 'h',
    // Cyrillic uppercase
    0x0410: 'A', 0x0412: 'B', 0x0415: 'E', 0x041A: 'K', 0x041C: 'M',
    0x041D: 'H', 0x041E: 'O', 0x0420: 'P', 0x0421: 'C', 0x0422: 'T',
    0x0423: 'Y', 0x0425: 'X', 0x0405: 'S', 0x0408: 'J', 0x0406: 'I',
    0x04C0: 'I', 0x051A: 'Q', 0x051C: 'W', 0x0417: '3',
    // Greek uppercase
    0x0391: 'A', 0x0392: 'B', 0x0395: 'E', 0x0396: 'Z', 0x0397: 'H',
    0x0399: 'I', 0x039A: 'K', 0x039C: 'M', 0x039D: 'N', 0x039F: 'O',
    0x03A1: 'P', 0x03A4: 'T', 0x03A5: 'Y', 0x03A7: 'X',
    // Greek lowercase (strong look-alikes only)
    0x03BF: 'o', 0x03B1: 'a', 0x03B3: 'y', 0x03BD: 'v', 0x03C1: 'p', 0x03C7: 'x',
    // Armenian (high-confidence subset)
    0x0585: 'o', 0x057D: 'u', 0x0578: 'n', 0x0570: 'h',
    // Letterlike Symbols that are the styled glyphs of the Math-block holes
    0x210E: 'h', 0x212F: 'e', 0x210A: 'g', 0x2134: 'o', 0x2130: 'E', 0x2131: 'F',
    0x210B: 'H', 0x2110: 'I', 0x2112: 'L', 0x2133: 'M', 0x211B: 'R', 0x212C: 'B',
    0x2102: 'C', 0x210D: 'H', 0x2115: 'N', 0x2119: 'P', 0x211A: 'Q',
    0x211D: 'R', 0x2124: 'Z', 0x2128: 'Z', 0x210C: 'H', 0x2111: 'I',
    0x211C: 'R', 0x212D: 'C',
    // misc single-glyph confusables
    0x01C0: '|', 0x2044: '/', 0x2215: '/', 0x2216: '\\', 0x2223: '|',
    0x0269: 'i', 0x0131: 'i', 0x0261: 'g'
  };

  // The ASCII character `cp` imitates, or null. The maths alphabets are exact
  // arithmetic; the rest is the curated table. (Fullwidth forms map to ASCII too
  // but are visibly wider, so classify() keeps them in their own `wide` class
  // with the target attached rather than calling them look-alikes.)
  function confusableTarget(cp) {
    var m = mathAlnum(cp);
    if (m) return m;
    var c = CONFUSABLES[cp];
    return c || null;
  }

  // A coarse script label for a non-ASCII letter that is NOT a known look-alike,
  // so it is surfaced with context rather than a bare "non-ASCII".
  function scriptName(cp) {
    if (inRange(cp, 0x0370, 0x03FF) || inRange(cp, 0x1F00, 0x1FFF)) return 'Greek letter';
    if (inRange(cp, 0x0400, 0x052F) || inRange(cp, 0x1C80, 0x1C8F) || inRange(cp, 0x2DE0, 0x2DFF)) return 'Cyrillic letter';
    if (inRange(cp, 0x0530, 0x058F)) return 'Armenian letter';
    if (inRange(cp, 0x13A0, 0x13FF) || inRange(cp, 0xAB70, 0xABBF)) return 'Cherokee letter';
    if (inRange(cp, 0x0590, 0x05FF)) return 'Hebrew letter';
    if (inRange(cp, 0x0600, 0x06FF) || inRange(cp, 0x0750, 0x077F)) return 'Arabic letter';
    if (inRange(cp, 0x3040, 0x30FF)) return 'Japanese kana';
    if (inRange(cp, 0x4E00, 0x9FFF) || inRange(cp, 0x3400, 0x4DBF)) return 'CJK ideograph';
    if (inRange(cp, 0xAC00, 0xD7AF) || inRange(cp, 0x1100, 0x11FF)) return 'Hangul';
    return null;
  }

  // Returns null for safe text (printable ASCII plus tab/newline/CR), otherwise
  // { cls, name, visible[, target] }. `visible` is true when the character
  // occupies space on screen (homoglyphs, fullwidth, combining) and false when
  // it is invisible or masquerades as a space. `target` is set for homoglyphs:
  // the ASCII character the codepoint imitates.
  function classify(cp) {
    // ordinary, safe whitespace
    if (cp === 0x09 || cp === 0x0A || cp === 0x0D) return null;
    // C0 controls
    if (cp < 0x20) return { cls: 'ctrl', name: 'C0 control', visible: false };
    // printable ASCII
    if (cp <= 0x7E) return null;
    if (cp === 0x7F) return { cls: 'ctrl', name: 'DEL', visible: false };
    if (cp <= 0x9F) return { cls: 'ctrl', name: 'C1 control', visible: false };

    // bidirectional controls (Trojan Source)
    if (cp === 0x200E) return { cls: 'bidi', name: 'left-to-right mark', visible: false };
    if (cp === 0x200F) return { cls: 'bidi', name: 'right-to-left mark', visible: false };
    if (cp === 0x061C) return { cls: 'bidi', name: 'Arabic letter mark', visible: false };
    if (inRange(cp, 0x202A, 0x202E)) return { cls: 'bidi', name: 'bidi embedding/override', visible: false };
    if (inRange(cp, 0x2066, 0x2069)) return { cls: 'bidi', name: 'bidi isolate', visible: false };

    // zero-width and invisible format characters
    if (cp === 0x200B) return { cls: 'zw', name: 'zero-width space', visible: false };
    if (cp === 0x200C) return { cls: 'zw', name: 'zero-width non-joiner', visible: false };
    if (cp === 0x200D) return { cls: 'zw', name: 'zero-width joiner', visible: false };
    if (cp === 0x2060) return { cls: 'zw', name: 'word joiner', visible: false };
    if (inRange(cp, 0x2061, 0x2064)) return { cls: 'zw', name: 'invisible math operator', visible: false };
    if (cp === 0xFEFF) return { cls: 'zw', name: 'BOM / zero-width no-break space', visible: false };
    if (cp === 0x180E) return { cls: 'zw', name: 'Mongolian vowel separator', visible: false };
    if (inRange(cp, 0xFFF9, 0xFFFB)) return { cls: 'zw', name: 'interlinear annotation', visible: false };
    if (cp === 0x00AD) return { cls: 'zw', name: 'soft hyphen', visible: false };

    // line and paragraph separators (act like newlines, are not U+000A)
    if (cp === 0x2028) return { cls: 'ctrl', name: 'line separator', visible: false };
    if (cp === 0x2029) return { cls: 'ctrl', name: 'paragraph separator', visible: false };

    // deceptive whitespace: looks like a space, is not U+0020
    if (cp === 0x00A0) return { cls: 'space', name: 'no-break space', visible: false };
    if (cp === 0x1680) return { cls: 'space', name: 'ogham space mark', visible: false };
    if (inRange(cp, 0x2000, 0x200A)) return { cls: 'space', name: 'unicode space', visible: false };
    if (cp === 0x202F) return { cls: 'space', name: 'narrow no-break space', visible: false };
    if (cp === 0x205F) return { cls: 'space', name: 'medium mathematical space', visible: false };
    if (cp === 0x3000) return { cls: 'space', name: 'ideographic space', visible: false };
    if (cp === 0x2800) return { cls: 'space', name: 'braille blank', visible: false };

    // tag characters (deprecated; can smuggle hidden ASCII, e.g. behind an emoji)
    if (inRange(cp, 0xE0000, 0xE007F)) return { cls: 'ctrl', name: 'tag character', visible: false };

    // variation selectors
    if (inRange(cp, 0xFE00, 0xFE0F) || inRange(cp, 0xE0100, 0xE01EF))
      return { cls: 'comb', name: 'variation selector', visible: false };

    // combining grapheme joiner is a combining mark but has no glyph
    if (cp === 0x034F) return { cls: 'comb', name: 'combining grapheme joiner', visible: false };
    // combining marks (Zalgo, overflow, disguise)
    if (inRange(cp, 0x0300, 0x036F) || inRange(cp, 0x1AB0, 0x1AFF) ||
        inRange(cp, 0x1DC0, 0x1DFF) || inRange(cp, 0x20D0, 0x20FF) || inRange(cp, 0xFE20, 0xFE2F))
      return { cls: 'comb', name: 'combining mark', visible: true };

    // private use areas
    if (inRange(cp, 0xE000, 0xF8FF) || inRange(cp, 0xF0000, 0xFFFFD) || inRange(cp, 0x100000, 0x10FFFD))
      return { cls: 'other', name: 'private use', visible: true };

    // fullwidth ASCII forms: a distinct, visibly wider glyph -- keep the `wide`
    // class but name the ASCII character it stands in for
    if (cp >= 0xFF01 && cp <= 0xFF5E) {
      var fw = String.fromCharCode(cp - 0xFEE0);
      return { cls: 'wide', name: "fullwidth '" + fw + "'", visible: true, target: fw };
    }

    // homoglyph: named by the ASCII character it imitates (confusable pair)
    var target = confusableTarget(cp);
    if (target !== null)
      return { cls: 'homo', name: "looks like '" + target + "'", visible: true, target: target };

    // a non-confusable non-ASCII letter: surfaced, labelled by script for context
    var script = scriptName(cp);
    if (script) return { cls: 'other', name: script, visible: true };

    // other fullwidth/halfwidth forms (halfwidth kana, width variants)
    if (inRange(cp, 0xFF00, 0xFFEF)) return { cls: 'wide', name: 'fullwidth/halfwidth form', visible: true };

    // anything else outside ASCII
    return { cls: 'other', name: 'non-ASCII', visible: true };
  }

  function hex(cp) {
    var h = cp.toString(16).toUpperCase();
    while (h.length < 4) h = '0' + h;
    return 'U+' + h;
  }

  // Splits a string into a list of tokens: { safe: '...' } runs of safe text and
  // { ch, cp, info } flagged codepoints. Iterates by codepoint (astral-safe).
  function analyze(str) {
    var items = [], counts = {}, flagged = 0, run = '';
    var chars = Array.from(str == null ? '' : String(str));
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i], cp = ch.codePointAt(0), info = classify(cp);
      if (!info) { run += ch; continue; }
      if (run) { items.push({ safe: run }); run = ''; }
      items.push({ ch: ch, cp: cp, info: info });
      flagged++;
      counts[info.name] = (counts[info.name] || 0) + 1;
    }
    if (run) items.push({ safe: run });
    return { items: items, flagged: flagged, counts: counts };
  }

  // Returns the input with every flagged codepoint removed: plain printable
  // ASCII plus tab/newline. This is a coarse "make it safe to paste" helper, not
  // a substitute for stcat/sanitize-string.
  function toAscii(str) {
    var out = '', chars = Array.from(str == null ? '' : String(str));
    for (var i = 0; i < chars.length; i++) {
      var cp = chars[i].codePointAt(0);
      if (classify(cp) === null) out += chars[i];
    }
    return out;
  }

  return {
    classify: classify, analyze: analyze, hex: hex, toAscii: toAscii,
    confusableTarget: confusableTarget
  };
}));
