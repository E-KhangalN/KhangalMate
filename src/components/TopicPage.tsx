import React, { useState } from 'react';
import { TopicPackage, PrintSectionsSelection, PrintOptions } from '../types';
import { TheorySection } from './TheorySection';
import { WorkedExamplesSection } from './WorkedExamplesSection';
import { PracticeSection } from './PracticeSection';
import { TestSection } from './TestSection';
import { AnswerSection } from './AnswerSection';
import { PrintControlPanel } from './PrintControlPanel';
import {
  Printer,
  ChevronRight,
  BookOpen,
  Edit3,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
} from 'lucide-react';

interface TopicPageProps {
  topic: TopicPackage;
  onOpenAdmin: () => void;
}

export const TopicPage: React.FC<TopicPageProps> = ({ topic, onOpenAdmin }) => {
  // Default selection per requirements:
  // Theory, Examples, Practice selected; Tests & Answers unselected by default
  const [selection, setSelection] = useState<PrintSectionsSelection>({
    theory: true,
    examples: true,
    practice: true,
    test1: false,
    test2: false,
    test3: false,
    answers: false,
  });

  const [options, setOptions] = useState<PrintOptions>({
    includeWorkSpace: true,
    teacherVersion: false,
    fontSize: 'md',
    twoColumnPractice: false,
  });

  // Determine if the first printed section is a test or theory
  const isOnlyTest1 = selection.test1 && !selection.theory && !selection.examples && !selection.practice;
  const isOnlyTest2 = selection.test2 && !selection.theory && !selection.examples && !selection.practice && !selection.test1;
  const isOnlyTest3 = selection.test3 && !selection.theory && !selection.examples && !selection.practice && !selection.test1 && !selection.test2;
  const isOnlyAnswers = selection.answers && !selection.theory && !selection.examples && !selection.practice && !selection.test1 && !selection.test2 && !selection.test3;

  const anySectionSelected =
    selection.theory ||
    selection.examples ||
    selection.practice ||
    selection.test1 ||
    selection.test2 ||
    selection.test3 ||
    selection.answers;

  const selectAll = () => {
    setSelection({
      theory: true,
      examples: true,
      practice: true,
      test1: true,
      test2: true,
      test3: true,
      answers: true,
    });
  };

  const clearAll = () => {
    setSelection({
      theory: false,
      examples: false,
      practice: false,
      test1: false,
      test2: false,
      test3: false,
      answers: false,
    });
  };

  return (
    <div className="w-full">
      {/* Screen Breadcrumb & Title Bar */}
      <div className="no-print mb-4 pb-3 border-b border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 mb-1.5">
          <nav className="flex items-center space-x-1.5 font-medium">
            <span className="font-bold text-stone-800">{topic.grade}-р анги</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span>{topic.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-amber-800 font-bold">{topic.title}</span>
          </nav>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-md hover:bg-stone-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-stone-500" />
              <span>Бүгдийг сонгох</span>
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-md hover:bg-stone-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-stone-500" />
              <span>Сонголтыг арилгах</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-md hover:bg-stone-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span>Сэдэв засах</span>
            </button>
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl md:text-3xl font-black text-stone-950 tracking-tight">
            {topic.title}
          </h1>
        </div>

        {topic.description && (
          <p className="text-xs md:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
            {topic.description}
          </p>
        )}
      </div>

      {/* Print Control Panel */}
      <PrintControlPanel
        selection={selection}
        onChangeSelection={setSelection}
        options={options}
        onChangeOptions={setOptions}
      />

      {/* Main Printable Document Canvas */}
      <article className="print-container bg-white rounded-xl border border-stone-200 p-6 md:p-10 shadow-xs print:shadow-none print:border-none print:p-0">
        {!anySectionSelected && (
          <div className="py-16 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-xl my-4 no-print">
            <Printer className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="font-semibold text-sm text-stone-600">
              Хэвлэх эсвэл харах хэсгээ сонгоогүй байна.
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Дээрх сонголтоос онол, жишээ, дасгал эсвэл сорилыг чагтална уу.
            </p>
          </div>
        )}

        {/* 1. Theory */}
        {selection.theory && (
          <TheorySection
            theory={topic.theory}
            prerequisiteNotice={topic.prerequisiteNotice}
          />
        )}

        {/* 2. Worked Examples */}
        {selection.examples && (
          <WorkedExamplesSection examples={topic.examples} />
        )}

        {/* 3. Practice Exercises */}
        {selection.practice && (
          <PracticeSection
            practice={topic.practice}
            includeWorkSpace={options.includeWorkSpace}
            teacherVersion={options.teacherVersion}
          />
        )}

        {/* 4. Test 1 */}
        {selection.test1 && topic.test1 && (
          <TestSection
            test={topic.test1}
            grade={topic.grade}
            topicTitle={topic.title}
            category={topic.category}
            isFirstPrintedSection={isOnlyTest1}
            includeWorkSpace={options.includeWorkSpace}
            teacherVersion={options.teacherVersion}
          />
        )}

        {/* 5. Test 2 */}
        {selection.test2 && topic.test2 && (
          <TestSection
            test={topic.test2}
            grade={topic.grade}
            topicTitle={topic.title}
            category={topic.category}
            isFirstPrintedSection={isOnlyTest2}
            includeWorkSpace={options.includeWorkSpace}
            teacherVersion={options.teacherVersion}
          />
        )}

        {/* 6. Test 3 */}
        {selection.test3 && topic.test3 && (
          <TestSection
            test={topic.test3}
            grade={topic.grade}
            topicTitle={topic.title}
            category={topic.category}
            isFirstPrintedSection={isOnlyTest3}
            includeWorkSpace={options.includeWorkSpace}
            teacherVersion={options.teacherVersion}
          />
        )}

        {/* 7. Answers */}
        {selection.answers && (
          <AnswerSection
            topic={topic}
            isFirstPrintedSection={isOnlyAnswers}
          />
        )}
      </article>
    </div>
  );
};
