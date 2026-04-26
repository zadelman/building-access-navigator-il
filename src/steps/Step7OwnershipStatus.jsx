import QuestionCard from '../components/QuestionCard';
import RadioStep from '../components/RadioStep';

const OPTIONS = [
  { value: 'owner',         label: 'I own my home' },
  { value: 'renter',        label: 'I rent my home' },
  { value: 'family-member', label: "I live in a family member's home", description: "The family member owns or rents the home" },
  { value: 'other',         label: 'Other or not sure' },
];

export default function Step7OwnershipStatus({ answers, onChange, onNext, onBack, onSkip }) {
  const selected = answers.ownershipStatus;

  return (
    <QuestionCard
      question="What is your housing situation?"
      description="Some modification programs require homeownership; others are open to renters."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextDisabled={selected === null}
    >
      <RadioStep
        name="ownershipStatus"
        options={OPTIONS}
        value={selected}
        onChange={(v) => onChange('ownershipStatus', v)}
      />
    </QuestionCard>
  );
}
