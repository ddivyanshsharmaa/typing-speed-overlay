const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const { uIOhook, UiohookKey: K } = require('uiohook-napi');
const { Tracker, tier } = require('./wpm');

const tracker = new Tracker();
let win, tray, paused = false;

// Keys that count as typing. Everything else (arrows, F-keys, modifiers) is ignored.
const TYPING = new Set([
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').map((c) => K[c]),
  K.Space, K.Comma, K.Period, K.Slash, K.Semicolon, K.Quote, K.Backquote,
  K.BracketLeft, K.BracketRight, K.Backslash, K.Minus, K.Equal,
]);

function createWindow() {
  win = new BrowserWindow({
    width: 150, height: 64, frame: false, transparent: true, resizable: false,
    alwaysOnTop: true, skipTaskbar: true, hasShadow: false, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => win.showInactive());
}

function startKeys() {
  uIOhook.on('keydown', (e) => {
    if (paused) return;
    const now = Date.now();
    if (e.keycode === K.Backspace) tracker.backspace(now);
    else if (TYPING.has(e.keycode) && !e.ctrlKey && !e.altKey && !e.metaKey) tracker.type(now);
  });
  uIOhook.start();
}

function startTray() {
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icon.png')));
  tray.setToolTip('Typing Speed Overlay');
  const menu = () => Menu.buildFromTemplate([
    { label: win.isVisible() ? 'Hide' : 'Show', click: () => { win.isVisible() ? win.hide() : win.showInactive(); tray.setContextMenu(menu()); } },
    { label: paused ? 'Resume counting' : 'Pause counting', click: () => { paused = !paused; tracker.reset(); tray.setContextMenu(menu()); } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setContextMenu(menu());
  tray.on('click', () => { win.isVisible() ? win.hide() : win.showInactive(); tray.setContextMenu(menu()); });
}

ipcMain.on('close', () => app.quit());

// Only one overlay at a time.
if (!app.requestSingleInstanceLock()) app.quit();

app.whenReady().then(() => {
  createWindow();
  startTray();
  startKeys();
  let last = -1;
  setInterval(() => {
    const v = paused ? 0 : tracker.wpm(Date.now());
    if (v !== last) { last = v; win.webContents.send('wpm', { v, tier: tier(v) }); }
  }, 1000);
});

app.on('will-quit', () => { try { uIOhook.stop(); } catch {} });
// Not registered as a login item on purpose: it only runs when you open it.
