/**
 * TitleBar.tsx — platform-correct window chrome.
 * プラットフォームごとに正しいウィンドウ枠。
 *
 * macOS draws its own traffic lights, so this component renders only the drag
 * strip and the title there. Windows and Linux have no equivalent, so the gel
 * dots are drawn here and wired to the IPC window controls.
 *
 * Made by Nitin Sharma.
 */

interface TitleBarProps {
  title: string;
}

const isMac = (): boolean =>
  typeof window !== "undefined" && window.ningx?.platform === "darwin";

export default function TitleBar({ title }: TitleBarProps) {
  const mac = isMac();

  return (
    <header className={`titlebar${mac ? " titlebar--mac" : ""}`}>
      {mac ? null : (
        <div className="titlebar__lights">
          <button
            type="button"
            className="dot dot--close"
            onClick={() => window.ningx.close()}
            aria-label="Close window"
            title="Close"
          />
          <button
            type="button"
            className="dot dot--min"
            onClick={() => window.ningx.minimize()}
            aria-label="Minimise window"
            title="Minimise"
          />
          <button
            type="button"
            className="dot dot--max"
            onClick={() => window.ningx.maximize()}
            aria-label="Maximise window"
            title="Maximise"
          />
        </div>
      )}

      <span className="titlebar__title">{title}</span>
      {mac ? null : <span className="titlebar__spacer" aria-hidden="true" />}
    </header>
  );
}
