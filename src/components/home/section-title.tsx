import styles from "./section-title.module.css";

export function SectionTitle({ title }: { title: string }) {
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
}
