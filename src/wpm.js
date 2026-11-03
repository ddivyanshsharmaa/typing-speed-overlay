// Pure typing-speed maths. Stores only timestamps, never which key was pressed.
class Tracker {
  constructor({ windowMs = 5000 } = {}) {
    this.windowMs = windowMs;
    this.events = []; // { t, d }  d = +1 typed character, -1 backspace
  }

  type(t) { this.events.push({ t, d: 1 }); }
  backspace(t) { this.events.push({ t, d: -1 }); }
  reset() { this.events = []; }

  // Net words per minute averaged over the last windowMs (5 characters = 1 word).
  // The divisor is always the full window, so the number is steady and falls to 0 after a pause.
  wpm(now) {
    const cutoff = now - this.windowMs;
    while (this.events.length && this.events[0].t < cutoff) this.events.shift();
    let net = 0;
    for (const e of this.events) net += e.d;
    return Math.max(0, Math.round((net / 5) / (this.windowMs / 60000)));
  }
}

module.exports = { Tracker };

// Speed tiers: under 40 red, 40-65 yellow, 65-100 green, above 100 blue.
function tier(wpm) {
  if (wpm < 40) return 'red';
  if (wpm < 65) return 'yellow';
  if (wpm <= 100) return 'green';
  return 'blue';
}

module.exports.tier = tier;
