import styles from './ProgressBar.module.css';

/**
 * ProgressBar — shows current step / total steps.
 * Props:
 *   current  {number}  1-based current step
 *   total    {number}  total number of steps
 */
export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.label}>
        Question {current} of {total}
      </p>
    </div>
  );
}
