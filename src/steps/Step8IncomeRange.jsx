import QuestionCard from '../components/QuestionCard';
import RadioStep from '../components/RadioStep';

const OPTIONS = [
  { value: 'very-low', label: 'Under $40,000 / year' },
  { value: 'low',      label: '$40,000 – $65,000 / year' },
  { value: 'moderate', label: '$65,000 – $100,000 / year' },
  { value: 'high',     label: 'Over $100,000 / year' },
];

export default function Step8IncomeRange({ answers, onChange, onNext, onBack, onSkip }) {
  const selected = answers.incomeRange;

  return (
    <QuestionCard
      question="Which income range best describes your household?"
      description="Dollar amounts are approximate for a family of four and vary by household size and county. They are used only to estimate eligibility — exact limits are determined by each program."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextDisabled={selected === null}
    >
      <RadioStep
        name="incomeRange"
        options={OPTIONS}
        value={selected}
        onChange={(v) => onChange('incomeRange', v)}
      />
    </QuestionCard>
  );
}
