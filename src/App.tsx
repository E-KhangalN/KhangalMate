import React, { useState, useEffect, useMemo } from 'react';
import { GradeNumber, TopicPackage } from './types';
import { storageService } from './services/storageService';
import { GRADE_TOPICS_CATALOG } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { TopicPage } from './components/TopicPage';
import { QuestionBankModal } from './components/QuestionBankModal';
import { AdminEditorModal } from './components/AdminEditorModal';
import { AccessRequestsModal } from './components/AccessRequestsModal';
import { LoginView } from './components/LoginView';
import { ScreenProtection } from './components/ScreenProtection';
import { AuthUser } from './types';
import { getStoredAuth, clearStoredAuth } from './utils/deviceManager';
import { accessRequestService } from './services/accessRequestService';
import {
  Menu,
  Printer,
  Database,
  Settings,
  Sparkles,
  BookOpen,
  ChevronDown,
  FileDown,
  LogOut,
  X,
  UserCheck,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuth());
  const [topics, setTopics] = useState<TopicPackage[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<GradeNumber>(6);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('g6-divisibility');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [accessRequestsModalOpen, setAccessRequestsModalOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(() => {
    return accessRequestService.getRequests().filter((r) => r.status === 'pending').length;
  });
  const [questionBankOpen, setQuestionBankOpen] = useState(false);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const printMenuRef = React.useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
  };

  // Close print menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (printMenuRef.current && !printMenuRef.current.contains(event.target as Node)) {
        setPrintMenuOpen(false);
      }
    };
    if (printMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [printMenuOpen]);

  // Load topics from storage on mount
  useEffect(() => {
    const loaded = storageService.getTopics();
    setTopics(loaded);
  }, []);

  const refreshTopics = () => {
    const loaded = storageService.getTopics();
    setTopics(loaded);
  };

  // Find active topic or generate fallback package if clicked on catalogue item that has not been initialized
  const currentTopic: TopicPackage = useMemo(() => {
    const existing = topics.find((t) => t.id === selectedTopicId);
    if (existing) return existing;

    // Search in catalog to generate a starter package
    const catItem = GRADE_TOPICS_CATALOG[selectedGrade]?.find((item) => item.id === selectedTopicId);
    if (catItem) {
      return {
        id: catItem.id,
        grade: selectedGrade,
        category: catItem.category,
        title: catItem.title,
        code: `МАТ-${selectedGrade}.${catItem.id.slice(0, 4)}`,
        description: `${selectedGrade}-р ангийн «${catItem.title}» сэдвийн хичээлийн онол, жишээ, бие даах дасгал, сорилын багц.`,
        theory: [
          {
            id: `th-${catItem.id}-1`,
            title: `${catItem.title} - Үндсэн тодорхойлолт ба дүрэм`,
            ruleText: `«${catItem.title}» сэдвийн хүрээнд сурагчдын эзэмших суурь мэдлэг, дүрэм, чанарыг тодорхойлсон үндсэн онол.`,
            formula: 'a + b = c',
            note: 'Багш та энэхүү онолыг "Сэдэв засах" товчоор хүссэнээрээ баяжуулж болно.',
          },
        ],
        examples: [
          {
            id: `ex-${catItem.id}-1`,
            number: 1,
            title: 'Энгийн жишээ',
            problem: `${catItem.title} сэдвийн 1-р жишээ бодлогын нөхцөл.`,
            solutionSteps: ['Шинжилгээ хийж, томьёог ашиглан бодолтыг алхам дараалан гүйцэтгэнэ.'],
            answer: 'Бодлогын эцсийн хариу',
          },
        ],
        practice: [
          {
            id: `pr-${catItem.id}-1`,
            number: 1,
            question: `${catItem.title} сэдвийн анхан шатны бие даан ажиллах дасгал бодлого.`,
            difficulty: 'easy',
            answer: 'Зөв хариу',
            solution: 'Шалгах бодолт',
            workSpaceLines: 3,
          },
          {
            id: `pr-${catItem.id}-2`,
            number: 2,
            question: `${catItem.title} сэдвийн дунд шатны бодлого.`,
            difficulty: 'medium',
            answer: 'Зөв хариу',
            solution: 'Шалгах бодолт',
            workSpaceLines: 4,
          },
        ],
        test1: {
          id: `t1-${catItem.id}`,
          testNumber: 1,
          title: 'Анхан',
          subtitle: 'Анхан шатны мэдлэг шалгах сорил',
          targetSkills: 'Үндсэн ойлголтуудыг бататгах',
          totalPoints: 10,
          questions: [
            {
              id: `t1-q1-${catItem.id}`,
              number: 1,
              question: 'Сэдвийн хүрээнд анхан шатны сорилын асуулт 1.',
              points: 5,
              answer: 'Хариу 1',
              workSpaceLines: 3,
            },
            {
              id: `t1-q2-${catItem.id}`,
              number: 2,
              question: 'Сэдвийн хүрээнд анхан шатны сорилын асуулт 2.',
              points: 5,
              answer: 'Хариу 2',
              workSpaceLines: 3,
            },
          ],
        },
        test2: {
          id: `t2-${catItem.id}`,
          testNumber: 2,
          title: 'Дунд',
          subtitle: 'Дунд шатны хэрэглээний сорил',
          targetSkills: 'Стандарт түвшний бодлого бодох',
          totalPoints: 10,
          questions: [
            {
              id: `t2-q1-${catItem.id}`,
              number: 1,
              question: 'Стандарт түвшний сорилын асуулт 1.',
              points: 5,
              answer: 'Хариу 1',
              workSpaceLines: 3,
            },
            {
              id: `t2-q2-${catItem.id}`,
              number: 2,
              question: 'Стандарт түвшний сорилын асуулт 2.',
              points: 5,
              answer: 'Хариу 2',
              workSpaceLines: 3,
            },
          ],
        },
        test3: {
          id: `t3-${catItem.id}`,
          testNumber: 3,
          title: 'Гүнзгий',
          subtitle: 'Гүнзгийрүүлсэн сорил',
          targetSkills: 'Нийлмэл бодлого бодох',
          totalPoints: 10,
          questions: [
            {
              id: `t3-q1-${catItem.id}`,
              number: 1,
              question: 'Гүнзгийрүүлсэн түвшний сорилын асуулт 1.',
              points: 5,
              answer: 'Хариу 1',
              workSpaceLines: 4,
            },
            {
              id: `t3-q2-${catItem.id}`,
              number: 2,
              question: 'Гүнзгийрүүлсэн түвшний сорилын асуулт 2.',
              points: 5,
              answer: 'Хариу 2',
              workSpaceLines: 4,
            },
          ],
        },
      };
    }

    // fallback to first available
    return topics[0] || ({} as TopicPackage);
  }, [topics, selectedTopicId, selectedGrade]);

  const handleSearchResultSelect = (grade: GradeNumber, topicId: string) => {
    setSelectedGrade(grade);
    setSelectedTopicId(topicId);
  };

  if (!currentUser) {
    return (
      <>
        <ScreenProtection />
        <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900">
      <ScreenProtection />
      {/* Top Navigation Bar on Screen */}
      <header className="screen-header bg-white border-b border-stone-200 sticky top-0 z-40 h-14 px-4 flex items-center shadow-2xs no-print">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
              className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 lg:hidden cursor-pointer"
              aria-label={mobileSidebarOpen ? 'Цэс хаах' : 'Цэс нээх'}
            >
              {mobileSidebarOpen ? <X className="w-5 h-5 text-stone-900" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-2">
              <span className="w-7 h-7 rounded-md bg-stone-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                ∑
              </span>
              <span className="font-extrabold text-sm md:text-base tracking-tight text-stone-950 hidden sm:inline whitespace-nowrap">
                Математикийн сургалтын материалын сан
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2">
            <SearchBar onSelectResult={handleSearchResultSelect} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setAccessRequestsModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 border border-stone-200 flex items-center space-x-1.5 transition-colors cursor-pointer relative"
              title="Нэвтрэх хүсэлтүүдийг хянах, зөвшөөрөх"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Хүсэлтүүд</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-extrabold animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAdminModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 border border-stone-200 hidden sm:flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-stone-500" />
              <span>Удирдлага</span>
            </button>

            {/* Unified Print & PDF Menu */}
            <div className="relative" ref={printMenuRef}>
              <button
                type="button"
                onClick={() => setPrintMenuOpen((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-900 hover:bg-black text-white flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                aria-expanded={printMenuOpen}
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Хэвлэх</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-150 ${printMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {printMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setPrintMenuOpen(false);
                      window.print();
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-stone-50 flex items-center space-x-2.5 transition-colors group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">Хэвлэх (A4)</div>
                      <div className="text-[10px] text-stone-500">Принтер рүү шууд илгээх</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-stone-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setPrintMenuOpen(false);
                      window.print();
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-stone-50 flex items-center space-x-2.5 transition-colors group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                      <FileDown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">PDF-ээр хадгалах</div>
                      <div className="text-[10px] text-stone-500">Цонхноос &quot;Save as PDF&quot; сонгох</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <div className="flex items-center pl-1.5 border-l border-stone-200">
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:text-red-700 hover:bg-red-50 border border-stone-200 hover:border-red-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Системээс гарах"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-500 hover:text-red-700" />
                <span className="font-semibold">Гарах</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout: Sidebar + Main Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto items-start">
        {/* Left Sidebar */}
        <Sidebar
          selectedGrade={selectedGrade}
          onSelectGrade={setSelectedGrade}
          selectedTopicId={selectedTopicId}
          onSelectTopic={setSelectedTopicId}
          onOpenAdmin={() => setAdminModalOpen(true)}
          onOpenQuestionBank={() => setQuestionBankOpen(true)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
          {currentTopic.id ? (
            <TopicPage
              topic={currentTopic}
              onOpenAdmin={() => setAdminModalOpen(true)}
            />
          ) : (
            <div className="text-center py-20 text-stone-400">
              Сэдэв сонгоно уу.
            </div>
          )}
        </main>
      </div>

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={questionBankOpen}
        onClose={() => setQuestionBankOpen(false)}
        topics={topics}
      />

      {/* Admin Material Editor Modal */}
      <AdminEditorModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        activeTopic={currentTopic}
        onTopicUpdated={(updated) => {
          setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }}
        onRefreshAllTopics={refreshTopics}
        onLogout={() => {
          clearStoredAuth();
          setCurrentUser(null);
        }}
      />

      {/* Access Requests Management Modal */}
      <AccessRequestsModal
        isOpen={accessRequestsModalOpen}
        onClose={() => setAccessRequestsModalOpen(false)}
        onRequestCountChange={setPendingRequestsCount}
      />
    </div>
  );
}
