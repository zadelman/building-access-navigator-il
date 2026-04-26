import QuestionCard from '../components/QuestionCard';
import RadioStep from '../components/RadioStep';

const OPTIONS = [
  { value: 'workplace',   label: 'Workplace injury', description: 'Injured on the job or while working' },
  { value: 'crime',       label: 'Crime or violent incident', description: 'Injured as a victim of a crime' },
  { value: 'medical',     label: 'Medical condition or illness', description: 'Including stroke, MS, ALS, cancer, etc.' },
  { value: 'accident',    label: 'Accident (non-workplace)', description: 'Auto accident, fall, or other injury outside of work' },
  { value: 'progressive', label: 'Progressive or degenerative condition', description: 'Condition that has worsened over time' },
  { value: 'aging',       label: 'Age-related changes', description: 'Functional changes related to getting older' },
];

export default function Step2InjuryCause({ answers, onChange, onNext, onBack, onSkip }) {
  const selected = answers.injuryCause;

  return (
    <QuestionCard
      question="What is the primary cause of your disability or mobility limitation?"
      description="This helps us identify programs specific to your situation, such as workers' compensation or crime victim benefits."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextDisabled={selected === null}
    >
      <RadioStep
        name="injuryCause"
        options={OPTIONS}
        value={selected}
        onChange={(v) => onChange('injuryCause', v)}
      />
    </QuestionCard>
  );
}
