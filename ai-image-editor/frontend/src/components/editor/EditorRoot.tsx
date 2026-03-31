'use client';

import { CanvasProvider } from './CanvasContext';
import FabricCanvas from './FabricCanvas';
import CanvasOverlay from './CanvasOverlay';
import LeftToolbar from '@/components/toolbar/LeftToolbar';
import TopBar from '@/components/toolbar/TopBar';
import RightPanel from '@/components/panels/RightPanel';

interface EditorRootProps {
  activeTab: string;
  onTabChange: (tab: 'image' | 'video') => void;
}

export default function EditorRoot({ activeTab, onTabChange }: EditorRootProps) {
  return (
    <CanvasProvider>
      <div className="flex flex-col h-full bg-editor-bg text-editor-text overflow-hidden">
        <TopBar activeTab={activeTab} onTabChange={onTabChange} />

        <div className="flex flex-1 overflow-hidden">
          <LeftToolbar />

          {/* Canvas area with modern grid pattern and mesh background */}
          <div className="relative flex-1 overflow-hidden bg-editor-surface">
            {/* Ambient mesh gradient background */}
            <div className="absolute inset-0 bg-mesh-pattern opacity-40 mix-blend-screen pointer-events-none" />
            
            {/* Improved grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #fff 1px, transparent 1px),
                  linear-gradient(to bottom, #fff 1px, transparent 1px)
                `,
                backgroundSize: '32px 32px',
              }}
            />
            {/* Center crosshair / guide */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.02] pointer-events-none" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.02] pointer-events-none" />

            <FabricCanvas />
            <CanvasOverlay />
          </div>

          {/* Right Panel */}
          <div className="w-80 border-l border-white/[0.04] bg-editor-panel/75 backdrop-blur-2xl overflow-y-auto flex-shrink-0 z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.2)]">
            <RightPanel />
          </div>
        </div>
      </div>
    </CanvasProvider>
  );
}
