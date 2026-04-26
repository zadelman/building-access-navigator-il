import QuestionCard from '../components/QuestionCard';
import CheckboxStep from '../components/CheckboxStep';

const OPTIONS = [
  { value: 'medicaid',          label: 'Medicaid (Illinois)', description: 'Also called Medical Assistance — income-based state/federal program' },
  { value: 'medicare',          label: 'Medicare', description: 'Federal program, usually for people 65+ or with disabilities' },
  { value: 'medicare-advantage', label: 'Medicare Advantage (Part C)', description: 'Private plan that provides Medicare benefits — some plans cover home mods' },
  { value: 'private',           label: 'Private / employer insurance' },
  { value: 'va-benefits',       label: 'VA health benefits', description: 'For veterans enrolled in VA healthcare' },
  { value: 'none',              label: 'None / uninsured' },
];

export default function Step9InsuranceStatus({ answers, onChange, onNext, onBack, onSkip }) {
  const values = answers.insuranceStatus || [];

  return (
    <QuestionCard
      question="Which of the following insurance or benefit programs are you enrolled in?"
      description="Some modification programs require Medicaid eligibility. Medicare Advantage plans vary — yours may cover accessibility modifications."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextDisabled={false}
    >
      <CheckboxStep
        name="insuranceStatus"
        options={OPTIONS}
        values={values}
        onChange={(v) => onChange('insuranceStatus', v.length > 0 ? v : null)}
      />
    </QuestionCard>
  );
}
