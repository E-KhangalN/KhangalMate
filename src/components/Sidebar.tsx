import React from 'react';
import { GradeNumber } from '../types';
import { GRADES_LIST, GRADE_TOPICS_CATALOG } from '../data/initialData';
import {
  GraduationCap,
  BookOpen,
  FolderKanban,
  Settings,
  ChevronRight,
  Database,
  Printer,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';

interface SidebarProps {
  selectedGrade: GradeNumber;
  onSelectGrade: (grade: GradeNumber) => void;
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  onOpenAdmin: () => void;
  onOpenQuestionBank: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedGrade,
  onSelectGrade,
  selectedTopicId,
  onSelectTopic,
  onOpenAdmin,
  onOpenQuestionBank,
  mobileOpen,
  onCloseMobile,
}) => {
  const currentGradeTopics = GRADE_TOPICS_CATALOG[selectedGrade] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-14 bg-stone-950/40 backdrop-blur-xs z-30 lg:hidden modal-backdrop"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-30 w-72 bg-stone-900 text-stone-100 flex flex-col border-r border-stone-800 transition-transform duration-200 ease-in-out lg:sticky lg:top-14 lg:self-start lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:shrink-0 no-print ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Grades Selector Tabs */}
        <div className="p-3 border-b border-stone-800/80 bg-stone-950/40 shrink-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Анги сонгох
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 lg:hidden cursor-pointer"
              aria-label="Хаах"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {GRADES_LIST.map((grade) => {
              const isSelected = grade === selectedGrade;
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => {
                    onSelectGrade(grade);
                    // auto pick first available topic
                    const topics = GRADE_TOPICS_CATALOG[grade];
                    if (topics && topics.length > 0) {
                      onSelectTopic(topics[0].id);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-xs scale-102'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white'
                  }`}
                >
                  {grade}-р анги
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics List for selected grade */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="flex items-center justify-between px-1 mb-2 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            <span>{selectedGrade}-р ангийн сэдвүүд</span>
            <span className="text-[10px] text-stone-500">
              {currentGradeTopics.length} сэдэв
            </span>
          </div>

          <div className="space-y-1">
            {currentGradeTopics.map((topic) => {
              const isSelected = topic.id === selectedTopicId;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    onSelectTopic(topic.id);
                    onCloseMobile();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-stone-800 text-amber-400 border border-stone-700 shadow-xs'
                      : 'text-stone-300 hover:bg-stone-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        topic.hasFullPackage ? 'bg-amber-400' : 'bg-stone-600'
                      }`}
                    />
                    <span className="truncate">{topic.title}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-1">
                    {topic.hasFullPackage && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                        Бэлэн
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-amber-400' : 'text-stone-600 group-hover:text-stone-400'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Tools & Admin Navigation */}
        <div className="p-3 border-t border-stone-800 space-y-1.5 bg-stone-950/60 shrink-0">
          <button
            type="button"
            onClick={() => {
              onOpenQuestionBank();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors flex items-center space-x-2.5"
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>Асуултын сан / Захиалгат хуудас</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenAdmin();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors flex items-center space-x-2.5"
          >
            <Settings className="w-4 h-4 text-stone-400" />
            <span>Материал засах / нэмэх</span>
          </button>
        </div>
      </aside>
    </>
  );
};
