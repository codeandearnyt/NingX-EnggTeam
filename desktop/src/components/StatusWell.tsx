/**
 * StatusWell.tsx — the sunken log. Auto-scrolls, announces politely.
 * 沈み込みログ。自動スクロール。
 *
 * Made by Nitin Sharma.
 */

import { useEffect, useRef } from "react";

import type { LogLine } from "../types";

interface StatusWellProps {
  lines: LogLine[];
}

export default function StatusWell({ lines }: StatusWellProps) {
  const wellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = wellRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [lines]);

  return (
    <div
      className="well"
      ref={wellRef}
      role="log"
      aria-live="polite"
      aria-label="Operation output"
      tabIndex={0}
    >
      {lines.length === 0 ? (
        <span className="well__empty">
          Nothing yet. Press Install to pull the repo and register the plugin.
        </span>
      ) : (
        lines.map((line, index) => (
          <div
            key={`${index}-${line.level}`}
            className={`well__line well__line--${line.level}`}
          >
            {line.text}
          </div>
        ))
      )}
    </div>
  );
}
