'use client';

import { useState } from 'react';
import { Settings2, Layers, Sparkles } from 'lucide-react';
import PropertiesPanel from './PropertiesPanel';
import LayersPanel from './LayersPanel';
import AIToolsPanel from '@/components/ai/AIToolsPanel';

type Tab = 'properties' | 'layers' | 'ai';

const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'properties', label: 'Properties', Icon: Settings2 },
  { id: 'layers', label: 'Layers', Icon: Layers },
  { id: 'ai', label: 'AI Tools', Icon: Sparkles },
];

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('ai');

  return (
    <div className="flex flex-col h-full bg-editor-panel/50">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-2 border-b border-white/[0.04] flex-shrink-0 bg-black/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-[11px] font-semibold tracking-wide
              transition-all duration-300 rounded-lg relative overflow-hidden
              ${
                activeTab === tab.id
                  ? 'text-white bg-white/[0.06] shadow-sm'
                  : 'text-editor-text-muted hover:text-white hover:bg-white/[0.03]'
              }
            `}
          >
            <tab.Icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? "text-editor-accent" : ""} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'properties' && <PropertiesPanel />}
        {activeTab === 'layers' && <LayersPanel />}
        {activeTab === 'ai' && <AIToolsPanel />}
      </div>
    </div>
  );
}
