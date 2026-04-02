import Link from 'next/link';
import { Scissors, Zap, Sun, Wand2, Box } from 'lucide-react';

export default function ToolsLandingPage() {
  const tools = [
    {
      title: 'Background Removal',
      description: 'Instantly cut out your subjects with pixel-perfect precision using U^2-Net technology.',
      icon: <Scissors className="w-10 h-10 mb-4 text-blue-400" />,
      href: '/tools/remove-background',
      color: 'from-blue-600/20 to-purple-600/20',
      border: 'hover:border-blue-500'
    },
    {
      title: 'AI Upscaling',
      description: 'Enhance image resolution up to 4x while recovering realistic details via Real-ESRGAN.',
      icon: <ZoomInIcon className="w-10 h-10 mb-4 text-green-400" />,
      href: '/tools/upscale',
      color: 'from-green-600/20 to-emerald-600/20',
      border: 'hover:border-green-500'
    },
    {
      title: 'Color Correction',
      description: 'Fix underexposed photos and perfectly balance illumination with Zero-DCE.',
      icon: <Sun className="w-10 h-10 mb-4 text-yellow-400" />,
      href: '/tools/color-correction',
      color: 'from-yellow-600/20 to-orange-600/20',
      border: 'hover:border-yellow-500'
    },
    {
      title: 'Face Restoration',
      description: 'Restore and enhance faces in degraded images to stunning clarity using GFPGAN.',
      icon: <Wand2 className="w-10 h-10 mb-4 text-pink-400" />,
      href: '/tools/face-restore',
      color: 'from-pink-600/20 to-rose-600/20',
      border: 'hover:border-pink-500'
    },
    {
      title: 'Packshot Generator',
      description: 'All-in-one automatic e-commerce product composer. Removes background, centers, and scales.',
      icon: <Box className="w-10 h-10 mb-4 text-indigo-400" />,
      href: '/tools/packshot',
      color: 'from-indigo-600/20 to-cyan-600/20',
      border: 'hover:border-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Quick AI Tools</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Process images instantly with our single-click utility cells. 
            No canvas, no complex adjustments—just pure AI automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <div className={`h-full p-8 rounded-3xl bg-gradient-to-br ${tool.color} border border-gray-800 ${tool.border} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group backdrop-blur-sm`}>
                <div className="bg-gray-900/50 p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <h2 className="text-2xl font-semibold text-white mb-3">{tool.title}</h2>
                <p className="text-gray-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ZoomInIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line x1="11" x2="11" y1="8" y2="14" />
      <line x1="8" x2="14" y1="11" y2="11" />
    </svg>
  );
}