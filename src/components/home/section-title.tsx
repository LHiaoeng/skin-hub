import type { LucideIcon } from "lucide-react";

import styles from "./section-title.module.css";

export function SectionTitle({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: LucideIcon;
}) {
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>
        {Icon ? <Icon aria-hidden="true" className={styles.icon} /> : null}
        {title}
      </h2>
    </div>
  );
}
