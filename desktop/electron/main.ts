/**
 * main.ts — Electron main process / メインプロセス
 *
 * Owns the window, the IPC surface, and the four operations. The renderer is
 * sandboxed: it can only call the channels listed in preload.ts.
 *
 * Made by Nitin Sharma.
 */

import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";

import {
  REPO_LABEL,
  REPO_URL,
  run,
  status,
  type LogLine,
  type Operation,
} from "./core/installer";
import { checkForAppUpdate, installAppUpdate } from "./core/updater";

const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // macOS keeps its own traffic lights: the OS draws them, the user gets the
  // window controls they already know, and we only inset the content beneath.
  // Windows and Linux have no equivalent, so there we draw the gel dots.
  const chrome: Electron.BrowserWindowConstructorOptions = isMac
    ? {
        titleBarStyle: "hiddenInset",
        trafficLightPosition: { x: 16, y: 15 },
      }
    : {
        frame: false,
      };

  mainWindow = new BrowserWindow({
    width: 860,
    height: 780,
    minWidth: 720,
    minHeight: 600,
    show: false,
    backgroundColor: "#dfe7ef",
    ...chrome,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());

  const target = path.join(__dirname, "..", "dist", "index.html");
  void mainWindow.loadFile(target);

  // `electron . --selftest` loads the real renderer against the real preload,
  // runs one IPC round-trip, prints the result, and exits. No screen capture,
  // no guessing whether the bridge actually installed.
  if (process.argv.includes("--selftest")) {
    mainWindow.webContents.once("did-finish-load", () => {
      const probe = `(async () => {
        const status = await window.ningx.status();
        return JSON.stringify({
          bridge: typeof window.ningx,
          platform: window.ningx.platform,
          dots: document.querySelectorAll(".dot").length,
          macClass: Boolean(document.querySelector(".titlebar--mac")),
          title: document.querySelector(".titlebar__title")?.textContent ?? null,
          buttons: [...document.querySelectorAll(".aqua-btn")].map(b => b.textContent.trim()),
          harnesses: document.querySelectorAll(".harness").length,
          cssLoaded: getComputedStyle(document.querySelector(".aqua-btn")).borderRadius,
          installed: status.installed,
          repo: status.repo,
          appVersion: status.appVersion,
          gitFound: status.gitFound,
          detected: status.harnesses.filter(h => h.detected).map(h => h.id)
        });
      })()`;

      mainWindow?.webContents
        .executeJavaScript(probe, true)
        .then((result: string) => {
          const line = `SELFTEST ${result}\n`;
          const out = process.env["NINGX_SELFTEST_OUT"];
          if (out) {
            require("node:fs").writeFileSync(out, line, "utf8");
          } else {
            process.stdout.write(line);
          }
        })
        .catch((error: unknown) => {
          const line = `SELFTEST_FAIL ${String(error)}\n`;
          const out = process.env["NINGX_SELFTEST_OUT"];
          if (out) {
            require("node:fs").writeFileSync(out, line, "utf8");
          } else {
            process.stdout.write(line);
          }
        })
        .finally(() => {
          app.exit(0);
        });
    });
  }

  if (isDev && process.env["NINGX_DEVTOOLS"] === "1") {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) void shell.openExternal(url);
    return { action: "deny" };
  });
}

// ------------------------------------------------------------------- IPC

function send(channel: string, payload: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

ipcMain.handle("app:status", async () => status(app.getVersion()));

ipcMain.handle("app:run", async (_event, operation: Operation) => {
  const log = (line: LogLine) => send("app:log", line);
  const result = await run(operation, log);
  send("app:status", await status(app.getVersion()));
  return result;
});

ipcMain.handle("app:check-update", async () => checkForAppUpdate());
ipcMain.handle("app:install-update", async () => installAppUpdate());

ipcMain.handle("app:open", async (_event, target: "repo" | "source" | "use") => {
  const urls: Record<string, string> = {
    repo: `https://github.com/${REPO_LABEL}`,
    use: `https://github.com/${REPO_LABEL}/blob/main/USE.md`,
  };
  if (target === "source") {
    const sourceDir = path.join(app.getPath("home"), ".ningx-desktop", "source");
    await shell.openPath(sourceDir);
    return true;
  }
  const url = urls[target];
  if (url) await shell.openExternal(url);
  return Boolean(url);
});

ipcMain.handle("app:repo-url", () => REPO_URL);

// window controls — the titlebar is custom so the UI is identical everywhere
ipcMain.on("win:minimize", () => mainWindow?.minimize());
ipcMain.on("win:maximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on("win:close", () => mainWindow?.close());

// ------------------------------------------------------------------ lifecycle

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
});
