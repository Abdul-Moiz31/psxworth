"use client";

import React from "react";

interface Step {
  id: number;
  title: string;
}

interface TransactionStepsProps {
  currentStep: number;
  steps: Step[];
}

export function TransactionSteps({ currentStep, steps }: TransactionStepsProps) {
  return (
    <div className="relative flex items-center justify-around w-full mb-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="relative flex flex-col items-center z-10 flex-1 text-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                currentStep >= step.id ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span className="text-gray-100 font-bold">{step.id}</span>
            </div>
            <span className="text-xs mt-2">{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 md:flex-[3_1_auto] h-1 transition-all duration-500 ${
                currentStep > step.id ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
