// app/components/SkillsPage.tsx (ULTIMATE GUARANTEED FIX)
import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, LayoutTemplate, Server, Cpu, Wifi
} from 'lucide-react';

interface SkillsPageProps {
    goBack: () => void;
}

const SkillsPage: React.FC<SkillsPageProps> = ({ goBack }) => {
    
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        // Sets the state to trigger the animation
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 50); 
        return () => clearTimeout(timer);
    }, []);

    const skills = [
        { name: "Frontend", icon: LayoutTemplate, items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "Framer Motion", "Figma", "Angular","Vercel"] },
        { name: "Backend", icon: Server, items: ["Node.js", "Python", "PostgreSQL", "MySQL", "Supabase", "FastAPI", "Flask", "Docker", "MongoDB"] },
        { name: "AI & ML", icon: Cpu, items: ["PyTorch", "TensorFlow", "OpenCV"] },
        { name: "IoT & Embedded", icon: Wifi, items: ["Arduino", "Sensors", "Automation"] }
    ];

    // --- NEW CSS CLASSES FOR ULTIMATE FIX ---
    // Note: You must ensure 'will-change-transform' is added to your tailwind.config.js (see step 1 below)
    const baseClasses = "absolute inset-0 z-10 pointer-events-auto transition-all duration-700 ease-out will-change-transform";
    const mountedClasses = "opacity-100 translate-y-0 translate-z-0";
    const unmountedClasses = "opacity-0 translate-y-8 translate-z-0";

    return (
        <div className="fixed inset-0 z-50 bg-[#050505] overflow-hidden">
            <button 
                onClick={goBack}
                className="cursor-target absolute top-6 left-6 z-[60] flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all border border-white/10 pointer-events-auto"
            >
                <ArrowLeft size={20} /> Back to Home
            </button>

            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#050505] via-[#0a0a1a] to-[#050505] opacity-90" />

            {/* 🚀 ULTIMATE FIX: Outer layer handles only the GPU-accelerated transition (transform/opacity) */}
            <div className={`${baseClasses} ${isMounted ? mountedClasses : unmountedClasses}`}>
                
                {/* Inner layer handles only the scrolling (overflow-y-auto, scroll-touch) */}
                <div className="absolute inset-0 overflow-y-auto scroll-touch">
                    
                    <div className="min-h-screen flex items-center justify-center p-6 md:p-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl w-full pt-[100px] pb-20">
                            {skills.map((category, idx) => (
                                <div 
                                    key={idx} 
                                    className="cursor-target group bg-black/70 border border-white/10 p-8 rounded-3xl hover:border-cyan-500/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:text-white group-hover:bg-cyan-500 transition-colors">
                                            <category.icon size={24} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {category.items.map((item, i) => (
                                            <span key={i} className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-300 border border-white/5 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white transition-all">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillsPage;