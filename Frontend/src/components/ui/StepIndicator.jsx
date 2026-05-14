import React from 'react';
import { Icon } from '@iconify/react';

/**
 * StepIndicator Component
 * Visual progress indicator for multi-step forms
 */
const StepIndicator = ({ steps, currentStep }) => {
    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-default-200 -z-10 rounded-full" />

                {/* Active Progress Bar */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <div
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background
                  ${isCompleted || isCurrent ? 'border-primary text-primary' : 'border-default-300 text-default-300'}
                  ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
                  ${isCompleted ? 'bg-primary text-primary-foreground border-primary' : ''}
                `}
                            >
                                {isCompleted ? (
                                    <Icon icon="lucide:check" width="16" height="16" />
                                ) : (
                                    <span className="text-xs font-semibold">{index + 1}</span>
                                )}
                            </div>
                            <span
                                className={`
                  mt-2 text-xs font-medium hidden sm:block transition-colors duration-300
                  ${isCurrent ? 'text-primary' : 'text-default-500'}
                `}
                            >
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;
