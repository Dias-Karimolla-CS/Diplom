'use client';

import React from 'react';
import SingleUploadTool from '@/components/tools/SingleUploadTool';
import { faceRestore } from '@/services/faceRestore';

export default function FaceRestorePage() {
  const handleProcess = async (file: File) => {
    // API returns a Blob
    return await faceRestore(file); 
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-10">
      <SingleUploadTool
        title="GFPGAN Face Restore"
        description="Cleanly reconstruct damaged or blurry facial features instantly using blind face restoration."
        actionButtonText="Restore Faces"
        onProcess={handleProcess}
      />
    </div>
  );
}