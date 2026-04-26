import styles from './QuestionCard.module.css';

/**
 * QuestionCard — wrapper for each intake step.
 *
 * Props:
 *   question    {string}          — the question text (rendered as fieldset legend or heading)
 *   description {string}          — optional sub-text below the question
 *   onNext      {function}        — advance to next step
 *   onBack      {function|null}   — go to previous step (null on step 1)
 *   onSkip      {function}        — skip question (sets answer to null)
 *   nextDisabled {boolean}        — disable Next when no answer selected
 *   nextLabel   {string}          — override "Next" label (e.g. "See Results")
 *   children    {ReactNode}       — the input controls (RadioStep, CheckboxStep, etc.)
 */
export default function QuestionCard({
  question,
  description,
  onNext,
  onBack,
  onSkip,
  nextDisabled = false,
  nextLabel = 'Next',
  children,
}) {
  return (
    <div className={styles.card}>
      {/* fieldset/legend ensures screen readers announce the question before each option */}
      <fieldset>
        <legend className={styles.question}>{question}</legend>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        {children}
      </fieldset>

      <div className={styles.nav}>
        {onBack && (
          <button type="button" className={styles.btnSecondary} onClick={onBack}>
            ← Back
          </button>
        )}
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={onNext}
          disabled={nextDisabled}
        >
          {nextLabel}
        </button>
        {onSkip && (
          <button type="button" className={styles.btnSkip} onClick={onSkip}>
            Skip this question
          </button>
        )}
      </div>
    </div>
  );
}
