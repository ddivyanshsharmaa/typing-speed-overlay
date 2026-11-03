# Typing Speed Overlay

A tiny always-on-top box that shows your live typing speed (WPM) while you work, in any app.
Windows, macOS and Linux (X11).

- Shows **only** your speed: a rolling average of the last 5 seconds, refreshed once a second.
- Colour tiers: **red** under 40, **yellow** 40-65, **green** 65-100, **blue** above 100.
- Drag it anywhere. Hover for the ✕ close button. Tray icon: hide/show, pause, quit.
- Never starts by itself; only runs when you open it.
- Light: about 1% of one CPU core while idle.

## Privacy

It listens to the keyboard system-wide so it can count presses. It keeps only the **time** of each
press for 5 seconds, never *which* key, never what you type, and it makes no network connections.
The whole thing is a few small files in `src/`, so you can read it in minutes.

## Run it

```
npm install
npm start
```

Build an installer: `npm run dist`. Tests: `npm test`.

## Platform notes

- **macOS:** grant Accessibility / Input Monitoring permission the first time, or it cannot see keys.
- **Linux:** needs X11. Wayland blocks global key listening by design; use an X11 session or XWayland.
- **Windows:** it cannot see keys typed into apps running as administrator unless the overlay is too.

## How speed is counted

Net WPM = (typed characters - backspaces) / 5 / minutes. Letters, digits, space and punctuation count;
shortcuts (Ctrl/Alt/Cmd), arrows and function keys do not.

## License

MIT
