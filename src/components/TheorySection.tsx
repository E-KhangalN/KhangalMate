import React from 'react';
import { TheoryRule } from '../types';
import { MathRenderer } from './MathRenderer';
import { BookOpen } from 'lucide-react';

interface TheorySectionProps {
  theory: TheoryRule[];
  prerequisiteNotice?: string;
}

export const TheorySection: React.FC<TheorySectionProps> = ({ theory, prerequisiteNotice }) => {
  if (!theory || theory.length === 0) return null;

  return (
    <section className="mb-8 print:mb-6" id="section-theory">
      {/* Section Header */}
      <div className="flex items-center space-x-2 pb-2 mb-4 border-b-2 border-stone-800 print:border-black">
        <BookOpen className="w-5 h-5 text-amber-700 print:text-black no-print" />
        <h2 className="text-lg md:text-xl font-black tracking-tight text-stone-900 print:text-black uppercase">
          I. ОНОЛЫН МАТЕРИАЛ БА ДҮРЭМ
        </h2>
      </div>

      {prerequisiteNotice && (
        <div className="mb-4 p-3 bg-amber-50/60 border border-amber-200 rounded-md text-xs md:text-sm text-amber-900 print:bg-white print:border-stone-400 print:text-black avoid-break">
          <span className="font-bold">Санамж / Суурь мэдлэгийн залгамж: </span>
          <MathRenderer content={prerequisiteNotice} className="inline" />
        </div>
      )}

      {/* Grid of Rule Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3.5">
        {theory.map((rule, idx) => (
          <div
            key={rule.id || idx}
            className="avoid-break bg-white border-2 border-stone-800 print:border-black rounded-lg p-3.5 md:p-4 shadow-xs print:shadow-none flex flex-col justify-between"
          >
            <div>
              {/* Header Box */}
              <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-stone-200 print:border-stone-800">
                <h3 className="font-bold text-sm md:text-base text-stone-900 print:text-black uppercase tracking-wide">
                  {rule.title}
                </h3>
                {rule.badge && (
                  <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 bg-stone-100 print:bg-stone-200 text-stone-800 print:text-black rounded border border-stone-300 print:border-black">
                    {rule.badge}
                  </span>
                )}
              </div>

              {/* Rule Text */}
              <div className="text-xs md:text-sm text-stone-800 print:text-black font-normal leading-relaxed">
                <MathRenderer content={rule.ruleText} />
              </div>

              {/* Mathematical Formula Box if exists */}
              {rule.formula && (
                <div className="mt-2.5 p-2 bg-stone-50 print:bg-stone-100 border border-stone-300 print:border-stone-600 rounded text-center">
                  <MathRenderer content={`$$${rule.formula}$$`} block />
                </div>
              )}
            </div>

            {/* Explanatory Note */}
            {rule.note && (
              <div className="mt-2.5 pt-2 border-t border-dashed border-stone-200 print:border-stone-400 text-[11px] md:text-xs text-stone-600 print:text-stone-800 italic">
                <span className="font-semibold not-italic">Тайлбар: </span>
                <MathRenderer content={rule.note} className="inline" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
