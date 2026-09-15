import React, { useState } from 'react';
import { TopicPackage, GradeNumber, TheoryRule, WorkedExample, PracticeProblem, TestQuestion } from '../types';
import { storageService } from '../services/storageService';
import { MathRenderer } from './MathRenderer';
import {
  X,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Download,
  Upload,
  BookOpen,
  Lightbulb,
  PencilLine,
  Award,
  CheckCircle2,
  Laptop,
  UserCheck,
} from 'lucide-react';
import { ActiveDevicesTab } from './ActiveDevicesTab';
import { AccessRequestsTab } from './AccessRequestsTab';

interface AdminEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTopic: TopicPackage;
  onTopicUpdated: (updatedTopic: TopicPackage) => void;
  onRefreshAllTopics: () => void;
  onLogout?: () => void;
}

export const AdminEditorModal: React.FC<AdminEditorModalProps> = ({
  isOpen,
  onClose,
  activeTopic,
  onTopicUpdated,
  onRefreshAllTopics,
  onLogout,
}) => {
  const [topic, setTopic] = useState<TopicPackage>({ ...activeTopic });
  const [activeTab, setActiveTab] = useState<'info' | 'theory' | 'examples' | 'practice' | 'tests' | 'json' | 'devices' | 'requests'>('info');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync state when activeTopic changes
  React.useEffect(() => {
    setTopic({ ...activeTopic });
  }, [activeTopic]);

  if (!isOpen) return null;

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSave = () => {
    storageService.saveTopic(topic);
    onTopicUpdated(topic);
    onRefreshAllTopics();
    showStatus('Амжилттай хадгалагдлаа!');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Бүх өөрчлөлтийг цуцалж, анхны үндсэн сургалтын багц руу шилжүүлэх үү?')) {
      const reset = storageService.resetToDefaults();
      onRefreshAllTopics();
      const current = reset.find((t) => t.id === topic.id) || reset[0];
      setTopic(current);
      onTopicUpdated(current);
      showStatus('Үндсэн төлөвт шилжүүллээ.');
    }
  };

  const handleExportJson = () => {
    const jsonStr = storageService.exportAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathematics_curriculum_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('JSON файл татагдлаа.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importFromJSON(content);
      if (res.success) {
        onRefreshAllTopics();
        const reloaded = storageService.getTopicById(topic.id) || storageService.getTopics()[0];
        setTopic(reloaded);
        onTopicUpdated(reloaded);
        showStatus(`Амжилттай! ${res.count} сэдэв ачаалагдлаа.`);
      } else {
        alert(res.error || 'Файлыг уншихад алдаа гарлаа.');
      }
    };
    reader.readAsText(file);
  };

  // Add sub-items helpers
  const addTheoryRule = () => {
    const newRule: TheoryRule = {
      id: `th-${Date.now()}`,
      title: 'Шинэ дүрмийн нэр',
      ruleText: 'Дүрмийн тайлбар энд бичнэ үү.',
      formula: '',
      badge: 'Дүрэм',
    };
    setTopic({ ...topic, theory: [...topic.theory, newRule] });
  };

  const removeTheoryRule = (index: number) => {
    const updated = [...topic.theory];
    updated.splice(index, 1);
    setTopic({ ...topic, theory: updated });
  };

  const addWorkedExample = () => {
    const newEx: WorkedExample = {
      id: `ex-${Date.now()}`,
      number: (topic.examples?.length || 0) + 1,
      title: 'Шинэ жишээ',
      problem: 'Бодлогын нөхцөлийг бичнэ үү.',
      solutionSteps: ['Алхам 1: ...', 'Алхам 2: ...'],
      answer: 'Хариу',
    };
    setTopic({ ...topic, examples: [...(topic.examples || []), newEx] });
  };

  const removeWorkedExample = (index: number) => {
    const updated = [...(topic.examples || [])];
    updated.splice(index, 1);
    // renumber
    updated.forEach((item, idx) => {
      item.number = idx + 1;
    });
    setTopic({ ...topic, examples: updated });
  };

  const addPracticeProblem = () => {
    const newPr: PracticeProblem = {
      id: `pr-${Date.now()}`,
      number: (topic.practice?.length || 0) + 1,
      question: 'Шинэ дасгал бодлого ($x + 1 = 2$)',
      difficulty: 'medium',
      answer: '$x = 1$',
      solution: 'Бодолтын тайлбар',
      workSpaceLines: 4,
    };
    setTopic({ ...topic, practice: [...(topic.practice || []), newPr] });
  };

  const removePracticeProblem = (index: number) => {
    const updated = [...(topic.practice || [])];
    updated.splice(index, 1);
    updated.forEach((item, idx) => {
      item.number = idx + 1;
    });
    setTopic({ ...topic, practice: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-stone-900/60 backdrop-blur-xs overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] max-h-[92vh] flex flex-col shadow-2xl border border-stone-300 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 p-4 md:px-6 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white z-20">
          <div>
            <div className="text-xs uppercase text-amber-400 font-bold tracking-wider">
              Удирдлага
            </div>
            <h2 className="text-base md:text-lg font-black tracking-tight">
              Сэдэв засах: {topic.title} ({topic.grade}-р анги)
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {statusMessage && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                {statusMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center space-x-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Хадгалах</span>
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

        {/* Tab Navigation - Pinned and never scrolls off */}
        <div className="shrink-0 flex border-b border-stone-200 bg-stone-100 px-4 overflow-x-auto text-xs font-bold z-10">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`shrink-0 whitespace-nowrap py-3 px-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'info'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Үндсэн мэдээлэл</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className={`shrink-0 whitespace-nowrap py-3 px-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'theory'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Онолын дүрэм ({topic.theory?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`shrink-0 whitespace-nowrap py-3 px-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'examples'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Жишээ бодлого ({topic.examples?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`shrink-0 whitespace-nowrap py-3 px-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'practice'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <PencilLine className="w-3.5 h-3.5" />
            <span>Бие даах дасгал ({topic.practice?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`shrink-0 whitespace-nowrap py-3 px-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'tests'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Анхан, Дунд, Гүнзгий</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`shrink-0 whitespace-nowrap py-3 px-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'json'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Нөөц хуулбар / Импорт</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('devices')}
            className={`shrink-0 whitespace-nowrap py-3 px-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'devices'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Нэвтэрсэн төхөөрөмжүүд</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`shrink-0 whitespace-nowrap py-3 px-3.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'requests'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Нэвтрэх хүсэлтүүд</span>
          </button>
        </div>

        {/* Tab Content - Scrolls independently without pushing tabs away */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 bg-white">
          {/* 1. INFO TAB */}
          {activeTab === 'info' && (
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Анги:</label>
                  <select
                    value={topic.grade}
                    onChange={(e) => setTopic({ ...topic, grade: Number(e.target.value) as GradeNumber })}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 font-medium"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>
                        {g}-р анги
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Сэдвийн код:</label>
                  <input
                    type="text"
                    value={topic.code || ''}
                    onChange={(e) => setTopic({ ...topic, code: e.target.value })}
                    placeholder="Жишээ: МАТ-6.1.2"
                    className="w-full text-xs p-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Сэдвийн нэр:</label>
                <input
                  type="text"
                  value={topic.title}
                  onChange={(e) => setTopic({ ...topic, title: e.target.value })}
                  className="w-full text-xs md:text-sm font-bold p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Агуулгын аймаг (Category):</label>
                <input
                  type="text"
                  value={topic.category}
                  onChange={(e) => setTopic({ ...topic, category: e.target.value })}
                  placeholder="Тоо ба тоолол / Алгебр / Геометр ..."
                  className="w-full text-xs p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Товч тайлбар:</label>
                <textarea
                  value={topic.description}
                  onChange={(e) => setTopic({ ...topic, description: e.target.value })}
                  rows={3}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Өмнөх ангийн суурь мэдлэгийн залгамж тайлбар:
                </label>
                <textarea
                  value={topic.prerequisiteNotice || ''}
                  onChange={(e) => setTopic({ ...topic, prerequisiteNotice: e.target.value })}
                  rows={2}
                  placeholder="Жишээ: 6, 7-р ангийн суурь мэдлэг дээр тулгуурласан..."
                  className="w-full text-xs p-2 rounded-lg border border-stone-300"
                />
              </div>
            </div>
          )}

          {/* 2. THEORY TAB */}
          {activeTab === 'theory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">
                  LaTeX томьёог $...$ эсвэл $$...$$ хаалтанд бичиж болно.
                </span>
                <button
                  type="button"
                  onClick={addTheoryRule}
                  className="text-xs px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Шинэ дүрэм нэмэх</span>
                </button>
              </div>

              <div className="space-y-4">
                {topic.theory.map((rule, idx) => (
                  <div key={rule.id || idx} className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={rule.title}
                          onChange={(e) => {
                            const updated = [...topic.theory];
                            updated[idx].title = e.target.value;
                            setTopic({ ...topic, theory: updated });
                          }}
                          placeholder="Дүрмийн гарчиг"
                          className="text-xs font-bold p-1.5 bg-white border border-stone-300 rounded"
                        />
                        <input
                          type="text"
                          value={rule.badge || ''}
                          onChange={(e) => {
                            const updated = [...topic.theory];
                            updated[idx].badge = e.target.value;
                            setTopic({ ...topic, theory: updated });
                          }}
                          placeholder="Шошго (жишээ: 2 ба 3-т зэрэг)"
                          className="text-xs p-1.5 bg-white border border-stone-300 rounded"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTheoryRule(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <textarea
                        value={rule.ruleText}
                        onChange={(e) => {
                          const updated = [...topic.theory];
                          updated[idx].ruleText = e.target.value;
                          setTopic({ ...topic, theory: updated });
                        }}
                        rows={2}
                        placeholder="Дүрмийн текст..."
                        className="w-full text-xs p-2 bg-white border border-stone-300 rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={rule.formula || ''}
                        onChange={(e) => {
                          const updated = [...topic.theory];
                          updated[idx].formula = e.target.value;
                          setTopic({ ...topic, theory: updated });
                        }}
                        placeholder="LaTeX томьёо (жишээ: a \vdots 2)"
                        className="text-xs p-1.5 bg-white border border-stone-300 rounded"
                      />
                      <input
                        type="text"
                        value={rule.note || ''}
                        onChange={(e) => {
                          const updated = [...topic.theory];
                          updated[idx].note = e.target.value;
                          setTopic({ ...topic, theory: updated });
                        }}
                        placeholder="Тайлбар / жишээ..."
                        className="text-xs p-1.5 bg-white border border-stone-300 rounded"
                      />
                    </div>

                    {/* Quick Preview */}
                    <div className="p-2 bg-white rounded border border-stone-200 text-xs">
                      <span className="text-[10px] text-stone-400 font-bold block mb-1">
                        Урьдчилан харах:
                      </span>
                      <MathRenderer content={rule.ruleText} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. EXAMPLES TAB */}
          {activeTab === 'examples' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">
                  Жишээ бодлогын нөхцөл, алхамчилсан бодолт, хариуг оруулах.
                </span>
                <button
                  type="button"
                  onClick={addWorkedExample}
                  className="text-xs px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Шинэ жишээ нэмэх</span>
                </button>
              </div>

              <div className="space-y-4">
                {topic.examples.map((ex, idx) => (
                  <div key={ex.id || idx} className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-stone-900">
                        Жишээ {ex.number}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeWorkedExample(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={ex.problem}
                      onChange={(e) => {
                        const updated = [...topic.examples];
                        updated[idx].problem = e.target.value;
                        setTopic({ ...topic, examples: updated });
                      }}
                      placeholder="Бодлогын нөхцөл ($...$)"
                      className="w-full text-xs font-semibold p-2 bg-white border border-stone-300 rounded"
                    />

                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        Бодолтын алхмууд (мөр бүрээр):
                      </label>
                      <textarea
                        value={ex.solutionSteps.join('\n')}
                        onChange={(e) => {
                          const updated = [...topic.examples];
                          updated[idx].solutionSteps = e.target.value.split('\n');
                          setTopic({ ...topic, examples: updated });
                        }}
                        rows={3}
                        className="w-full text-xs p-2 bg-white border border-stone-300 rounded"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={ex.answer}
                        onChange={(e) => {
                          const updated = [...topic.examples];
                          updated[idx].answer = e.target.value;
                          setTopic({ ...topic, examples: updated });
                        }}
                        placeholder="Эцсийн хариу"
                        className="w-full text-xs font-bold p-1.5 bg-white border border-stone-300 rounded text-amber-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PRACTICE TAB */}
          {activeTab === 'practice' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">
                  Бие даах дасгал (Хялбар → Дунд → Ахисан шатлалтай)
                </span>
                <button
                  type="button"
                  onClick={addPracticeProblem}
                  className="text-xs px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Шинэ дасгал нэмэх</span>
                </button>
              </div>

              <div className="space-y-4">
                {topic.practice.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 border border-stone-200 rounded-xl bg-stone-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-stone-900">
                        Дасгал {item.number}
                      </span>
                      <div className="flex items-center space-x-2">
                        <select
                          value={item.difficulty}
                          onChange={(e) => {
                            const updated = [...topic.practice];
                            updated[idx].difficulty = e.target.value as any;
                            setTopic({ ...topic, practice: updated });
                          }}
                          className="text-xs p-1 rounded border border-stone-300 font-bold bg-white"
                        >
                          <option value="easy">Хялбар</option>
                          <option value="medium">Дунд</option>
                          <option value="hard">Ахисан</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removePracticeProblem(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={item.question}
                      onChange={(e) => {
                        const updated = [...topic.practice];
                        updated[idx].question = e.target.value;
                        setTopic({ ...topic, practice: updated });
                      }}
                      rows={2}
                      placeholder="Бодлогын нөхцөл..."
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.hint || ''}
                        onChange={(e) => {
                          const updated = [...topic.practice];
                          updated[idx].hint = e.target.value;
                          setTopic({ ...topic, practice: updated });
                        }}
                        placeholder="Зөвлөмж / Сануулга"
                        className="text-xs p-1.5 bg-white border border-stone-300 rounded"
                      />
                      <input
                        type="text"
                        value={item.answer}
                        onChange={(e) => {
                          const updated = [...topic.practice];
                          updated[idx].answer = e.target.value;
                          setTopic({ ...topic, practice: updated });
                        }}
                        placeholder="Зөв хариу"
                        className="text-xs p-1.5 bg-white border border-stone-300 rounded font-semibold text-emerald-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. TESTS TAB */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              {[topic.test1, topic.test2, topic.test3].map((test, tIdx) => (
                <div key={test.id || tIdx} className="p-4 border border-stone-300 rounded-xl bg-stone-50 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-black text-sm uppercase text-stone-900">
                      {test.title} (Нийт {test.totalPoints} оноо)
                    </span>
                    <span className="text-xs font-bold text-stone-500">
                      {test.questions.length} асуулт
                    </span>
                  </div>

                  <div className="space-y-2">
                    {test.questions.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="p-2.5 bg-white border border-stone-200 rounded text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800">Асуулт {q.number}:</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-[11px] text-stone-500">Оноо:</span>
                            <input
                              type="number"
                              value={q.points}
                              onChange={(e) => {
                                const newQuestions = [...test.questions];
                                newQuestions[qIdx].points = Number(e.target.value);
                                if (tIdx === 0) setTopic({ ...topic, test1: { ...test, questions: newQuestions } });
                                if (tIdx === 1) setTopic({ ...topic, test2: { ...test, questions: newQuestions } });
                                if (tIdx === 2) setTopic({ ...topic, test3: { ...test, questions: newQuestions } });
                              }}
                              className="w-12 p-0.5 border rounded text-center text-xs"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => {
                            const newQuestions = [...test.questions];
                            newQuestions[qIdx].question = e.target.value;
                            if (tIdx === 0) setTopic({ ...topic, test1: { ...test, questions: newQuestions } });
                            if (tIdx === 1) setTopic({ ...topic, test2: { ...test, questions: newQuestions } });
                            if (tIdx === 2) setTopic({ ...topic, test3: { ...test, questions: newQuestions } });
                          }}
                          className="w-full p-1.5 border rounded"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => {
                              const newQuestions = [...test.questions];
                              newQuestions[qIdx].answer = e.target.value;
                              if (tIdx === 0) setTopic({ ...topic, test1: { ...test, questions: newQuestions } });
                              if (tIdx === 1) setTopic({ ...topic, test2: { ...test, questions: newQuestions } });
                              if (tIdx === 2) setTopic({ ...topic, test3: { ...test, questions: newQuestions } });
                            }}
                            placeholder="Зөв хариу"
                            className="flex-1 p-1 border rounded text-emerald-800 font-bold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6. JSON / BACKUP TAB */}
          {activeTab === 'json' && (
            <div className="space-y-4 max-w-xl">
              <div className="p-4 border border-stone-200 rounded-xl bg-stone-50 space-y-3">
                <h3 className="text-xs font-bold uppercase text-stone-800">
                  Мэдээллийн нөөц хуулбар ба импорт
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Та бэлтгэсэн сургалтын материалуудаа компьютертээ JSON файл болгон татаж авах, эсвэл өөр төхөөрөмжөөс оруулж ирэх боломжтой. Энэ нь кодод гар хүрэлгүйгээр мэдээллийн сангаа хадгалах боломжийг олгоно.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>JSON файл татах</span>
                  </button>

                  <label className="px-3 py-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer">
                    <Upload className="w-4 h-4 text-stone-600" />
                    <span>JSON файл оруулах</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Анхны төлөвт буцаах</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. DEVICES TAB */}
          {activeTab === 'devices' && (
            <ActiveDevicesTab
              onLogoutCurrent={() => {
                onClose();
                if (onLogout) {
                  onLogout();
                }
              }}
            />
          )}

          {/* 8. REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="h-full">
              <AccessRequestsTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
