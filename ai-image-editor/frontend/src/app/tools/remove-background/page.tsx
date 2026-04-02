'use client';

import React from 'react';
import SingleUploadTool from '@/components/tools/SingleUploadTool';
import { removeBackground } from '@/services/backgroundRemoval';

export default function RemoveBackgroundPage() {
  const handleProcess = async (file: File) => {
    // API naturally returns a Blob
    return await removeBackground(file);
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-10">
      <SingleUploadTool
        title="Background Removal"
        description="Extract subjects from images automatically using AI. Best for single objects, portraits, and product photos."
        actionButtonText="Remove Background"
        onProcess={handleProcess}
      />
    </div>
  );
}