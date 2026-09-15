import React from 'react';
import { WorkedExample } from '../types';
import { MathRenderer } from './MathRenderer';
import { Lightbulb } from 'lucide-react';

interface WorkedExamplesSectionProps {
  examples: WorkedExample[];
}

export const WorkedExamplesSection: React.FC<WorkedExamplesSectionProps> = ({ examples }) => {
  if (!examples || examples.length === 0) return null;

  return (
    <section className="mb-8 print:mb-6" id="section-examples">
      <div className="flex items-center space-x-2 pb-2 mb-4 border-b-2 border-stone-800 print:border-black">
        <Lightbulb className="w-5 h-5 text-amber-600 print:text-black no-print" />
        <h2 className="text-lg md:text-xl font-black tracking-tight text-stone-900 print:text-black uppercase">
          II. ЖИШЭЭ БОДЛОГО БА БОДОЛТ
        </h2>
      </div>

      <div className="space-y-4 print:space-y-3.5">
        {examples.map((ex) => (
          <div
            key={ex.id || ex.number}
            className="avoid-break bg-white border border-stone-300 print:border-stone-800 rounded-lg p-3.5 md:p-4 shadow-xs print:shadow-none"
          >
            {/* Title & Example Number */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-200 print:border-stone-400">
              <span className="font-extrabold text-sm md:text-base text-stone-950 print:text-black">
                Жишээ {ex.number}. {ex.title ? <span className="font-semibold text-stone-700 print:text-stone-900">({ex.title})</span> : null}
              </span>
              {ex.prerequisiteGrade && (
                <span className="text-[11px] px-2 py-0.5 bg-stone-100 print:bg-stone-200 text-stone-700 border border-stone-300 rounded font-medium">
                  {ex.prerequisiteGrade}-р ангийн суурь
                </span>
              )}
            </div>

            {/* Problem Statement */}
            <div className="font-medium text-stone-900 print:text-black text-sm md:text-base mb-3 leading-relaxed">
              <MathRenderer content={ex.problem} />
            </div>

            {/* Step-by-step Solution */}
            <div className="bg-stone-50 print:bg-stone-50/50 rounded-md p-3 border border-stone-200 print:border-stone-400 mb-2.5">
              <div className="font-bold text-xs md:text-sm text-stone-800 print:text-black mb-1.5 uppercase tracking-wide">
                Бодолт:
              </div>
              <ol className="space-y-1.5 text-xs md:text-sm text-stone-800 print:text-black list-decimal list-inside pl-1">
                {ex.solutionSteps.map((step, sIdx) => (
                  <li key={sIdx} className="leading-relaxed">
                    <MathRenderer content={step} className="inline" />
                  </li>
                ))}
              </ol>
            </div>

            {/* Final Answer */}
            <div className="flex items-baseline space-x-2 text-xs md:text-sm pt-1">
              <span className="font-bold text-stone-900 print:text-black">Хариу:</span>
              <span className="font-semibold text-stone-900 print:text-black">
                <MathRenderer content={ex.answer} className="inline" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
