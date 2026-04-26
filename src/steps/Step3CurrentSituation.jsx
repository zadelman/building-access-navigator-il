import QuestionCard from '../components/QuestionCard';
import RadioStep from '../components/RadioStep';

const OPTIONS = [
  { value: 'hospital',     label: 'Currently in a hospital', description: 'Inpatient, including acute rehab' },
  { value: 'snf',          label: 'In a skilled nursing or rehab facility', description: 'Nursing home, SNF, or long-term acute care' },
  { value: 'moving-home',  label: 'Preparing to move home from a facility', description: 'Being discharged soon and transitioning back home' },
  { value: 'home',         label: 'Living at home', description: 'Already home, with or without home health services' },
  { value: 'other',        label: 'Other or not sure' },
];

export default function Step3CurrentSituation({ answers, onChange, onNext, onBack, onSkip }) {
  const selected = answers.currentSituation;

  return (
    <QuestionCard
      question="Where are you right now?"
      description="Some programs prioritize people transitioning out of a hospital or care facility."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextDisabled={selected === null}
    >
      <RadioStep
        name="currentSituation"
        options={OPTIONS}
        value={selected}
        onChange={(v) => onChange('currentSituation', v)}
      />
    </QuestionCard>
  );
}
