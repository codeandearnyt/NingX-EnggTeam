/**
 * TitleBar.tsx — custom chrome so the window looks the same on every OS.
 * 全 OS で同じ見た目にするための独自タイトルバー。
 *
 * Made by Nitin Sharma.
 */

interface TitleBarProps {
  title: string;
}

export default function TitleBar({ title }: TitleBarProps) {
  return (
    <header className="titlebar">
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

      <span className="titlebar__title">{title}</span>
      <span className="titlebar__spacer" aria-hidden="true" />
    </header>
  );
}
