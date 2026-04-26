import QuestionCard from '../components/QuestionCard';
import RadioStep from '../components/RadioStep';

const OPTIONS = [
  { value: true,  label: 'Yes', description: 'I served in the U.S. military' },
  { value: false, label: 'No' },
];

export default function Step1Veteran({ answers, onChange, onNext, onSkip }) {
  const selected = answers.veteran;

  return (
    <QuestionCard
      question="Are you a U.S. military veteran?"
      description="Some programs are available only to veterans or offer veterans enhanced benefits."
      onNext={onNext}
      onSkip={onSkip}
      nextDisabled={selected === null}
    >
      <RadioStep
        name="veteran"
        options={OPTIONS}
        value={selected}
        onChange={(v) => onChange('veteran', v)}
      />
    </QuestionCard>
  );
}
