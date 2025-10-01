'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircleIcon,
  CircleIcon,
  PlayIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  stepIndex: number;
  stepName: string;
  status: 'completed' | 'in_progress' | 'pending';
}

interface WorkflowNavigationProps {
  formConfig: {
    workflowType: string;
    steps: Step[];
    currentStepIndex?: number;
    onStepChange?: (newIndex: number) => void;
  };
}

export default function WorkflowNavigation({ formConfig }: WorkflowNavigationProps) {
  const { workflowType, steps, currentStepIndex = 0, onStepChange } = formConfig;
  console.log('Workflow Navigation Config:', formConfig);
  if (!workflowType || !steps || steps.length === 0) return null;

  const [currentStepInd, setCurrrentStepInd] = useState(currentStepIndex)
  const [currentStep, setCurrrentStep] = useState(currentStepIndex >= steps?.length ? steps[currentStepIndex - 1] : steps[currentStepIndex])
  console.log('current step:', currentStepInd)
  //  const currentStep = steps[currentStepIndex];
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < steps.length - 1;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the far right on initial render
    if (scrollContainerRef.current && currentStepIndex > 4) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
    console.log('currentStepIndex changed:', currentStepIndex, currentStepInd, currentStep);
  }, []);

  useEffect(() => {

    // Scroll to the far right on initial render
    if (scrollContainerRef.current) {
      if (currentStepInd > 4) {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      }
      else {
        if (currentStepInd < 3) {
          scrollContainerRef.current.scrollLeft = 0;
        }
        else {
          scrollContainerRef.current.scrollLeft = + (currentStepInd * 135);
        }
      }


    }
    console.log('currentStepIndex changed:', currentStepIndex, currentStepInd);
  }, [currentStepIndex, currentStep]);

  const getStepIcon = (index: number) => {
    if (index < currentStepIndex) {
      return <CheckCircleIcon className="h-6 w-6 text-white" />;
    } else if (index === currentStepIndex) {
      return <PlayIcon className="h-6 w-6 text-white" />;
    } else {
      return <CircleIcon className="h-6 w-6 text-gray-400" />;
    }
  };


  const getStepCircleStyle = (index: number) => {
    if (index < currentStepIndex) {
      return 'bg-green-500 border-green-500'; // completed
    } else if (index === currentStepIndex) {
      return 'bg-blue-500 border-blue-500'; // in progress
    } else {
      return 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'; // pending
    }
  };


  // Handler for step click
  const handleStepClick = (index: number) => {
    if (index <= currentStepIndex && onStepChange) {
      setCurrrentStepInd(index);
      setCurrrentStep(steps[index]);
      onStepChange(index);
    }
  };

  return (
    <div className="mb-2">
      <Card>
        <div className="px-4 py-2 font-bold text-lg border-b">
          {workflowType.toProperCase()} Process
        </div>

        <CardContent className="p-2">
          {/* Desktop View */}
          {/* Desktop View */}
          <div className="hidden md:block relative">
            <div ref={scrollContainerRef} className="flex items-center space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 px-2 py-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center min-w-[120px] flex-shrink-0">
                    <button
                      onClick={() => handleStepClick(index)}
                      disabled={index > currentStepIndex}
                      className={cn(
                        'relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 transform hover:scale-105',
                        getStepCircleStyle(index),
                        index > currentStepIndex ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                        index === currentStepIndex ? 'ring-4 ring-blue-200' : ''
                      )}
                    >
                      {getStepIcon(index)}

                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </button>

                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          'text-sm font-medium whitespace-nowrap',
                          index === currentStepIndex ? 'text-blue-600' : 'text-gray-700'
                        )}
                      >
                        {step.stepName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{step?.status}</p>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 relative min-w-[60px]">
                      <div className="absolute inset-0 bg-gray-200"></div>
                      <div
                        className={`absolute inset-0 bg-green-500 transition-all duration-300 ${index < currentStepIndex ? 'w-full' : 'w-0'
                          }`}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>


          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex items-center p-4 rounded-lg border transition-all',
                  index === currentStepIndex ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                )}
              >
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={index > currentStepIndex}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center mr-4',
                    getStepCircleStyle(step, index),
                    index > currentStepIndex ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  )}
                >
                  {getStepIcon(step)}
                </button>

                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {index + 1}. {step.stepName}
                  </p>
                  <p className="text-sm text-gray-500">{step?.status}</p>
                </div>

                {index === currentStepIndex && <Badge className="bg-blue-500">Current</Badge>}
              </div>
            ))}
          </div>

          {/* Footer - info only */}
          <div className="flex justify-between items-center pt-2 ">
            <p className="text-sm text-gray-600 font-semibold">
              Step {(currentStepInd >= steps.length) ? steps.length : currentStepInd + 1} of {steps.length}: {currentStep?.stepName}
            </p>

            <div className="text-center">
              {/* <p className="text-sm text-gray-600">
                {currentStep?.status === 'completed'
                  ? 'Step completed'
                  : 'Complete this step to continue'}
              </p> */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
