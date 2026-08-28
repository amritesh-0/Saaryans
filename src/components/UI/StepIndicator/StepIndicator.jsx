import './StepIndicator.css';

const steps = ['BAG', 'ADDRESS', 'PAYMENT'];

const StepIndicator = ({ currentStep = 0 }) => {
  return (
    <div className="step-indicator" aria-label="Checkout progress">
      {steps.map((step, index) => (
        <div key={step} className="step-indicator__step-wrapper">
          <div
            className={`step-indicator__step ${
              index < currentStep
                ? 'step-indicator__step--completed'
                : index === currentStep
                ? 'step-indicator__step--active'
                : ''
            }`}
          >
            <div className="step-indicator__dot">
              {index < currentStep ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="step-indicator__label">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`step-indicator__line ${
                index < currentStep ? 'step-indicator__line--completed' : ''
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
