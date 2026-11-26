/**
 * ProgressBar.tsx — indeterminate Aqua candy-stripe bar.
 * 不確定進捗の Aqua バー。
 *
 * Made by Nitin Sharma.
 */

interface ProgressBarProps {
  label: string;
}

export default function ProgressBar({ label }: ProgressBarProps) {
  return (
    <div className="progress">
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuetext={label}
      >
        <div className="progress__fill" />
      </div>
      <span className="progress__label">{label}</span>
    </div>
  );
}
