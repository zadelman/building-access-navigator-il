import ResultCard from './ResultCard';
import styles from './ResultsList.module.css';

/**
 * ResultsList — renders the full results view.
 *
 * Props:
 *   results  {MatchResult[]}  — sorted matches from matchPrograms()
 *   grantees {Object[]}       — HRAP grantees for the user's ZIP (may be [])
 *   onRestart {function}      — reset to beginning
 */
function granteeStatusLabel(status) {
  switch (status) {
    case 'open':   return { label: 'Open',    cls: 'granteeOpen' };
    case 'closed': return { label: 'Closed',  cls: 'granteeClosed' };
    default:       return null;
  }
}

export default function ResultsList({ results, grantees, onRestart }) {
  const confirmed = results.filter(r => r.confidence === 'confirmed');
  const likely    = results.filter(r => r.confidence === 'likely');
  const possible  = results.filter(r => r.confidence === 'possible');

  // Only show HRAP grantees when the user is eligible for IHDA HRAP
  const hrapMatched = results.some(r => r.program.id === 'ihda-hrap');

  const hasResults = results.length > 0;

  return (
    <div
      className={styles.wrapper}
      aria-live="polite"
      aria-atomic="false"
    >
      <div className={styles.header}>
        <h2 className={styles.headline}>
          {hasResults
            ? `${results.length} program${results.length === 1 ? '' : 's'} found`
            : 'No matching programs found'}
        </h2>
        <p className={styles.subhead}>
          {hasResults
            ? 'Review the programs below and contact each one to verify current eligibility and availability.'
            : 'Try adjusting your answers or contact a local disability services office for guidance.'}
        </p>
      </div>

      {!hasResults && (
        <div className={styles.empty}>
          <p>No programs matched your profile. Eligibility criteria change frequently — contact <a href="https://www.dhs.state.il.us/page.aspx?item=29735" target="_blank" rel="noopener noreferrer">Illinois DHS</a> or a local Center for Independent Living for guidance.</p>
        </div>
      )}

      {confirmed.length > 0 && (
        <>
          <p className={styles.sectionHeading}>Likely Eligible</p>
          {confirmed.map(r => <ResultCard key={r.program.id} result={r} />)}
        </>
      )}

      {likely.length > 0 && (
        <>
          <p className={styles.sectionHeading}>Possibly Eligible</p>
          {likely.map(r => <ResultCard key={r.program.id} result={r} />)}
        </>
      )}

      {possible.length > 0 && (
        <>
          <p className={styles.sectionHeading}>May Be Eligible — verify details</p>
          {possible.map(r => <ResultCard key={r.program.id} result={r} />)}
        </>
      )}

      {/* IHDA HRAP local grantee administrators — only shown when HRAP is in matched results */}
      {hrapMatched && grantees.length > 0 && (
        <div className={styles.granteesSection}>
          <h3 className={styles.granteesHeading}>
            IHDA Home Repair and Accessibility Program (HRAP) — Grant Administrators Serving Your Area
          </h3>
          <p className={styles.granteesSubhead}>
            IHDA HRAP is administered locally. Apply directly through the organization(s) below — do not apply to IHDA. Contact them to confirm current availability and start an application.
          </p>
          {grantees.map(g => {
            const gStatus = granteeStatusLabel(g.waitlistStatus);
            return (
              <div key={g.id} className={styles.granteeCard}>
                <div className={styles.granteeHeader}>
                  <p className={styles.granteeName}>{g.name}</p>
                  {gStatus && (
                    <span className={`${styles.granteeStatusBadge} ${styles[gStatus.cls]}`}>
                      {gStatus.label}
                    </span>
                  )}
                </div>
                {g.serviceArea && <p className={styles.granteeArea}>{g.serviceArea}</p>}
                <div className={styles.granteeContact}>
                  {g.contact?.phone && (
                    <a href={`tel:${g.contact.phone.replace(/\D/g, '')}`}>{g.contact.phone}</a>
                  )}
                  {g.contact?.url && (
                    <a href={g.contact.url} target="_blank" rel="noopener noreferrer">Website ↗</a>
                  )}
                  {g.contact?.email && (
                    <a href={`mailto:${g.contact.email}`}>{g.contact.email}</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className={styles.disclaimer}>
        <strong>Disclaimer:</strong> This tool provides general information only and does not constitute legal or financial advice. Eligibility criteria, funding availability, and waitlist status change frequently. Always verify directly with each program before applying.
      </p>

      <div style={{ marginTop: '1.5rem' }}>
        <button type="button" className={styles.restart} onClick={onRestart}>
          ← Start Over
        </button>
      </div>
    </div>
  );
}
