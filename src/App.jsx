import { useState, useRef, useEffect } from 'react';
import ProgressBar from './components/ProgressBar';
import ResultsList from './components/ResultsList';
import Step1Veteran from './steps/Step1Veteran';
import Step2InjuryCause from './steps/Step2InjuryCause';
import Step3CurrentSituation from './steps/Step3CurrentSituation';
import Step4Zip from './steps/Step4Zip';
import Step5Age from './steps/Step5Age';
import Step6HasDisability from './steps/Step6HasDisability';
import Step7OwnershipStatus from './steps/Step7OwnershipStatus';
import Step8IncomeRange from './steps/Step8IncomeRange';
import Step9InsuranceStatus from './steps/Step9InsuranceStatus';
import Step10DisabilityType from './steps/Step10DisabilityType';
import { matchPrograms, getGranteesForZip } from './logic/matchPrograms';
import programsData from './data/programs.json';
import zipData from './data/zip-grantees.json';
import appStyles from './App.module.css';

const { programs } = programsData;

const BLANK_ANSWERS = {
  veteran:          null,
  injuryCause:      null,
  currentSituation: null,
  zip:              null,
  age:              null,
  hasDisability:    null,
  ownershipStatus:  null,
  incomeRange:      null,
  insuranceStatus:  null,
  disabilityType:   null,
};

const TOTAL_STEPS = 10;

// Step components in order
const STEPS = [
  Step1Veteran,
  Step2InjuryCause,
  Step3CurrentSituation,
  Step4Zip,
  Step5Age,
  Step6HasDisability,
  Step7OwnershipStatus,
  Step8IncomeRange,
  Step9InsuranceStatus,
  Step10DisabilityType,
];

export default function App() {
  const [step, setStep] = useState(0);          // 0–9 = intake; 10 = results
  const [answers, setAnswers] = useState(BLANK_ANSWERS);
  const [results, setResults] = useState([]);
  const [grantees, setGrantees] = useState([]);

  // Focus management: move focus to top of card on step change
  const topRef = useRef(null);
  useEffect(() => {
    if (topRef.current) {
      topRef.current.focus();
    }
  }, [step]);

  function handleChange(field, value) {
    setAnswers(prev => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      // Final step → compute and show results
      const matchedResults = matchPrograms(answers, programs, zipData);
      const matchedGrantees = answers.zip ? getGranteesForZip(answers.zip, zipData) : [];
      setResults(matchedResults);
      setGrantees(matchedGrantees);
      setStep(TOTAL_STEPS);   // 10 = results view
    }
  }

  function handleBack() {
    setStep(s => Math.max(0, s - 1));
  }

  function handleSkip() {
    // Leave the current answer as null and advance
    handleNext();
  }

  function handleRestart() {
    setAnswers(BLANK_ANSWERS);
    setResults([]);
    setGrantees([]);
    setStep(0);
  }

  const StepComponent = STEPS[step];
  const isResults = step === TOTAL_STEPS;

  return (
    <div className={appStyles.page}>
      {/* Skip-to-content for keyboard/screen reader users */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className={appStyles.header}>
        <div className={appStyles.headerInner}>
          <span className={appStyles.logo}>Building Access</span>
          <span className={appStyles.tagline}>Illinois Home Accessibility Benefits Navigator</span>
        </div>
      </header>

      <main id="main-content" className={appStyles.main}>
        {/* Focus target — visually hidden, receives focus on step change */}
        <span
          ref={topRef}
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        />

        <div className={appStyles.container}>
          {!isResults && (
            <ProgressBar current={step + 1} total={TOTAL_STEPS} />
          )}

          {isResults ? (
            <ResultsList
              results={results}
              grantees={grantees}
              onRestart={handleRestart}
            />
          ) : (
            <StepComponent
              answers={answers}
              onChange={handleChange}
              onNext={handleNext}
              onBack={step > 0 ? handleBack : null}
              onSkip={handleSkip}
            />
          )}
        </div>
      </main>

      <footer className={appStyles.footer}>
        <div className={appStyles.footerInner}>
          <p>© {new Date().getFullYear()} Building Access · Not legal or financial advice</p>
        </div>
      </footer>
    </div>
  );
}
