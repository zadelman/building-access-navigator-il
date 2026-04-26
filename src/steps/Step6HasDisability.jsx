import QuestionCard from '../components/QuestionCard';
import RadioStep from '../components/RadioStep';

const OPTIONS = [
  { value: true,      label: 'Yes', description: 'I have documented disability status' },
  { value: 'not-yet', label: 'Not yet documented', description: 'I have a disability but documentation is not finalized (e.g. newly injured, awaiting diagnosis)' },
  { value: false,     label: 'No' },
];

export default function Step6HasDisability({ answers, onChange, onNext, onBack, onSkip }) {
  const selected = answers.hasDisability;

  return (
    <QuestionCard
      question="Do you have a documented disability?"
      description="Most programs require documentation of disability. 'Not yet documented' allows you to see what you may qualify for while paperwork is in progress."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextDisabled={selected === null}
    >
      <RadioStep
        name="hasDisability"
        options={OPTIONS}
        value={selected}
        onChange={(v) => onChange('hasDisability', v)}
      />
    </QuestionCard>
  );
}
