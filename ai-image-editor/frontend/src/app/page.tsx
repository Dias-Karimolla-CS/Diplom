import Link from 'next/link';
import { Sparkles, Scissors, ZoomIn, Eraser, MoveRight, Image as ImageIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-editor-bg text-editor-text selection:bg-rose-500/30 overflow-hidden relative font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-mesh-pattern opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none group">
          <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 text-lg tracking-wider">
            Nova<span className="text-transparent bg-clip-text bg-gradient-accent">Edit</span>
          </span>
        </div>
        <Link 
          href="/editor" 
          className="btn-ghost px-5 py-2 text-sm flex items-center gap-2 hover:bg-white/[0.05]"
        >
          Open Editor
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 pb-24 px-6 max-w-5xl mx-auto text-center">
        
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] mb-8 animate-fade-in">
          <span className="flex w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-medium text-editor-text-muted">Powered by Deep Learning Models</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Professional Image Magic,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
            Right in Your Browser
          </span>
        </h1>

        <p className="text-lg text-editor-text-muted mb-12 max-w-2xl animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          The ultimate intelligent image editing platform. Leverage advanced neural networks for automated restoration, object manipulation, upscaling, and background removal without leaving the web.
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <Link
            href="/editor"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-accent text-white font-semibold rounded-2xl shadow-glow transition-all duration-300 hover:shadow-glow-lg hover:-translate-y-1 w-full sm:w-auto"
          >
            <span className="text-base tracking-wide">Figma Canvas Editor</span>
            <MoveRight className="group-hover:translate-x-1 transition-transform" size={18} />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
          </Link>
          
          <Link
            href="/tools"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-800/80 text-white font-semibold rounded-2xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full sm:w-auto backdrop-blur-sm"
          >
            <span className="text-base tracking-wide text-gray-300 group-hover:text-white">Quick AI Tools</span>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          
          <div className="glass-panel p-6 rounded-2xl text-left hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 border border-indigo-500/30">
              <Scissors className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Cutout</h3>
            <p className="text-sm text-editor-text-muted leading-relaxed">
              Instantly remove backgrounds or isolate subjects using the U2Net architecture for pixel-perfect selections.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl text-left hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/30">
              <ZoomIn className="text-purple-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">4x Upscaling</h3>
            <p className="text-sm text-editor-text-muted leading-relaxed">
              Enhance low-resolution images with Real-ESRGAN, restoring crisp details and clarifying blurry textures.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl text-left hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center mb-4 border border-rose-500/30">
              <Eraser className="text-rose-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Magic Inpaint</h3>
            <p className="text-sm text-editor-text-muted leading-relaxed">
              Remove unwanted objects seamlessly. The LaMa model intelligently generates missing context to fill the gaps.
            </p>
          </div>

        </div>

      </main>
      
      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-editor-bg to-transparent pointer-events-none" />
    </div>
  );
}
