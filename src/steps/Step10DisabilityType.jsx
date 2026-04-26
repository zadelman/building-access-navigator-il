import QuestionCard from '../components/QuestionCard';
import RadioStep from '../components/RadioStep';

const OPTIONS = [
  { value: 'mobility',   label: 'Mobility or physical', description: 'Difficulty walking, climbing stairs, or using upper/lower limbs' },
  { value: 'vision',     label: 'Vision impairment', description: 'Partial or full vision loss' },
  { value: 'hearing',    label: 'Hearing impairment', description: 'Partial or full hearing loss' },
  { value: 'cognitive',  label: 'Cognitive or neurological', description: 'Including TBI, stroke, dementia, or developmental disabilities' },
  { value: 'multiple',   label: 'Multiple disabilities' },
  { value: 'other',      label: 'Other or not sure' },
];

export default function Step10DisabilityType({ answers, onChange, onNext, onBack, onSkip }) {
  const selected = answers.disabilityType;

  return (
    <QuestionCard
      question="What type of disability or mobility limitation do you have?"
      description="This information helps us connect you with the most relevant resources. It does not affect which funding programs you qualify for."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextDisabled={false}
      nextLabel="See Results"
    >
      <RadioStep
        name="disabilityType"
        options={OPTIONS}
        value={selected}
        onChange={(v) => onChange('disabilityType', v)}
      />
    </QuestionCard>
  );
}
