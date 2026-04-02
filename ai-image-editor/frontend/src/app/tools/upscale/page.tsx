'use client';

import React from 'react';
import SingleUploadTool from '@/components/tools/SingleUploadTool';
import { upscaleImage } from '@/services/upscale';

export default function UpscalePage() {
  const handleProcess = async (file: File) => {
    // API returns a Blob
    return await upscaleImage(file, 2); // Default to 2x for speed, could parametrically pass scale
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-10">
      <SingleUploadTool
        title="Real-ESRGAN Upscaling"
        description="Multiply your image resolution exponentially while recovering lost details."
        actionButtonText="Upscale 2x"
        onProcess={handleProcess}
      />
    </div>
  );
}