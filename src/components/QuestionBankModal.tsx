import React, { useState, useMemo } from 'react';
import { TopicPackage, GradeNumber, DifficultyLevel } from '../types';
import { MathRenderer } from './MathRenderer';
import { PrintHeader } from './PrintHeader';
import {
  X,
  Printer,
  CheckSquare,
  Square,
  Filter,
  Plus,
  Trash2,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

interface QuestionBankItem {
  id: string;
  sourceTopicId: string;
  sourceTopicTitle: string;
  grade: GradeNumber;
  type: 'practice' | 'test';
  difficulty?: DifficultyLevel;
  points?: number;
  question: string;
  answer: string;
  solution?: string;
}

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: TopicPackage[];
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  topics,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeNumber | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [worksheetTitle, setWorksheetTitle] = useState('Захиалгат дасгал ажлын хуудас');
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [viewMode, setViewMode] = useState<'bank' | 'preview'>('bank');

  // Flatten all questions across topics
  const allBankQuestions: QuestionBankItem[] = useMemo(() => {
    const list: QuestionBankItem[] = [];

    topics.forEach((topic) => {
      // Add practice questions
      topic.practice?.forEach((p) => {
        list.push({
          id: `pr-${topic.id}-${p.id}`,
          sourceTopicId: topic.id,
          sourceTopicTitle: topic.title,
          grade: topic.grade,
          type: 'practice',
          difficulty: p.difficulty,
          question: p.question,
          answer: p.answer,
          solution: p.solution,
        });
      });

      // Add test questions
      const tests = [topic.test1, topic.test2, topic.test3].filter(Boolean);
      tests.forEach((t) => {
        t.questions?.forEach((q) => {
          list.push({
            id: `test-${t.id}-${q.id}`,
            sourceTopicId: topic.id,
            sourceTopicTitle: topic.title,
            grade: topic.grade,
            type: 'test',
            points: q.points,
            question: q.question,
            answer: q.answer,
            solution: q.solution,
          });
        });
      });
    });

    return list;
  }, [topics]);

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return allBankQuestions.filter((q) => {
      if (selectedGrade !== 'all' && q.grade !== selectedGrade) return false;
      if (selectedDifficulty !== 'all' && q.difficulty && q.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText =
          q.question.toLowerCase().includes(query) ||
          q.sourceTopicTitle.toLowerCase().includes(query) ||
          q.answer.toLowerCase().includes(query);
        if (!matchesText) return false;
      }
      return true;
    });
  }, [allBankQuestions, selectedGrade, selectedDifficulty, searchQuery]);

  // Selected questions for worksheet
  const selectedQuestions = useMemo(() => {
    return allBankQuestions.filter((q) => selectedQuestionIds.includes(q.id));
  }, [allBankQuestions, selectedQuestionIds]);

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredQuestions.map((q) => q.id);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const clearSelection = () => {
    setSelectedQuestionIds([]);
  };

  const triggerCustomPrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-stone-900/60 backdrop-blur-xs overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] max-h-[92vh] flex flex-col shadow-2xl border border-stone-300 overflow-hidden">
        {/* Modal Header */}
        <div className="shrink-0 p-4 md:px-6 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white no-print z-20">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base md:text-lg font-black tracking-tight">
                Асуултын сан & Захиалгат дасгал хуудас
              </h2>
              <p className="text-xs text-stone-300">
                Сэдэв, анги хооронд бодлого сонгож, өөрийн хүссэн A4 хуудсыг хэвлэх
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'bank' ? 'preview' : 'bank')}
              disabled={selectedQuestions.length === 0}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'preview'
                  ? 'bg-amber-500 text-stone-950'
                  : selectedQuestions.length > 0
                  ? 'bg-stone-800 hover:bg-stone-700 text-white border border-stone-700'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              {viewMode === 'preview' ? '← Жагсаалт руу буцах' : `Хуудас харах (${selectedQuestions.length})`}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {viewMode === 'bank' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden no-print">
            {/* Left Filter Column */}
            <div className="w-full md:w-64 p-4 border-r border-stone-200 bg-stone-50 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Ангиар шүүх:
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value) as GradeNumber)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white font-medium"
                >
                  <option value="all">Бүх ангиуд (6-12)</option>
                  {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      {g}-р анги
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Түвшин:
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white font-medium"
                >
                  <option value="all">Бүх түвшин</option>
                  <option value="easy">Хялбар</option>
                  <option value="medium">Дунд</option>
                  <option value="hard">Ахисан</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Түлхүүр үг:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Бодлого хайх..."
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>

              <div className="pt-2 border-t border-stone-200">
                <div className="text-xs font-bold text-stone-700 mb-2">
                  Сонгосон: {selectedQuestionIds.length} бодлого
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="flex-1 text-[11px] py-1.5 bg-white border border-stone-300 rounded font-semibold text-stone-700 hover:bg-stone-100"
                  >
                    Шүүгдсэнийг сонгох
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-[11px] py-1.5 px-2 bg-white border border-stone-300 rounded font-semibold text-stone-700 hover:bg-stone-100"
                  >
                    Цэвэрлэх
                  </button>
                </div>
              </div>
            </div>

            {/* Questions Bank List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="text-xs text-stone-500 mb-2 flex items-center justify-between">
                <span>Нийт {filteredQuestions.length} бодлого олдлоо</span>
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="py-12 text-center text-sm text-stone-400">
                  Шүүлтийн дагуу бодлого олдсонгүй.
                </div>
              ) : (
                filteredQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleSelectQuestion(q.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                          />
                          <span className="text-xs font-bold text-stone-800">
                            {q.grade}-р анги • {q.sourceTopicTitle}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {q.difficulty && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                              {q.difficulty === 'easy' ? 'Хялбар' : q.difficulty === 'medium' ? 'Дунд' : 'Ахисан'}
                            </span>
                          )}
                          {q.points && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-800">
                              {q.points} оноо
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs md:text-sm text-stone-900 leading-relaxed pl-6">
                        <MathRenderer content={q.question} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Preview and Print custom sheet */
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-stone-100 print:bg-white print:p-0">
            {/* Sheet Control Toolbar */}
            <div className="max-w-3xl mx-auto mb-4 p-3 bg-white border border-stone-200 rounded-xl flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Хуудасны гарчиг:
                </label>
                <input
                  type="text"
                  value={worksheetTitle}
                  onChange={(e) => setWorksheetTitle(e.target.value)}
                  className="w-full text-xs md:text-sm font-bold p-1.5 border border-stone-300 rounded"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnswers}
                    onChange={(e) => setIncludeAnswers(e.target.checked)}
                    className="rounded text-amber-700"
                  />
                  <span>Хариу хавсаргах</span>
                </label>

                <button
                  type="button"
                  onClick={triggerCustomPrint}
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>A4 Хэвлэх</span>
                </button>
              </div>
            </div>

            {/* Render Printable Sheet */}
            <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 border border-stone-300 print:border-none print:p-0 rounded-lg shadow-sm print:shadow-none print-container">
              <PrintHeader
                grade={selectedGrade === 'all' ? 8 : selectedGrade}
                topicTitle={worksheetTitle}
                category="СОНГОСОН БОДЛОГУУД"
                teacherVersion={includeAnswers}
              />

              <div className="space-y-4">
                {selectedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="avoid-break p-3.5 border border-stone-300 print:border-stone-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-black text-sm text-stone-950">
                          {idx + 1}.
                        </span>
                        <div className="text-sm text-stone-900 leading-relaxed">
                          <MathRenderer content={q.question} />
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-500 print:text-black">
                        ({q.sourceTopicTitle})
                      </span>
                    </div>

                    {includeAnswers && (
                      <div className="mt-2 pt-2 border-t border-dashed border-stone-300 text-xs font-semibold text-stone-800">
                        Хариу: <MathRenderer content={q.answer} className="inline font-normal" />
                      </div>
                    )}

                    {!includeAnswers && (
                      <div className="mt-3 pt-1.5 border-t border-dashed border-stone-200">
                        <div className="workspace-grid rounded border border-stone-200 print:border-stone-400 h-16" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
