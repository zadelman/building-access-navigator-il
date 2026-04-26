import { useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import inputStyles from './StepInput.module.css';

export default function Step5Age({ answers, onChange, onNext, onBack, onSkip }) {
  const [error, setError] = useState('');
  const value = answers.age !== null ? String(answers.age) : '';

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, '');
    onChange('age', raw ? parseInt(raw, 10) : null);
    setError('');
  }

  function handleNext() {
    if (answers.age !== null) {
      if (answers.age < 18 || answers.age > 120) {
        setError('Please enter an age between 18 and 120.');
        return;
      }
    }
    onNext();
  }

  return (
    <QuestionCard
      question="How old are you?"
      description="Many programs have age requirements. Adults 60 and older may qualify for additional programs."
      onNext={handleNext}
      onBack={onBack}
      onSkip={onSkip}
      nextDisabled={false}
    >
      <div className={inputStyles.inputGroup}>
        <label htmlFor="age-input" className={inputStyles.inputLabel}>
          Age
        </label>
        <input
          id="age-input"
          type="text"
          inputMode="numeric"
          className={inputStyles.textInput}
          value={value}
          onChange={handleChange}
          placeholder="e.g. 52"
          aria-describedby={error ? 'age-error' : undefined}
          aria-invalid={!!error}
          maxLength={3}
          style={{ maxWidth: '120px' }}
        />
        {error && (
          <p id="age-error" className={inputStyles.errorText} role="alert">
            {error}
          </p>
        )}
      </div>
    </QuestionCard>
  );
}
