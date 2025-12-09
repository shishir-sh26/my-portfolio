"use client";

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);
  const [isVantaLoaded, setIsVantaLoaded] = useState(false);

  useEffect(() => {
    // Only initialize if both scripts are loaded, THREE exists on window, and effect isn't running
    if (isThreeLoaded && isVantaLoaded && !vantaEffect && vantaRef.current && (window as any).THREE) {
      try {
        const effect = (window as any).VANTA.CLOUDS({
          el: vantaRef.current,
          THREE: (window as any).THREE, // Explicitly pass the global THREE object
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          speed: 1.10,
          // Tweaking colors to fit dark portfolio theme
          skyColor: 0x050505,
          cloudColor: 0x383657,
          cloudShadowColor: 0x181825,
          sunColor: 0xff9ffc,
          sunGlareColor: 0x22d3ee,
          sunlightColor: 0x22d3ee
        });
        setVantaEffect(effect);
      } catch (error) {
        console.error("Failed to initialize Vanta effect:", error);
      }
    }

    // Cleanup function
    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
        setVantaEffect(null);
      }
    };
  }, [isThreeLoaded, isVantaLoaded, vantaEffect]);

  return (
    <>
      {/* Load Three.js (r134 is generally more stable with newer Vanta versions) */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsThreeLoaded(true)}
      />
      {/* Load Vanta Clouds */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsVantaLoaded(true)}
      />
      
      {/* The container for the background */}
      <div ref={vantaRef} className="fixed inset-0 w-full h-full z-[-1] pointer-events-none" />
      
      {/* Dark overlay to ensure text remains readable */}
      <div className="fixed inset-0 w-full h-full z-[-1] bg-black/30 pointer-events-none" />
    </>
  );
}