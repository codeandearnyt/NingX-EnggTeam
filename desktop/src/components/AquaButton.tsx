/**
 * AquaButton.tsx — the gel button. One component, four skins.
 * ジェルボタン。4 種類の見た目。
 *
 * Made by Nitin Sharma.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "quiet";

interface AquaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "",
  secondary: "aqua-btn--secondary",
  danger: "aqua-btn--danger",
  quiet: "aqua-btn--quiet",
};

export default function AquaButton({
  variant = "primary",
  children,
  className,
  type = "button",
  ...rest
}: AquaButtonProps) {
  const classes = ["aqua-btn", VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
