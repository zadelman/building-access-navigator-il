import QuestionCard from '../components/QuestionCard';
import RadioStep from '../components/RadioStep';

const OPTIONS = [
  {
    value: 'very-low',
    label: 'Very low income',
    description: 'Roughly below $40,000/year for a family of four (below 50% Area Median Income)',
  },
  {
    value: 'low',
    label: 'Low income',
    description: 'Roughly $40,000–$65,000/year for a family of four (50–80% Area Median Income)',
  },
  {
    value: 'moderate',
    label: 'Moderate income',
    description: 'Roughly $65,000–$100,000/year for a family of four (80–120% Area Median Income)',
  },
  {
    value: 'high',
    label: 'Above moderate',
    description: 'Above $100,000/year for a family of four (above 120% Area Median Income)',
  },
];

export default function Step8IncomeRange({ answers, onChange, onNext, onBack, onSkip }) {
  const selected = answers.incomeRange;

  return (
    <QuestionCard
      question="Which income range best describes your household?"
      description="Dollar amounts shown are approximate for a family of four and vary by county. They are used only to estimate eligibility — exact limits are determined by each program."
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
