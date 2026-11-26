/**
 * HarnessList.tsx — what is on this machine, and how the plugin reaches it.
 * このマシンにあるハーネスと、プラグインの届き方。
 *
 * Made by Nitin Sharma.
 */

import type { Harness } from "../types";

interface HarnessListProps {
  harnesses: Harness[];
}

export default function HarnessList({ harnesses }: HarnessListProps) {
  if (harnesses.length === 0) {
    return <p className="well__empty">Detecting harnesses…</p>;
  }

  return (
    <div className="harness-grid">
      {harnesses.map((harness) => (
        <div
          key={harness.id}
          className={`harness${harness.detected ? "" : " harness--off"}`}
          title={harness.bin ?? harness.wiring}
        >
          <span className="harness__led" aria-hidden="true" />
          <span className="harness__text">
            <span className="harness__label">{harness.label}</span>
            <span className="harness__wiring">
              {harness.detected ? harness.wiring : "not found"}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
