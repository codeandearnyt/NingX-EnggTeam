/**
 * updater.ts — self-update for the desktop app, from GitHub Releases.
 * GitHub Releases からのアプリ自動更新。
 *
 * The plugin update and the app update are separate things:
 *   - installer.update()   pulls a newer NingX-EnggTeam into ~/.ningx-desktop
 *   - this module          replaces the app binary itself
 *
 * electron-updater needs a published release with a latest.yml / latest-mac.yml
 * beside the artifact. Until one exists it reports "no update" and nothing
 * breaks — the plugin operations keep working.
 *
 * Made by Nitin Sharma.
 */

import { app } from "electron";
import { autoUpdater } from "electron-updater";

export interface AppUpdateInfo {
  available: boolean;
  version: string | null;
  current: string;
  note: string;
}

let ready = false;

function prepare(): void {
  if (ready) return;
  ready = true;

  // A dev run has no update feed and would throw on every check.
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
}

export async function checkForAppUpdate(): Promise<AppUpdateInfo> {
  const current = app.getVersion();

  if (!app.isPackaged) {
    return {
      available: false,
      version: null,
      current,
      note: "Running from source — self-update is disabled.",
    };
  }

  prepare();

  try {
    const result = await autoUpdater.checkForUpdates();
    const latest = result?.updateInfo.version ?? null;
    const available = Boolean(latest && latest !== current);

    return {
      available,
      version: latest,
      current,
      note: available ? `Version ${latest} is available.` : "You are on the latest version.",
    };
  } catch (error) {
    return {
      available: false,
      version: null,
      current,
      note: `Could not reach the release feed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function installAppUpdate(): Promise<{ ok: boolean; note: string }> {
  if (!app.isPackaged) {
    return { ok: false, note: "Running from source — nothing to install." };
  }

  try {
    await autoUpdater.downloadUpdate();
    setImmediate(() => autoUpdater.quitAndInstall());
    return { ok: true, note: "Update downloaded. Restarting to apply." };
  } catch (error) {
    return {
      ok: false,
      note: error instanceof Error ? error.message : String(error),
    };
  }
}
