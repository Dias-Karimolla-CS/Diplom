'use client';

import React, { useState } from 'react';
import SingleUploadTool from '@/components/tools/SingleUploadTool';
import { generatePackshot } from '@/services/packshot';
import { CheckCircle2, AlertTriangle, ShieldX } from 'lucide-react';

export default function PackshotPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [qcStatus, setQcStatus] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [failures, setFailures] = useState<string[]>([]);

  const handleProcess = async (file: File) => {
    setLogs([]);
    setQcStatus(null);
    setWarnings([]);
    setFailures([]);

    // Call the API
    const response = await generatePackshot(file, false);
    
    // Log the outputs
    if (response.pipeline_log) setLogs(response.pipeline_log);
    if (response.status) setQcStatus(response.status);
    if (response.warnings) setWarnings(response.warnings);
    if (response.failed_reasons) setFailures(response.failed_reasons);

    return response.image_base64; // Will be displayed in the result pane
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-10">
      <SingleUploadTool
        title="B2B Packshot Generator"
        description="A specialized orchestration pipeline that composes a flawless marketplace shot. Cleans shadows, centers product, and generates pure white background."
        actionButtonText="Generate 2.5k Packshot"
        onProcess={handleProcess}
      />
      
      {/* Logs/QC display */}
      {(logs.length > 0 || qcStatus) && (
        <div className="max-w-4xl mx-auto px-6 pb-20 fade-in slide-up">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              {qcStatus === 'PASSED' ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : qcStatus === 'PASSED_WITH_WARNINGS' ? (
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              ) : (
                <ShieldX className="w-8 h-8 text-red-500" />
              )}
              <h2 className="text-2xl font-bold text-white">Quality Control: {qcStatus?.replace(/_/g, ' ')}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-sm mb-3">Pipeline Log</h3>
                <ul className="space-y-2 text-sm">
                  {logs.map((log, i) => (
                    <li key={i} className="text-gray-300 bg-gray-800/50 p-2 rounded relative pl-6">
                      <span className="w-2 h-2 rounded-full border border-blue-500 bg-blue-400/20 absolute left-2 top-2.5"></span>
                      {log}
                    </li>
                  ))}
                </ul>
              </div>

              {(warnings.length > 0 || failures.length > 0) && (
                <div className="space-y-6">
                  {failures.length > 0 && (
                     <div>
                       <h3 className="text-red-400 font-semibold uppercase tracking-wider text-sm mb-3">QC Failures</h3>
                       <ul className="space-y-2">
                         {failures.map((f, i) => (
                           <li key={i} className="text-red-200 bg-red-900/20 border border-red-800/30 p-2 rounded shadow-inner text-sm">{f}</li>
                         ))}
                       </ul>
                     </div>
                  )}
                  {warnings.length > 0 && (
                     <div>
                       <h3 className="text-yellow-400 font-semibold uppercase tracking-wider text-sm mb-3">Warnings</h3>
                       <ul className="space-y-2">
                         {warnings.map((w, i) => (
                           <li key={i} className="text-yellow-200 bg-yellow-900/20 border border-yellow-800/30 p-2 rounded shadow-inner text-sm">{w}</li>
                         ))}
                       </ul>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}