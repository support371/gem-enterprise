"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./InteractiveEarthShowcase.module.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function InteractiveEarthShowcase() {
  const [isRunning, setIsRunning] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setIsRunning(false);
    };

    updatePreference();
    mediaQuery.addEventListener?.("change", updatePreference);
    return () => mediaQuery.removeEventListener?.("change", updatePreference);
  }, []);

  const motionActive = isRunning && !prefersReducedMotion;
  const label = prefersReducedMotion
    ? "Earth animation paused to respect reduced-motion settings"
    : motionActive
      ? "Pause rotating Earth"
      : "Start rotating Earth";

  return (
    <div className={styles.root} data-testid="interactive-earth-showcase">
      <button
        type="button"
        className={styles.earthButton}
        aria-label={label}
        aria-pressed={motionActive}
        disabled={prefersReducedMotion}
        onClick={() => setIsRunning((current) => !current)}
      >
        <span
          className={`${styles.earth} ${motionActive ? styles.earthRunning : styles.earthPaused}`}
          aria-hidden="true"
        >
          <Image
            src="/images/gem-interactive-earth.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 118vw, (max-width: 1024px) 92vw, 64rem"
            className={styles.earthImage}
          />
        </span>

        <span className={styles.motionControl} aria-hidden="true">
          {motionActive ? <Pause size={14} /> : <Play size={14} />}
          <span>{prefersReducedMotion ? "Motion reduced" : motionActive ? "Earth live" : "Earth paused"}</span>
        </span>
      </button>
    </div>
  );
}
