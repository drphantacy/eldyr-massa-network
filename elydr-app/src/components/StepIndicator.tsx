'use client';

interface StepIndicatorProps {
  steps: string[];
  currentStep: string;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const isActive = step === currentStep;
        const isComplete = i < currentIndex;

        return (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                isComplete
                  ? 'bg-green-500 text-white'
                  : isActive
                  ? 'bg-mythic-purple text-white ring-4 ring-mythic-purple/30'
                  : 'bg-cosmic-800 text-cosmic-500'
              }`}
            >
              {isComplete ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 md:w-20 h-1 ${
                  isComplete ? 'bg-green-500' : 'bg-cosmic-800'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
