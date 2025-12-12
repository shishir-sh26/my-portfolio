"use client";

import React, { useState, useEffect } from 'react';

// --- 🌟 SMALL, NON-BOLD, PLAYFAIR FONT LOADING SCREEN COMPONENT 🌟 ---

interface LoadingScreenProps {
    onLoaded: () => void;
}

const LoadingScreen = ({ onLoaded }: LoadingScreenProps) => {
    // Translations for the Name (Shishir) - ENGLISH, KANNADA, HINDI, JAPANESE
    const nameTranslations = [
        "SHISHIR",           // English
        "ಶಿಶಿರ್",            // Kannada
        "शिशिर",             // Hindi
        "シシル",            // Japanese
    ];

    // STATIC BACKGROUND
    const STATIC_COLOR = 'from-cyan-400 to-purple-500';
    
    // State for cycling text and color
    const [currentIndex, setCurrentIndex] = useState(0);
    const [opacity, setOpacity] = useState(1);
    
    // Dynamic access to current states
    const currentName = nameTranslations[currentIndex];

    // === TIME MODIFICATION ===
    const FAST_CYCLE_DURATION = 500; // 0.5 seconds per language

    useEffect(() => {
        const totalLanguages = nameTranslations.length;
        // Load time: 4 cycles * 0.5s + 1s hold = 3.0 seconds
        const totalLoadTime = FAST_CYCLE_DURATION * totalLanguages + 1000; 

        // 1. Cycle Text (faster)
        const textInterval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % totalLanguages);
        }, FAST_CYCLE_DURATION);

        // 2. Hide Loader after fixed time
        const loadTimeout = setTimeout(() => {
            setOpacity(0); // Fade out
            setTimeout(onLoaded, 1000); // Call onLoaded after fade duration (1s)
        }, totalLoadTime);

        return () => {
            clearInterval(textInterval);
            clearTimeout(loadTimeout);
        };
    }, [onLoaded, nameTranslations.length]);

    return (
        <div 
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-1000`}
            style={{
                opacity: opacity,
                backgroundColor: '#050505', // Base dark background
            }}
        >
            {/* Gradient Background Layer - STATIC */}
            <div className={`absolute inset-0 transition-none bg-gradient-to-br ${STATIC_COLOR}`}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            </div>

            <div className="relative z-10 text-center">
                {/* NAME: SMALLER, NOT BOLD, ITALIC, PLAYFAIR FONT */}
                <h1 
                    key={`name-${currentIndex}`} // Key forces remount/animation on change
                    // 1. Changed size to text-5xl md:text-7xl
                    // 2. Removed font-black
                    // 3. Added italic
                    className="text-5xl md:text-7xl text-white tracking-tighter mb-4 transition-all duration-300 ease-in-out transform italic"
                    style={{
                        // 4. Set font to Playfair Display
                        fontFamily: 'Playfair Display, serif',
                        // Subtle flash effect
                        transform: `translateY(${currentIndex % 2 === 0 ? '0px' : '-5px'}) scale(1)`,
                        transition: 'all 0.3s ease-in-out',
                    }}
                >
                    {currentName}
                </h1>
            </div>
        </div>
    );
};

export default LoadingScreen;