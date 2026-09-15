import React from 'react';
import { PrintSectionsSelection, PrintOptions } from '../types';

interface PrintControlPanelProps {
  selection: PrintSectionsSelection;
  onChangeSelection: (newSelection: PrintSectionsSelection) => void;
  options?: PrintOptions;
  onChangeOptions?: (newOptions: PrintOptions) => void;
}

export const PrintControlPanel: React.FC<PrintControlPanelProps> = ({
  selection,
  onChangeSelection,
}) => {
  const toggleSection = (key: keyof PrintSectionsSelection) => {
    onChangeSelection({
      ...selection,
      [key]: !selection[key],
    });
  };

  return (
    <aside className="print-control-panel bg-white border border-stone-200 rounded-xl p-3 shadow-xs mb-6 sticky top-4 z-10 no-print">
      {/* Checkboxes List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <label className="flex items-center space-x-2 text-xs font-semibold text-stone-800 cursor-pointer select-none p-1.5 rounded hover:bg-stone-50">
          <input
            type="checkbox"
            checked={selection.theory}
            onChange={() => toggleSection('theory')}
            className="w-4 h-4 rounded text-amber-700 border-stone-300 focus:ring-amber-500 accent-amber-700"
          />
          <span>Онол</span>
        </label>

        <label className="flex items-center space-x-2 text-xs font-semibold text-stone-800 cursor-pointer select-none p-1.5 rounded hover:bg-stone-50">
          <input
            type="checkbox"
            checked={selection.examples}
            onChange={() => toggleSection('examples')}
            className="w-4 h-4 rounded text-amber-700 border-stone-300 focus:ring-amber-500 accent-amber-700"
          />
          <span>Жишээ</span>
        </label>

        <label className="flex items-center space-x-2 text-xs font-semibold text-stone-800 cursor-pointer select-none p-1.5 rounded hover:bg-stone-50">
          <input
            type="checkbox"
            checked={selection.practice}
            onChange={() => toggleSection('practice')}
            className="w-4 h-4 rounded text-amber-700 border-stone-300 focus:ring-amber-500 accent-amber-700"
          />
          <span>Дасгал</span>
        </label>

        <label className="flex items-center space-x-2 text-xs font-semibold text-stone-800 cursor-pointer select-none p-1.5 rounded hover:bg-stone-50">
          <input
            type="checkbox"
            checked={selection.test1}
            onChange={() => toggleSection('test1')}
            className="w-4 h-4 rounded text-amber-700 border-stone-300 focus:ring-amber-500 accent-amber-700"
          />
          <span>Анхан</span>
        </label>

        <label className="flex items-center space-x-2 text-xs font-semibold text-stone-800 cursor-pointer select-none p-1.5 rounded hover:bg-stone-50">
          <input
            type="checkbox"
            checked={selection.test2}
            onChange={() => toggleSection('test2')}
            className="w-4 h-4 rounded text-amber-700 border-stone-300 focus:ring-amber-500 accent-amber-700"
          />
          <span>Дунд</span>
        </label>

        <label className="flex items-center space-x-2 text-xs font-semibold text-stone-800 cursor-pointer select-none p-1.5 rounded hover:bg-stone-50">
          <input
            type="checkbox"
            checked={selection.test3}
            onChange={() => toggleSection('test3')}
            className="w-4 h-4 rounded text-amber-700 border-stone-300 focus:ring-amber-500 accent-amber-700"
          />
          <span>Гүнзгий</span>
        </label>

        <label className="flex items-center space-x-2 text-xs font-bold text-amber-900 bg-amber-50/70 cursor-pointer select-none p-1.5 rounded border border-amber-200">
          <input
            type="checkbox"
            checked={selection.answers}
            onChange={() => toggleSection('answers')}
            className="w-4 h-4 rounded text-amber-700 border-amber-400 focus:ring-amber-500 accent-amber-700"
          />
          <span>Хариу хэвлэх</span>
        </label>
      </div>
    </aside>
  );
};
