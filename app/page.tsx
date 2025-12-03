"use client";

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree, createPortal } from '@react-three/fiber';
import { useFBO, Text, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Github, Twitter, Linkedin, Mail, ExternalLink, Code2, Palette, 
  Terminal, Database, LayoutTemplate, Server, Smartphone, Layers, ArrowLeft, FileText,
  Cpu, Globe, Zap
} from 'lucide-react';

// --- IMPORT THE PLAYGROUND PAGE ---
import PlaygroundPage from './components/PlaygroundPage';

// --- 1. SHARED COMPONENTS & UTILS ---

const damp3 = (target, to, speed, delta) => {
  if (!target || !to) return;
  target.x += (to[0] - target.x) * speed * delta * 60;
  target.y += (to[1] - target.y) * speed * delta * 60;
  target.z += (to[2] - target.z) * speed * delta * 60;
};

// --- SCROLLING BACKGROUND IMAGE ---
// Uses the requested "Rocky formation under a starry night sky" theme
const ScrollingBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full z-[-1] pointer-events-none">
      <img 
        src="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=2076&auto=format&fit=crop" 
        alt="Rocky Formation Starry Night" 
        className="w-full h-full object-cover opacity-50"
      />
      
      {/* Gradient Overlays for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80" />
      <div className="absolute inset-0 bg-black/40" /> {/* General dimming */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
    </div>
  );
};

// --- 2. LOCAL 3D COMPONENTS (For Skills Page Overlay) ---

