'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Download, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface SingleUploadToolProps {
  title: string;
  description: string;
  actionButtonText: string;
  onProcess: (file: File) => Promise<string | Blob>; 
}

export default function SingleUploadTool({ title, description, actionButtonText, onProcess }: SingleUploadToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onProcess(file);
      if (res instanceof Blob) {
        setResult(URL.createObjectURL(res));
      } else if (typeof res === 'string') {
        setResult(res); // Assume Base64 URL
      }
    } catch (err: any) {
      setError(err.message || 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = `result_${file?.name || 'edited.png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-6">
         <Link href="/tools" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
            ← Back to Tools
         </Link>
        <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
        <p className="text-gray-400 text-lg">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Zone */}
        <div className="flex flex-col h-full">
          <div className="bg-gray-800/30 p-4 rounded-t-2xl border-b border-gray-700">
             <h2 className="text-xl font-semibold text-gray-200">Original Image</h2>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-h-[400px] border-2 border-dashed border-gray-600 rounded-b-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-800/50 transition-all overflow-hidden relative group bg-gray-900/30"
          >
            {preview ? (
              <img src={preview} alt="Upload preview" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-center p-6">
                <UploadCloud className="w-16 h-16 text-gray-500 mx-auto mb-4 group-hover:text-blue-400 transition-colors" />
                <p className="text-lg text-gray-300 font-medium">Click to upload image</p>
                <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WEBP</p>
              </div>
            )}
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleProcess}
              disabled={!file || loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${!file || loading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`}
            >
              {loading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
              ) : (
                <><ImageIcon className="w-6 h-6" /> {actionButtonText}</>
              )}
            </button>
          </div>
          {error && <p className="text-red-400 text-center mt-4 bg-red-900/20 p-3 rounded-lg border border-red-800">Error: {error}</p>}
        </div>

        {/* Result Zone */}
        <div className="flex flex-col h-full">
          <div className="bg-gray-800/30 p-4 rounded-t-2xl border-b border-gray-700">
             <h2 className="text-xl font-semibold text-gray-200">Result</h2>
          </div>
          <div className="flex-1 min-h-[400px] border border-gray-700 bg-gray-900/50 rounded-b-2xl flex items-center justify-center overflow-hidden relative shadow-inner">
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-blue-400">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="animate-pulse font-medium">AI is working its magic...</p>
              </div>
            ) : result ? (
              <img src={result} alt="Result" className="w-full h-full object-contain p-2 relative z-10" />
            ) : (
              <div className="text-center p-6 opacity-40">
                <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-lg text-gray-300">Result will appear here</p>
              </div>
            )}
            
            {/* Checkerboard pattern for background removal transparency */}
            {result && (
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333), repeating-linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
            )}
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleDownload}
              disabled={!result}
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${!result ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]'}`}
            >
              <Download className="w-6 h-6" /> Download Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}