import React from 'react';
import { TEMPLATES } from '../constants';
import { Template } from '../types';

interface Props {
  selectedId: string;
  onSelect: (t: Template) => void;
}

const TemplateSelector: React.FC<Props> = ({ selectedId, onSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-200">1. Select Layout</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={`group relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              selectedId === t.id
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 hover:border-gray-500 bg-gray-800'
            }`}
          >
            {/* Mini visualizer of the template slots */}
            <div className="relative w-16 h-16 bg-gray-900 rounded border border-gray-600 overflow-hidden">
               {t.slots.map(s => (
                 <div
                    key={s.id}
                    className="absolute bg-gray-600 border border-gray-800"
                    style={{
                      left: `${s.x * 100}%`,
                      top: `${s.y * 100}%`,
                      width: `${s.w * 100}%`,
                      height: `${s.h * 100}%`,
                      borderRadius: `${s.radius * 30}%` // Approximate scale for mini preview
                    }}
                 />
               ))}
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white">
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;