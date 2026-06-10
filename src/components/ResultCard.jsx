import styles from './ResultCard.module.css';

const BADGE_LABEL = {
  confirmed: 'Likely Eligible',
  likely: 'Possibly Eligible',
  possible: 'May Be Eligible',
};

const BADGE_TITLE = {
  confirmed: 'Based on your answers, you appear to meet the eligibility criteria.',
  likely: 'Most eligibility criteria appear met; some details need verification.',
  possible: 'Some details are unknown — verify directly with the program.',
};

function programStatusLabel(status) {
  switch (status) {
    case 'open':     return { label: 'Open',               cls: 'statusOpen' };
    case 'closed':   return { label: 'Closed',             cls: 'statusClosed' };
    case 'waitlist': return { label: 'Waitlist',           cls: 'statusWaitlist' };
    case 'varies':   return { label: 'Varies by location', cls: 'statusVaries' };
    default:         return null;
  }
}

/**
 * ResultCard — displays a single matched program.
 *
 * Props:
 *   result  {MatchResult}  — { program, confidence, caveats, priority }
 */
export default function ResultCard({ result }) {
  const { program, confidence, caveats } = result;
  const c = program.contact || {};
  const status = programStatusLabel(program.waitlistStatus);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{program.name}</span>
        <span
          className={`${styles.badge} ${styles[confidence]}`}
          title={BADGE_TITLE[confidence]}
        >
          {BADGE_LABEL[confidence]}
        </span>
      </div>

      {program.matchReason && (
        <p className={styles.matchReason}>{program.matchReason}</p>
      )}

      <div className={styles.meta}>
        {program.benefitAmount && (
          <span className={styles.metaItem}>
            <strong>Benefit:</strong> {program.benefitAmount}
          </span>
        )}
        {program.benefitType && (
          <span className={styles.metaItem}>
            <strong>Type:</strong> {program.benefitType}
          </span>
        )}
        {status && (
          <span className={styles.metaItem}>
            Program status:
            <span className={`${styles.statusBadge} ${styles[status.cls]}`}>
              {status.label}
            </span>
          </span>
        )}
      </div>

      {caveats.length > 0 && (
        <div className={styles.caveats}>
          <p className={styles.caveatHeading}>Things to verify</p>
          {caveats.map((c, i) => (
            <p key={i} className={styles.caveat}>{c}</p>
          ))}
        </div>
      )}

      <div className={styles.contact}>
        {c.phone && (
          <a href={`tel:${c.phone.replace(/\D/g, '')}`} className={styles.contactLink}>
            📞 {c.phone}
          </a>
        )}
        {c.url && (
          <a href={c.url} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
            Website ↗
          </a>
        )}
        {c.email && (
          <a href={`mailto:${c.email}`} className={styles.contactLink}>
            {c.email}
          </a>
        )}
      </div>
    </div>
  );
}
