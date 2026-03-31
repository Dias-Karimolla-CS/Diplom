'use client';

import BackgroundRemovalCard from './BackgroundRemovalCard';
import ObjectCutoutCard from './ObjectCutoutCard';
import InpaintCard from './InpaintCard';
import FaceRestoreCard from './FaceRestoreCard';
import UpscaleCard from './UpscaleCard';
import ColorCorrectionCard from './ColorCorrectionCard';

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-4 pb-2">
      <h3 className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600 uppercase tracking-[0.2em] whitespace-nowrap">
        {children}
      </h3>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-white/[0.08] to-transparent" />
    </div>
  );
}

export default function AIToolsPanel() {
  return (
    <div className="space-y-3">
      <SectionHeader>Selection & Removal</SectionHeader>
      <BackgroundRemovalCard />
      <ObjectCutoutCard />
      <InpaintCard />

      <SectionHeader>Restoration</SectionHeader>
      <FaceRestoreCard />

      <SectionHeader>Enhancement</SectionHeader>
      <UpscaleCard />
      <ColorCorrectionCard />
    </div>
  );
}
