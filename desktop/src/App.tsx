/**
 * App.tsx — the whole interface. One screen, four operations.
 * 画面はひとつ、操作は四つ。
 *
 * Made by Nitin Sharma.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import AquaButton from "./components/AquaButton";
import HarnessList from "./components/HarnessList";
import ProgressBar from "./components/ProgressBar";
import StatusWell from "./components/StatusWell";
import TitleBar from "./components/TitleBar";
import type { AppUpdateInfo, LogLine, Operation, Status } from "./types";

const OPERATION_LABEL: Record<Operation, string> = {
  install: "Installing",
  uninstall: "Uninstalling",
  reinstall: "Reinstalling",
  update: "Updating",
};

const OPERATION_DONE: Record<Operation, string> = {
  install: "Installed",
  uninstall: "Uninstalled",
  reinstall: "Reinstalled",
  update: "Updated",
};

export default function App() {
  const [status, setStatus] = useState<Status | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [busy, setBusy] = useState<Operation | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [appUpdate, setAppUpdate] = useState<AppUpdateInfo | null>(null);

  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3400);
  }, []);

  useEffect(() => {
    let alive = true;

    window.ningx
      .status()
      .then((next) => {
        if (alive) setStatus(next);
      })
      .catch(() => {
        if (alive) showToast("Could not read the install state.");
      });

    const offLog = window.ningx.onLog((line) => {
      setLogs((previous) => [...previous.slice(-400), line]);
    });
    const offStatus = window.ningx.onStatus((next) => setStatus(next));

    return () => {
      alive = false;
      offLog();
      offStatus();
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, [showToast]);

  const run = useCallback(
    async (operation: Operation) => {
      if (busy) return;
      setBusy(operation);

      try {
        const result = await window.ningx.run(operation);
        showToast(
          result.ok
            ? OPERATION_DONE[operation]
            : `${OPERATION_LABEL[operation]} failed — see the log`,
        );
      } catch (error) {
        showToast(`Could not run ${operation}: ${String(error)}`);
      } finally {
        setBusy(null);
        const next = await window.ningx.status().catch(() => null);
        if (next) setStatus(next);
      }
    },
    [busy, showToast],
  );

  const checkAppUpdate = useCallback(async () => {
    const info = await window.ningx.checkUpdate().catch(() => null);
    if (!info) {
      showToast("Update check failed.");
      return;
    }
    setAppUpdate(info);
    showToast(info.note);
  }, [showToast]);

  const installed = status?.installed ?? false;
  const locked = busy !== null;

  const version = status?.version ?? "—";
  const commit = status?.commit ? status.commit.slice(0, 7) : "—";
  const detectedCount = status?.harnesses.filter((h) => h.detected).length ?? 0;

  return (
    <div className="shell">
      <TitleBar title="NingX Installer" />

      <main className="shell__body">
        <section className="hero">
          <div>
            <h1 className="hero__name">NingX-EnggTeam</h1>
            <p className="hero__tag">
              Senior Web Engineering Team · 24 UI types · 12 roles
            </p>

            <div className="hero__meta">
              <span className={`chip ${installed ? "chip--ok" : "chip--mute"}`}>
                <span className="chip__dot" aria-hidden="true" />
                {installed ? "Installed" : "Not installed"}
              </span>
              <span className="chip">v{version}</span>
              <span className="chip">commit {commit}</span>
              <span className="chip">{detectedCount} harnesses</span>
              {status?.updateAvailable ? (
                <span className="chip chip--warn">update available</span>
              ) : null}
            </div>
          </div>

          <span className="chip chip--mute">app v{status?.appVersion ?? "1.0.0"}</span>
        </section>

        {status && !status.gitFound ? (
          <div className="panel">
            <div className="panel__body">
              <strong>git is not on PATH.</strong> The installer pulls the repo with
              git. Install git, restart the app, and try again.
            </div>
          </div>
        ) : null}

        <section className="actions" aria-label="Operations">
          <AquaButton onClick={() => void run("install")} disabled={locked || installed}>
            Install
          </AquaButton>
          <AquaButton onClick={() => void run("update")} disabled={locked || !installed}>
            Update
          </AquaButton>
          <AquaButton
            variant="secondary"
            onClick={() => void run("reinstall")}
            disabled={locked || !installed}
          >
            Reinstall
          </AquaButton>
          <AquaButton
            variant="danger"
            onClick={() => void run("uninstall")}
            disabled={locked || !installed}
          >
            Uninstall
          </AquaButton>
        </section>

        {busy ? (
          <ProgressBar label={`${OPERATION_LABEL[busy]}…`} />
        ) : null}

        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Harnesses on this machine</h2>
            <span className="chip chip--mute">{detectedCount} detected</span>
          </div>
          <div className="panel__body">
            <HarnessList harnesses={status?.harnesses ?? []} />
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Output</h2>
            <AquaButton
              variant="quiet"
              onClick={() => setLogs([])}
              disabled={logs.length === 0}
            >
              Clear
            </AquaButton>
          </div>
          <div className="panel__body">
            <StatusWell lines={logs} />
          </div>
        </section>

        <footer className="footer">
          <span>
            {status?.repo ?? "codeandearnyt/NingX-EnggTeam"} · Made by Nitin Sharma
          </span>

          <span className="footer__links">
            <AquaButton variant="quiet" onClick={() => void checkAppUpdate()}>
              Check app update
            </AquaButton>
            <AquaButton variant="quiet" onClick={() => void window.ningx.open("use")}>
              Manual
            </AquaButton>
            <AquaButton variant="quiet" onClick={() => void window.ningx.open("repo")}>
              GitHub
            </AquaButton>
            {appUpdate?.available ? (
              <AquaButton
                variant="quiet"
                onClick={() => void window.ningx.installUpdate()}
              >
                Install v{appUpdate.version}
              </AquaButton>
            ) : null}
          </span>
        </footer>
      </main>

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
