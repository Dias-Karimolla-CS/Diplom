'use client';

import { useState } from 'react';
import { ImageIcon, Film } from 'lucide-react';
import EditorRoot from '@/components/editor/EditorRoot';
import VideoEditor from '@/components/video/VideoEditor';

type Tab = 'image' | 'video';

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('image');

  return (
    <div className="flex flex-col h-screen bg-editor-bg">
      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'image' ? (
          <EditorRoot activeTab={activeTab} onTabChange={setActiveTab} />
        ) : (
          <div className="h-full flex flex-col">
            {/* Top bar for video tab */}
            <header className="h-12 flex items-center px-4 border-b border-white/[0.04] bg-editor-panel/80 backdrop-blur-xl shrink-0">
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-accent text-base tracking-tight mr-8">
                AI Editor
              </span>
              <nav className="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('image')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 text-editor-text-muted hover:text-editor-text hover:bg-white/[0.04]"
                >
                  <ImageIcon size={13} />
                  Image
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 bg-white/[0.08] text-editor-text"
                >
                  <Film size={13} />
                  Video
                </button>
              </nav>
            </header>
            <div className="flex-1 overflow-y-auto">
              <VideoEditor />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
