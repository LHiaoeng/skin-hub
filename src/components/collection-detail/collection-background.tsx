"use client";

import Image from "next/image";
import { useState } from "react";

import styles from "./collection-detail.module.css";

export function CollectionBackground({ sources }: { sources: string[] }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const source = sources[sourceIndex];

  if (!source) {
    return null;
  }

  return (
    <Image
      className={styles.background}
      src={source}
      alt=""
      fill
      priority
      sizes="100vw"
      aria-hidden="true"
      onError={() => setSourceIndex((index) => index + 1)}
    />
  );
}
