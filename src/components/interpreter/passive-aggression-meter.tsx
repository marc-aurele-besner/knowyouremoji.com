'use client';

import { ProbabilityMeter, ProbabilityMeterProps } from './probability-meter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface PassiveAggressionMeterProps {
  /** The passive-aggression probability value (0-100) */
  value: number;
  /** Additional CSS classes */
  className?: string;
  /** Optional test ID for the component */
  testId?: string;
}

const PASSIVE_AGGRESSIVE_PATTERNS = [
  { pattern: '👍', description: 'Thumbs up alone as response' },
  { pattern: 'k.', description: '"k" vs "okay" vs "ok"' },
  { pattern: 'Fine.', description: '"Fine" or "Whatever" type responses' },
  { pattern: '😊 + negative', description: 'Excessive smiling with negative text' },
  { pattern: 'Message.', description: 'Period after short message' },
];

function getContextualDescription(value: number): string {
  if (value <= 30) {
    return 'Low likelihood of passive-aggressive undertones';
  }
  if (value <= 60) {
    return 'Some passive-aggressive patterns may be present';
  }
  return 'High likelihood of passive-aggressive communication';
}

export function PassiveAggressionMeter({ value, className, testId }: PassiveAggressionMeterProps) {
  const meterProps: ProbabilityMeterProps = {
    label: 'Passive-Aggression',
    value,
    testId: testId ?? 'passive-aggression-meter',
    description: getContextualDescription(value),
    className,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div data-testid="passive-aggression-meter-wrapper" className="cursor-help">
            <ProbabilityMeter {...meterProps} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs" data-testid="passive-aggression-tooltip">
          <div className="space-y-2">
            <p className="font-medium">Common Passive-Aggressive Patterns:</p>
            <ul className="space-y-1">
              {PASSIVE_AGGRESSIVE_PATTERNS.map((item) => (
                <li key={item.pattern} className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-gray-300">{item.pattern}</span>
                  <span className="text-gray-400">- {item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
