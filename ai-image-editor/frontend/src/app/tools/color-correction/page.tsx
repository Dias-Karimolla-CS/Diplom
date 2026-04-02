'use client';

import React from 'react';
import SingleUploadTool from '@/components/tools/SingleUploadTool';
import { colorCorrection } from '@/services/colorCorrection';

export default function ColorCorrectionPage() {
  const handleProcess = async (file: File) => {
    // API returns a Blob
    return await colorCorrection(file);
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-10">
      <SingleUploadTool
        title="Zero-DCE Color Correction"
        description="Fix low-light photography, revive colors, and auto-enhance exposure with deep learning."
        actionButtonText="Auto-Enhance Color"
        onProcess={handleProcess}
      />
    </div>
  );
}