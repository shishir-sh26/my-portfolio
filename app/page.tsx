"use client";

import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree, createPortal } from '@react-three/fiber';
import { useFBO, Text, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { 
    Github, Twitter, Linkedin, Mail, ExternalLink, Code2, Palette, 
    Terminal, Database, LayoutTemplate, Server, Smartphone, Layers, ArrowLeft, FileText,
    Cpu, Globe, Zap, Send, Instagram, Wifi
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Analytics } from "@vercel/analytics/next"

// --- IMPORTS ---
import PlaygroundPage from './components/PlaygroundPage';
import TargetCursor from './components/TargetCursor';
// NEW IMPORT: Import the LoadingScreen component
import LoadingScreen from './components/LoadingScreen'; 

// Dynamic imports for 3D backgrounds to avoid SSR issues
const GridScan = dynamic(() => import('./components/GridScan'), { 
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-black z-[-1]" />
});

const FloatingLines = dynamic(() => import('./components/FloatingLines'), { 
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />
});

// --- NEW VANTA BACKGROUND IMPORT ---
const VantaBackground = dynamic(() => import('./components/VantaBackground'), {
    ssr: false,
});

// --- 1. SHARED COMPONENTS & UTILS ---

// FIX APPLIED HERE: Added explicit types to resolve 'implicitly has an any type' error
const damp3 = (target: THREE.Vector3, to: [number, number, number], speed: number, delta: number) => {
    if (!target || !to) return;
    target.x += (to[0] - target.x) * speed * delta * 60;
    target.y += (to[1] - target.y) * speed * delta * 60;
    target.z += (to[2] - to[2]) * speed * delta * 60;
};

// (All other Page Components: SkillsPage, HoverCard, HomeSection, ProjectCard remain unchanged)
// ... (Your components SkillsPage, HoverCard, HomeSection, ProjectCard remain here) ...


// --- 3. PAGE COMPONENTS ---

const SkillsPage = ({ goBack }: { goBack: () => void }) => {
    // Updated Skills Data
    const skills = [
        { name: "Frontend", icon: LayoutTemplate, items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "Framer Motion"] },
        { name: "Backend", icon: Server, items: ["Node.js", "Python", "PostgreSQL", "GraphQL", "Supabase", "FastAPI"] },
        { name: "AI & ML", icon: Cpu, items: ["PyTorch", "TensorFlow", "NLP", "OpenCV", "Scikit-learn", "Keras"] },
        { name: "IoT & Embedded", icon: Wifi, items: ["Arduino", "Raspberry Pi", "ESP32", "MQTT", "Sensors", "Automation"] }
    ];

    return (
        <div className="fixed inset-0 z-50 bg-[#050505] overflow-hidden">
            <button 
                onClick={goBack}
                className="cursor-target absolute top-6 left-6 z-[60] flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 pointer-events-auto"
            >
                <ArrowLeft size={20} /> Back to Home
            </button>

            {/* CONNECTED FLOATING LINES BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <FloatingLines 
                    enabledWaves={['top', 'middle', 'bottom']}
                    lineCount={[9, 15, 9]}
                    lineDistance={[8, 5, 8]}
                    bendRadius={5.0}
                    bendStrength={-0.5}
                    interactive={true}
                    parallax={true}
                    linesGradient={['#a855f7', '#22d3ee', '#ec4899']}
                    mouseDamping={0.01}
                />
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            </div>

            <div className="absolute inset-0 z-10 overflow-y-auto pointer-events-auto">
                <div className="min-h-screen flex items-center justify-center p-6 md:p-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl w-full pt-[100px] pb-20">
                        {skills.map((category, idx) => (
                            <div key={idx} className="cursor-target group bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-cyan-500/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
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
    );
};

// --- HOVER CARD ---
const HoverCard = ({ title, desc, icon: Icon, color }: any) => (
    <div 
        className={`cursor-target group relative p-8 rounded-3xl bg-black/40 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-md`}
    >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${color}`} />
        
        <div className="relative z-10">
            <div className={`mb-6 p-4 rounded-2xl bg-white/5 w-fit ${color.replace('from-', 'text-').split(' ')[0]} group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">
                {desc}
            </p>
        </div>
    </div>
);

// --- REUSABLE HOME SECTION CONTENT ---
const HomeSection = ({ id, onNavigate }: { id: string, onNavigate: (id: string) => void }) => {
    // Animation state
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section id={id} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            <div className="w-full px-6 md:px-20 relative z-10 text-left pointer-events-none">
                
                <div className={`transition-all duration-1000 ease-out transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-black/20 backdrop-blur-sm text-cyan-400 text-sm font-medium tracking-wide">
                        AVAILABLE FOR HIRE
                    </div>
                    
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl font-sans leading-none break-words">
                        DEV SHISHIR
                    </h1>

                    <p className="max-w-2xl text-sm md:text-base text-gray-300 mb-10 leading-relaxed font-mono tracking-wide bg-black/40 backdrop-blur-md p-4 rounded-lg border-l-4 border-cyan-500">
                        AI/ML Developer | Experienced in PyTorch, NLP, and Full-Stack Application Deployment.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pointer-events-auto">
                        <a 
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-target px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-colors duration-300 w-full sm:w-auto z-20 relative flex items-center justify-center gap-2"
                        >
                            <FileText size={20} />
                            Resume
                        </a>

                        <button 
                            onClick={() => onNavigate('contact')}
                            className="cursor-target px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 backdrop-blur-sm transition-colors duration-300 w-full sm:w-auto z-20 relative"
                        >
                            Contact Me
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- ProjectCard Component (NEW) ---
const ProjectCard = ({ project }: { project: any }) => {
    return (
        <div className="cursor-target group relative rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 hover:border-white/30 transition-all">
            {project.videoUrl ? (
                // Use a video element for the project
                <video 
                    className="absolute inset-0 w-full h-full object-cover" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    src={project.videoUrl}
                >
                    Your browser does not support the video tag.
                </video>
            ) : (
                // Fallback for other projects, using a gradient background
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
            )}
            
            <div className="absolute inset-0 bg-black/60 m-[1px] rounded-2xl p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{project.desc}</p>
                
                <div className="flex gap-3 mt-auto pointer-events-auto">
                    {project.codeUrl && (
                        <a 
                            href={project.codeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="cursor-target flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <Github size={16} /> Code
                        </a>
                    )}
                    {project.liveUrl && (
                        <a 
                            href={project.liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="cursor-target flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-500/20 rounded-full hover:bg-cyan-500/40 transition-colors"
                        >
                            <ExternalLink size={16} /> Visit
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- LANDING PAGE ---
const LandingPage = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
    
    // Updated Projects Data
    const projects = [
        { 
            title: "Avian Weather Net", 
            desc: "Predicting weather using Birds sound through a Deep Learning model and a full-stack application.", 
            color: "from-blue-500 to-cyan-500",
            videoUrl: "/AvainWeatherNet.mp4", // Assumed public path
            codeUrl: "https://github.com/shishir-sh26/AvainWeatherNet", // Placeholder
            liveUrl: "#" // Placeholder
        }, 
        { 
            title: "Plant Fertilizer & Disease Detection", 
            desc: "AI-based agricultural assistance using computer vision to diagnose plant diseases and recommend fertilizers.", 
            color: "from-green-500 to-emerald-500",
            videoUrl: "/agrisense.mp4",
            codeUrl: "https://github.com/shishir-sh26/agrisense", // Placeholder
            liveUrl: "https://shrinidhianchan.github.io/ai-plant-based-agrisense/" // Placeholder
        }, 
        { 
            title: "3D Portfolio", 
            desc: "An immersive, responsive 3D web experience built with Next.js, Three.js, and React-Three-Fiber.", 
            color: "from-purple-500 to-pink-500",
            videoUrl: "/D_Portfolio_Video_Generation.mp4",
            codeUrl: "https://github.com/shishir-sh26/my-portfolio", // Placeholder
            liveUrl: "https://my-portfolio-inky-six-23.vercel.app/" // Placeholder
        }, 
        { 
            title: "GenAI projects", 
            desc: "Collection of GenAI Projects.", 
            color: "from-red-500 to-pink-500",
            videoUrl: "GenAI_Project_Video_Generation.mp4",
            codeUrl: "https://github.com/shishir-sh26/GenAi", // Placeholder
            liveUrl: "https://github.com/shishir-sh26/GenAi" // Placeholder
        }, 
        { 
            title: "Expense Tracker", 
            desc: "Project built to track your daily expenses using React and Node.js.", 
            color: "from-green-500 to-blue-500",
            videoUrl: "Expense_Tracker_Video_Generation.mp4",
            codeUrl: "https://github.com/shishir-sh26/expense-tracker", // Placeholder
            liveUrl: "https://github.com/shishir-sh26/expense-tracker" // Placeholder
        }, 
        { 
            title: "Blood Donation App", 
            desc: "application to store the blood type and serch for an donar nearby.", 
            color: "from-orange-500 to-yellow-500",
            videoUrl: "Blood_Donor_Search_Application.mp4",
            codeUrl: "https://github.com/shishir-sh26/-blooddonar", // Placeholder
            liveUrl: "https://github.com/shishir-sh26/-blooddonar" // Placeholder
        }, 
        { 
            title: "Stock-prediction", 
            desc: "LSTM Stock Price Prediction Model for all stocks", 
            color: "from-orange-500 to-yellow-500",
            videoUrl: "AI_Stock_Prediction_Video_Ready.mp4",
            codeUrl: "https://github.com/shishir-sh26/Stock-prediction", // Placeholder
            liveUrl: "https://github.com/shishir-sh26/Stock-prediction" // Placeholder
        }
    
    ];

    // Infinite Scroll Logic
    useEffect(() => {
        const handleScroll = () => {
            const homeEnd = document.getElementById('home-end');
            if (!homeEnd) return;
            
            const rect = homeEnd.getBoundingClientRect();
            if (rect.top <= 2 && rect.top >= -2) {
                window.scrollTo({ top: 0, behavior: 'auto' });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* 1. REAL HOME SECTION */}
            <HomeSection id="home" onNavigate={onNavigate} />

            {/* 2. ABOUT SECTION */}
            <section id="about" className="relative min-h-screen flex items-center py-24">
                <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                    <div className="mb-20">
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
                            Engineering <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                                The Future
                            </span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-medium bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                            I bridge the gap between complex machine learning models and intuitive user interfaces.
                            Building systems that are as beautiful as they are intelligent.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <HoverCard 
                            title="AI & Machine Learning"
                            desc="Developing state-of-the-art NLP models and computer vision systems using PyTorch and TensorFlow."
                            icon={Cpu}
                            color="from-cyan-500 to-blue-600"
                        />
                        <HoverCard 
                            title="Full Stack Architecture"
                            desc="Designing scalable microservices and resilient APIs with Node.js, Next.js (React), and Python."
                            icon={Server}
                            color="from-purple-500 to-pink-600"
                        />
                        <HoverCard 
                            title="Interactive Experiences"
                            desc="Creating immersive 3D web applications using Framer Motion, Three.js, and WebGL."
                            icon={Globe}
                            color="from-amber-500 to-orange-600"
                        />
                        <HoverCard 
                            title="Cloud & DevOps"
                            desc="Automating deployment pipelines and managing containerized applications with Docker and AWS."
                            icon={Terminal}
                            color="from-green-500 to-emerald-600"
                        />
                        <HoverCard 
                            title="Data Engineering"
                            desc="Building efficient data pipelines and optimized storage solutions for large-scale datasets."
                            icon={Database}
                            color="from-blue-500 to-indigo-600"
                        />
                        <HoverCard 
                            title="Performance Optimization"
                            desc="Fine-tuning algorithms and rendering pipelines for maximum speed and efficiency."
                            icon={Zap}
                            color="from-red-500 to-rose-600"
                        />
                    </div>
                </div>
            </section>
            
            {/* 3. PROJECTS SECTION (Formerly Work) - MODIFIED */}
            <section id="work" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Projects</h2>
                            <p className="text-gray-400 max-w-md">A selection of my recent technical work and experiments.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* ITERATE OVER THE NEW PROJECTS ARRAY AND USE THE NEW CARD COMPONENT */}
                        {projects.map((project, i) => (
                            <ProjectCard key={i} project={project} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. CONTACT SECTION */}
            <section id="contact" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                                Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Connect.</span>
                            </h2>
                            <p className="text-xl text-gray-300 leading-relaxed mb-12 bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                                I'm always open to discussing product design work, new opportunities, or partnerships. 
                                Whether you have a question or just want to say hi, I'll try my best to get back to you!
                            </p>
                        </div>

                        <div className="bg-black/40 backdrop-blur-xl p-10 rounded-3xl border border-white/10 hover:border-white/20 transition-all shadow-2xl shadow-cyan-500/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400">
                                    <Mail size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Email Me</h3>
                                    <a href="mailto:shishirkulal1234@gmail.com" className="cursor-target text-gray-300 hover:text-cyan-400 transition-colors break-all">
                                        shishirkulal1234@gmail.com
                                    </a>
                                </div>
                            </div>
                            <a href="mailto:shishirkulal1234@gmail.com" className="cursor-target flex items-center justify-center gap-3 w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors duration-300 text-lg mb-8">
                                <Send size={20} /> Send Message
                            </a>
                            <div className="flex justify-center gap-6">
                                <a href="https://github.com/shishir-sh26" target="_blank" rel="noopener noreferrer" className="cursor-target p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-black hover:scale-110 transition-all duration-300">
                                    <Github size={24} />
                                </a>
                                <a href="https://www.linkedin.com/in/shishir-r-kulal-4757a9296?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="cursor-target p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-cyan-400 hover:scale-110 transition-all duration-300">
                                    <Linkedin size={24} />
                                </a>
                                <a href="https://www.instagram.com/bwmmerc/" target="_blank" rel="noopener noreferrer" className="cursor-target p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-pink-500 hover:scale-110 transition-all duration-300">
                                    <Instagram size={24} />
                                </a>
                                <a href="https://www.kaggle.com/shishirkulal" target="_blank" rel="noopener noreferrer" className="cursor-target p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-blue-500 hover:scale-110 transition-all duration-300">
                                    <span className="text-xl font-bold font-mono">k</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="mt-32 border-t border-white/10 pt-12 pb-8 text-center text-gray-600 text-sm relative z-10">
                    <p>&copy; {new Date().getFullYear()} Portfolio. Built with Next.js & Tailwind.</p>
                </footer>
            </section>

            {/* 5. DUPLICATE HOME SECTION (For Infinite Loop) */}
            <HomeSection id="home-end" onNavigate={onNavigate} />
        </>
    );
};

// --- 4. MAIN APP (Wrapper to handle Loading State) ---

const App = () => {
    const [currentPage, setCurrentPage] = useState('landing');
    const [activeSection, setActiveSection] = useState('home');
    const [scrolled, setScrolled] = useState(false);
    // NEW STATE: Loading state
    const [isLoading, setIsLoading] = useState(true);

    // ✅ NEW: Define the function required by LoadingScreen
    const handleLoaded = useCallback(() => {
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Handle loading screen: Show for a minimum of 3 seconds (as a fallback)
        const timer = setTimeout(() => {
            // Only force stop loading if it hasn't already been stopped by the LoadingScreen component
            if (isLoading) {
                setIsLoading(false);
            }
        }, 3500); // Slightly longer fallback time than the LoadingScreen's own timer

        return () => clearTimeout(timer);
    }, [isLoading]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            const sections = ['home', 'about', 'work', 'contact'];
            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // Adjusted boundary check for better active section detection
                    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        
        // Only attach scroll listener after loading is complete
        if (!isLoading) {
             window.addEventListener('scroll', handleScroll);
             // Initial check
             handleScroll(); 
        }

        return () => {
            if (!isLoading) {
                window.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isLoading]); // Rerun effect when loading status changes

    const navigateTo = (page: string, sectionId?: string) => {
        setCurrentPage(page);
        if (sectionId) setActiveSection(sectionId);
        if (page === 'landing' && sectionId) {
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    };

    const NavLink = ({ label, targetId, onClick }: any) => (
        <button
            onClick={onClick}
            className={`cursor-target relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
                activeSection === targetId 
                    ? 'text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
            {label}
        </button>
    );
    
    // CONDITIONAL RENDERING: Render LoadingScreen if loading is true
    if (isLoading) {
        // ✅ FIX: Pass the required 'onLoaded' prop
        return <LoadingScreen onLoaded={handleLoaded} />;
    }

    return (
        <div className="relative min-h-screen text-gray-200 font-sans selection:bg-cyan-500/30">
            
            {/* Custom Target Cursor */}
            <TargetCursor 
                targetSelector=".cursor-target" 
                spinDuration={4} 
                hideDefaultCursor={true} 
                parallaxOn={true} 
            />

            {/* PERSISTENT BACKGROUND (MOVED HERE FROM LANDING PAGE) */}
            <div className={`fixed inset-0 z-[-1] transition-opacity duration-700 ${currentPage === 'landing' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <VantaBackground />
            </div>

            {/* Navigation - REORDERED: Home -> About -> Work -> Contact -> Skills */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'py-4' : 'py-6'
            }`}>
                <div className={`max-w-7xl mx-auto px-6 ${
                    scrolled 
                        ? 'bg-black/60 backdrop-blur-xl border border-white/10 rounded-full py-3 shadow-2xl shadow-cyan-500/5' 
                        : 'bg-transparent border-transparent py-2'
                } transition-all duration-300 flex items-center justify-between`}>
                    
                    <button 
                        className="cursor-target flex items-center gap-2 text-2xl font-bold tracking-tighter text-white hover:text-cyan-400 transition-colors z-50 cursor-pointer pointer-events-auto"
                        onClick={() => {
                            setCurrentPage('playground');
                            setActiveSection('playground');
                        }}
                    >
                        DEV<span className="text-cyan-400">.</span>
                    </button>
                    
                    <div className="hidden md:flex space-x-1">
                        <NavLink label="Home" targetId="home" onClick={() => navigateTo('landing', 'home')} />
                        <NavLink label="About" targetId="about" onClick={() => navigateTo('landing', 'about')} />
                        <NavLink label="Work" targetId="work" onClick={() => navigateTo('landing', 'work')} />
                        <NavLink label="Contact" targetId="contact" onClick={() => navigateTo('landing', 'contact')} />
                        <NavLink label="Skills" targetId="skills" onClick={() => navigateTo('skills', 'skills')} />
                    </div>

                    <button className="cursor-target md:hidden text-white p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Page Content */}
            <main>
                {currentPage === 'landing' && <LandingPage onNavigate={(id) => navigateTo('landing', id)} />}
                {currentPage === 'skills' && <SkillsPage goBack={() => navigateTo('landing', 'home')} />}
                
                {currentPage === 'playground' && (
                    <div className="fixed inset-0 z-[60] bg-[#050505]">
                        <button 
                            onClick={() => navigateTo('landing', 'home')}
                            className="cursor-target absolute top-6 left-6 z-[70] flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
                        >
                            <ArrowLeft size={20} /> Back to Home
                        </button>
                        <PlaygroundPage />
                    </div>
                )}
            </main>

        </div>
    );
};

// --- FINAL EXPORT ---
// This exports the App component as the default component for the page.
export default App;