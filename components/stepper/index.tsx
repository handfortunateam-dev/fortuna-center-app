"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { clsx } from "clsx";

export interface StepperStep {
  label: string;
  description?: string;
  icon?: string;
}

interface StepperProps {
  steps: StepperStep[];
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Stepper({
  steps,
  activeStep,
  orientation = "horizontal",
  className,
}: StepperProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={clsx(
        "w-full",
        isHorizontal ? "flex items-center" : "flex flex-col",
        className,
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={index}
            className={clsx(
              "flex items-center",
              isHorizontal ? (isLast ? "flex-none" : "flex-1") : "w-full",
            )}
          >
            {/* Step item */}
            <div
              className={clsx(
                "flex items-center gap-3",
                isHorizontal ? "flex-col" : "flex-row",
              )}
            >
              {/* Step circle/icon */}
              <div
                className={clsx(
                  "flex items-center justify-center rounded-full transition-all duration-200",
                  "w-10 h-10 text-sm font-semibold",
                  isCompleted && "bg-primary text-primary-foreground shadow-md",
                  isActive &&
                    !isCompleted &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isActive &&
                    !isCompleted &&
                    "bg-default-100 text-default-500 border-2 border-default-200",
                )}
              >
                {isCompleted ? (
                  <Icon icon="solar:check-circle-bold" className="w-6 h-6" />
                ) : step.icon ? (
                  <Icon icon={step.icon} className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step label */}
              <div
                className={clsx(
                  "flex flex-col",
                  isHorizontal ? "text-center" : "text-left",
                )}
              >
                <span
                  className={clsx(
                    "text-sm font-medium transition-colors",
                    isActive && "text-foreground",
                    isCompleted && "text-foreground",
                    !isActive && !isCompleted && "text-default-500",
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-xs text-default-400 mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={clsx(
                  "transition-all duration-200",
                  isHorizontal ? "h-0.5 flex-1 mx-4" : "w-0.5 h-12 ml-5 my-2",
                  isCompleted ? "bg-primary" : "bg-default-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Hook for managing stepper state
export function useStepper(totalSteps: number) {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setActiveStep(step);
    }
  };

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === totalSteps - 1;
  const isCompleted = activeStep === totalSteps;

  return {
    activeStep,
    handleNext,
    handleBack,
    handleReset,
    handleStep,
    isFirstStep,
    isLastStep,
    isCompleted,
  };
}
