"use client";

import { useEffect, useRef } from "react";

export function PointerActivity() {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const markActive = () => {
      document.documentElement.dataset.pointerActive = "true";

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        document.documentElement.dataset.pointerActive = "false";
      }, 2000);
    };

    window.addEventListener("pointerdown", markActive, { passive: true });
    window.addEventListener("pointermove", markActive, { passive: true });
    markActive();

    return () => {
      window.removeEventListener("pointerdown", markActive);
      window.removeEventListener("pointermove", markActive);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      delete document.documentElement.dataset.pointerActive;
    };
  }, []);

  return null;
}
