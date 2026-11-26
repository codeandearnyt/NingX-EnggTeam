/**
 * preload.ts — the only bridge between the sandboxed renderer and the OS.
 * レンダラーと OS をつなぐ唯一の橋。
 *
 * Nothing here accepts a path from the renderer that it then executes. The
 * operation names are a closed set, and the app decides what they mean.
 *
 * Made by Nitin Sharma.
 */

import { contextBridge, ipcRenderer } from "electron";

const OPERATIONS = ["install", "uninstall", "reinstall", "update"] as const;
type Operation = (typeof OPERATIONS)[number];

function assertOperation(value: unknown): Operation {
  if (typeof value === "string" && (OPERATIONS as readonly string[]).includes(value)) {
    return value as Operation;
  }
  throw new Error(`unknown operation: ${String(value)}`);
}

contextBridge.exposeInMainWorld("ningx", {
  // The renderer needs to know which chrome it is drawing under. macOS keeps
  // the native traffic lights, so the custom dots must not be rendered there.
  platform: process.platform,

  status: () => ipcRenderer.invoke("app:status"),

  run: (operation: string) => ipcRenderer.invoke("app:run", assertOperation(operation)),

  onLog: (handler: (line: unknown) => void) => {
    const listener = (_event: unknown, line: unknown) => handler(line);
    ipcRenderer.on("app:log", listener);
    return () => ipcRenderer.removeListener("app:log", listener);
  },

  onStatus: (handler: (status: unknown) => void) => {
    const listener = (_event: unknown, status: unknown) => handler(status);
    ipcRenderer.on("app:status", listener);
    return () => ipcRenderer.removeListener("app:status", listener);
  },

  checkUpdate: () => ipcRenderer.invoke("app:check-update"),
  installUpdate: () => ipcRenderer.invoke("app:install-update"),

  open: (target: "repo" | "source" | "use") => ipcRenderer.invoke("app:open", target),
  repoUrl: () => ipcRenderer.invoke("app:repo-url"),

  minimize: () => ipcRenderer.send("win:minimize"),
  maximize: () => ipcRenderer.send("win:maximize"),
  close: () => ipcRenderer.send("win:close"),
});
