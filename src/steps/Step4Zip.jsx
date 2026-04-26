import { useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import inputStyles from './StepInput.module.css';

function isValidIllinoisZip(zip) {
  // Illinois ZIPs start with 6
  return /^6\d{4}$/.test(zip);
}

export default function Step4Zip({ answers, onChange, onNext, onBack, onSkip }) {
  const [error, setError] = useState('');
  const value = answers.zip || '';

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 5);
    onChange('zip', raw || null);
    setError('');
  }

  function handleNext() {
    if (value && !isValidIllinoisZip(value)) {
      setError('Please enter a valid Illinois ZIP code (5 digits starting with 6).');
      return;
    }
    onNext();
  }

  return (
    <QuestionCard
      question="What is your ZIP code?"
      description="Some programs are limited to specific cities, counties, or rural areas. Chicago residents have access to additional programs."
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
      nextDisabled={false}
    >
      <div className={inputStyles.inputGroup}>
        <label htmlFor="zip-input" className={inputStyles.inputLabel}>
          ZIP code
        </label>
        <input
          id="zip-input"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          className={inputStyles.textInput}
          value={value}
          onChange={handleChange}
          placeholder="e.g. 60614"
          aria-describedby={error ? 'zip-error' : undefined}
          aria-invalid={!!error}
          maxLength={5}
        />
        {error && (
          <p id="zip-error" className={inputStyles.errorText} role="alert">
            {error}
          </p>
        )}
      </div>
    </QuestionCard>
  );
}