const BackgroundScene = () => {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color="#050505" />
      </mesh>
      
      <mesh position={[-4, 2, -5]}>
        <torusKnotGeometry args={[1.5, 0.4, 128, 32]} />
        <meshBasicMaterial color="#a855f7" /> 
      </mesh>
      <mesh position={[5, -2, -8]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#22d3ee" /> 
      </mesh>
      <mesh position={[-3, -5, -6]}>
        <icosahedronGeometry args={[1.8, 0]} />
        <meshBasicMaterial color="#ec4899" /> 
      </mesh>
      <mesh position={[4, 4, -7]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#3b82f6" /> 
      </mesh>

      <Text
        position={[0, 0, -4]}
        fontSize={2.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={-0.05}
      >
        TECHNICAL SKILLS
      </Text>
    </group>
  );
};

const FluidGlassLens = ({ followPointer = true }) => {
  const ref = useRef();
  const buffer = useFBO();
  const { viewport } = useThree();
  const scene = useMemo(() => new THREE.Scene(), []);

  useFrame((state, delta) => {
    const { gl, camera, pointer } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = followPointer ? (pointer.y * v.height) / 2 : 0;
    
    if (ref.current) {
      damp3(ref.current.position, [destX, destY, 2], 0.15, delta);
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, destY * 0.1 + Math.PI/2, 0.1);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, destX * 0.1, 0.1);
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  return (
    <>
      {createPortal(<BackgroundScene />, scene)}
      <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, -1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
      <mesh ref={ref} position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.8, 2.8, 0.3, 64]} />
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={1.2}
          thickness={3.0}
          anisotropy={0.2}
          chromaticAberration={0.06}
          roughness={0.05}
          distortion={0.5}
          distortionScale={0.4}
          temporalDistortion={0.1}
        />
      </mesh>
    </>
  );
};

// --- 3. PAGE COMPONENTS ---

const SkillsPage = ({ goBack }) => {
  const skills = [
    { name: "Frontend", icon: LayoutTemplate, items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js"] },
    { name: "Backend", icon: Server, items: ["Node.js", "Python", "PostgreSQL", "GraphQL", "Supabase"] },
    { name: "Mobile", icon: Smartphone, items: ["React Native", "Expo", "Flutter", "iOS", "Android"] },
    { name: "Tools", icon: Layers, items: ["Git", "Docker", "AWS", "Figma", "Jest"] }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] overflow-hidden">
      <button 
        onClick={goBack}
        className="absolute top-6 left-6 z-[60] flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer pointer-events-auto"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 25 }} gl={{ alpha: false, antialias: true }}>
          <color attach="background" args={['#050505']} />
          <Suspense fallback={null}>
            <FluidGlassLens />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto pointer-events-none">
        <div className="min-h-screen flex items-center justify-center p-6 md:p-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl w-full pointer-events-auto pt-[400px] md:pt-0">
            {skills.map((category, idx) => (
              <div key={idx} className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-cyan-500/50 transition-colors duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <category.icon size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item, i) => (
                    <span key={i} className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-300 border border-white/5 hover:bg-white/10 hover:text-white transition-colors">
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

// --- NEW COMPONENT: Interactive Hover Card for About Section ---
const HoverCard = ({ title, desc, icon: Icon, color }) => (
  <div 
    className={`group relative p-8 rounded-3xl bg-black/40 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-md`}
  >
    {/* Gradient Background Effect */}
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

// --- LANDING PAGE ---
const LandingPage = ({ onNavigate }) => {
  return (
    <>
      {/* GLOBAL SCROLLING BACKGROUND (Visible across all sections) */}
      <ScrollingBackground />

      {/* HOME SECTION */}
      <section id="home" className="relative min-h-screen flex items-center pt-20">
        
        {/* Content Overlay - LEFT ALIGNED */}
        <div className="w-full px-6 md:px-20 relative z-10 text-left pointer-events-none">
          
          {/* Main Title - Large and Bold */}
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl font-sans leading-none">
            DEV SHISHIR
          </h1>

          {/* Subtitle - Monospace and Smaller */}
          <p className="max-w-2xl text-sm md:text-base text-gray-300 mb-10 leading-relaxed font-mono tracking-wide bg-black/40 backdrop-blur-md p-4 rounded-lg border-l-4 border-cyan-500">
            AI/ML Developer | Experienced in PyTorch, NLP, and Full-Stack Application Deployment.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pointer-events-auto">
            {/* Resume Button */}
            <a 
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-colors duration-300 w-full sm:w-auto z-20 relative flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              Resume
            </a>

            <button 
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 backdrop-blur-sm transition-colors duration-300 w-full sm:w-auto z-20 relative"
            >
              Contact Me
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION - Transparent background to show image */}
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
              desc="Designing scalable microservices and resilient APIs with Node.js, Next.js, and modern cloud infrastructure."
              icon={Server}
              color="from-purple-500 to-pink-600"
            />
            <HoverCard 
              title="Interactive Experiences"
              desc="Creating immersive 3D web applications with Three.js, React Three Fiber, and WebGL."
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
      
      {/* Selected Work */}
      <section id="work" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Selected Work</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{ title: "Neon Finance", color: "from-blue-500 to-cyan-500" }, { title: "Aura Spaces", color: "from-purple-500 to-pink-500" }, { title: "Nexus API", color: "from-emerald-500 to-teal-500" }].map((project, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-white/10 hover:border-white/30 transition-all">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md m-[1px] rounded-2xl p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Let's work together.</h2>
          <a href="mailto:hello@example.com" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-colors duration-300 text-lg">
            <Mail size={20} /> Get in Touch
          </a>
        </div>
        <footer className="mt-24 border-t border-white/10 pt-12 pb-8 text-center text-gray-600 text-sm relative z-10">
          <p>&copy; {new Date().getFullYear()} Moncy-style Portfolio. Built with Next.js & Tailwind.</p>
        </footer>
      </section>
    </>
  );
};

// --- 4. MAIN APP ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ['home', 'about', 'work', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page, sectionId) => {
    setCurrentPage(page);
    setActiveSection(sectionId);
    if (page === 'landing' && sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  const NavLink = ({ label, targetId, onClick }) => (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
        activeSection === targetId 
          ? 'text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative min-h-screen text-gray-200 font-sans selection:bg-cyan-500/30">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-4' : 'py-6'
      }`}>
        <div className={`max-w-7xl mx-auto px-6 ${
          scrolled 
            ? 'bg-black/60 backdrop-blur-xl border border-white/10 rounded-full py-3 shadow-2xl shadow-cyan-500/5' 
            : 'bg-transparent border-transparent py-2'
        } transition-all duration-300 flex items-center justify-between`}>
          
          <button 
            className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-white hover:text-cyan-400 transition-colors z-50 cursor-pointer pointer-events-auto"
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
            <NavLink label="Skills" targetId="skills" onClick={() => navigateTo('skills', 'skills')} />
            <NavLink label="Contact" targetId="contact" onClick={() => navigateTo('landing', 'contact')} />
          </div>

          <button className="md:hidden text-white p-2">
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
              className="absolute top-6 left-6 z-[70] flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
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

export default App;