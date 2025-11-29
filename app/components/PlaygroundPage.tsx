"use client";

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import * as THREE from 'three';

// --- Utils ---
const damp3 = (target, to, speed, delta) => {
  if (!target || !to) return;
  target.x += (to[0] - target.x) * speed * delta * 60;
  target.y += (to[1] - target.y) * speed * delta * 60;
  target.z += (to[2] - target.z) * speed * delta * 60;
};

// --- Components ---

function GlassObject({ 
  children, 
  followPointer = true, 
  modeProps = {}, 
  ...props 
}) {
  const ref = useRef();
  const { viewport } = useThree();

  useFrame((state, delta) => {
    const { pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = followPointer ? (pointer.y * v.height) / 2 : 0;
    
    if (ref.current) {
        damp3(ref.current.position, [destX, destY, 15], 0.15, delta);
        // Add subtle rotation
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, destY * 0.05 + Math.PI/2, 0.1);
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, destX * 0.05, 0.1);
    }
  });

  const { ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;

  return (
    <mesh ref={ref} rotation-x={Math.PI / 2} {...props}>
      {children}
      <MeshTransmissionMaterial
        transmission={1}
        thickness={thickness ?? 3.5}
        roughness={0}
        ior={ior ?? 1.2}
        chromaticAberration={chromaticAberration ?? 0.06}
        anisotropy={anisotropy ?? 0.1}
        distortion={0.5}
        distortionScale={0.3}
        temporalDistortion={0.5}
        clearcoat={1}
        color="#ffffff"
        {...extraMat}
      />
    </mesh>
  );
}

function NavItems({ items }) {
  const group = useRef();
  const { viewport } = useThree();

  // Responsive settings
  const width = viewport.width;
  const isMobile = width < 5;
  
  const spacing = isMobile ? 0.8 : 1.5;
  const fontSize = isMobile ? 0.3 : 0.5;

  useFrame(() => {
    if (!group.current) return;
    // Keep nav centered
    group.current.position.set(0, 0, 12);
  });

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label }, i) => (
        <Text
          key={label}
          position={[(i - (items.length - 1) / 2) * spacing * 3, 0, 0]}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

function Images() {
  const group = useRef();
  const data = useScroll();
  const { height } = useThree((s) => s.viewport);

  useFrame(() => {
    if(!group.current || !data) return;
    // Animate zoom based on scroll position
    const zoom1 = 1 + data.range(0, 1 / 3) / 3;
    const zoom2 = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    
    // Safely apply zoom to children if they exist
    group.current.children.forEach((child, index) => {
        if (child.material) {
            child.material.zoom = index < 2 ? zoom1 : zoom2;
        }
    });
  });

  return (
    <group ref={group}>
      <Image position={[-2, 0, 0]} scale={[3, height / 1.1]} url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" />
      <Image position={[2, 0, 3]} scale={3} url="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=800&q=80" />
      <Image position={[-2.05, -height, 6]} scale={[1, 3]} url="https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=800&q=80" />
      <Image position={[-0.6, -height, 9]} scale={[1, 2]} url="https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=800&q=80" />
      <Image position={[0.75, -height, 10.5]} scale={1.5} url="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80" />
    </group>
  );
}

function Typography() {
  const { viewport } = useThree();
  const fontSize = viewport.width < 5 ? 0.8 : 1.5;

  return (
    <Text
      position={[0, 0, 10]}
      fontSize={fontSize}
      letterSpacing={-0.05}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      React Bits
    </Text>
  );
}

// --- Main Component ---

export default function PlaygroundPage() {
  const navItems = [
    { label: 'Home' },
    { label: 'About' },
    { label: 'Contact' }
  ];

  return (
    <div className="w-full h-screen bg-[#050505] overflow-hidden">
        <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <Suspense fallback={null}>
            <ScrollControls damping={0.2} pages={3} distance={0.4}>
                <NavItems items={navItems} />
                
                {/* Scrollable Background Content */}
                <Scroll>
                    <Typography />
                    <Images />
                </Scroll>

                {/* Foreground Glass Lens */}
                <GlassObject>
                    <cylinderGeometry args={[5, 5, 0.5, 64]} />
                </GlassObject>
                
                <Preload />
            </ScrollControls>
          </Suspense>
        </Canvas>
    </div>
  );
}