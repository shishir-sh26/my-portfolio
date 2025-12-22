"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Text } from '@react-three/drei';
import {
    BallCollider,
    CuboidCollider,
    Physics,
    RigidBody,
    useRopeJoint,
    useSphericalJoint,
    RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
    interface IntrinsicElements {
        meshLineGeometry: any;
        meshLineMaterial: any;
    }
}

// --- LANYARD COMPONENT ---
function Band({ maxSpeed = 50, minSpeed = 10 }) {
    const band = useRef<any>(null);
    const fixed = useRef<any>(null);
    const j1 = useRef<any>(null);
    const j2 = useRef<any>(null);
    const j3 = useRef<any>(null);
    const card = useRef<any>(null);

    const vec = new THREE.Vector3();
    const ang = new THREE.Vector3();
    const rot = new THREE.Vector3();
    const dir = new THREE.Vector3();

    const segmentProps: any = {
        type: 'dynamic',
        canSleep: true,
        colliders: false,
        angularDamping: 2,
        linearDamping: 2
    };

    const curve = useMemo(() => new THREE.CatmullRomCurve3([
        new THREE.Vector3(), 
        new THREE.Vector3(), 
        new THREE.Vector3(), 
        new THREE.Vector3()
    ]), []);
    
    const [dragged, drag] = useState<false | THREE.Vector3>(false);
    const [hovered, hover] = useState(false);

    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
    useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

    useEffect(() => {
        document.body.style.cursor = hovered ? (dragged ? 'grabbing' : 'grab') : 'auto';
    }, [hovered, dragged]);

    useFrame((state, delta) => {
        if (dragged && card.current) {
            vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
            dir.copy(vec).sub(state.camera.position).normalize();
            vec.add(dir.multiplyScalar(state.camera.position.length() * 0.4)); 
            
            [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
            card.current.setNextKinematicTranslation({
                x: vec.x - dragged.x,
                y: vec.y - dragged.y,
                z: vec.z - dragged.z
            });
        }
        
        if (fixed.current && j1.current && j2.current && j3.current) {
            [j1, j2].forEach(ref => {
                if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
                const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
                ref.current.lerped.lerp(
                    ref.current.translation(),
                    delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
                );
            });
            
            curve.points[0].copy(j3.current.translation());
            curve.points[1].copy(j2.current.lerped);
            curve.points[2].copy(j1.current.lerped);
            curve.points[3].copy(fixed.current.translation());
            
            band.current.geometry.setPoints(curve.getPoints(32));
            
            ang.copy(card.current.angvel());
            rot.copy(card.current.rotation());
            card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
        }
    });

    return (
        <>
            <group position={[0, 4, 0]}>
                <RigidBody ref={fixed} {...segmentProps} type="fixed" />
                <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
                <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
                <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>

                <RigidBody
                    position={[2, 0, 0]}
                    ref={card}
                    {...segmentProps}
                    type={dragged ? 'kinematicPosition' : 'dynamic'}
                >
                    <CuboidCollider args={[0.8, 1.125, 0.01]} />
                    <group
                        scale={2.25}
                        position={[0, -1.2, -0.05]}
                        onPointerOver={() => hover(true)}
                        onPointerOut={() => hover(false)}
                        onPointerUp={(e: any) => {
                            e.target.releasePointerCapture(e.pointerId);
                            drag(false);
                        }}
                        onPointerDown={(e: any) => {
                            if (e.button === 2) { 
                                e.target.setPointerCapture(e.pointerId);
                                drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
                            }
                        }}
                    >
                        <mesh>
                            <boxGeometry args={[0.8, 1.125, 0.05]} />
                            <meshPhysicalMaterial color="#ffffff" clearcoat={1} roughness={0.15} metalness={0.2} />
                        </mesh>
                        <Text position={[0, 0.2, 0.03]} fontSize={0.12} color="#000" anchorX="center">DEV SHISHIR</Text>
                        <Text position={[0, -0.1, 0.03]} fontSize={0.08} color="#666" anchorX="center">Developer</Text>
                    </group>
                </RigidBody>
            </group>
            <mesh ref={band}>
                <meshLineGeometry attach="geometry" />
                <meshLineMaterial attach="material" color="white" depthTest={false} lineWidth={2} transparent opacity={0.8} />
            </mesh>
        </>
    );
}

// --- OPTIMIZED SCRATCH-OFF ---
function ScratchOff({ imageUrl }: { imageUrl: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const lastPoint = useRef<{x: number, y: number} | null>(null);

    const updateMask = useCallback(() => {
        if (!canvasRef.current || !maskRef.current) return;
        // Optimization: Use the canvas directly as a mask source via dataURL
        // To make it "lagless", we only update on changes
        const url = canvasRef.current.toDataURL();
        maskRef.current.style.WebkitMaskImage = `url(${url})`;
        maskRef.current.style.maskImage = `url(${url})`;
    }, []);

    const draw = (x: number, y: number) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && lastPoint.current) {
            ctx.beginPath();
            ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            updateMask();
        }
        lastPoint.current = { x, y };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'destination-out'; 
                ctx.lineWidth = 50; 
                ctx.lineCap = 'round';
                updateMask();
            }
        }
    }, [updateMask]);

    return (
        <div 
            className="w-full h-screen relative bg-black"
            onMouseMove={(e) => isDrawing && draw(e.clientX, e.clientY)}
            onMouseDown={(e) => {
                if (e.button === 0) {
                    setIsDrawing(true);
                    lastPoint.current = { x: e.clientX, y: e.clientY };
                }
            }}
            onMouseUp={() => setIsDrawing(false)}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Background revealed image */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />

            {/* The Scratch Layer */}
            <div
                ref={maskRef}
                className="absolute inset-0 z-10 bg-[#0a0a0a]"
                style={{ WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
            />

            <canvas ref={canvasRef} className="hidden" />

            {/* 3D Content */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 20], fov: 20 }} eventSource={maskRef as any} pointerEvents="auto">
                    <ambientLight intensity={2} />
                    <Physics gravity={[0, -30, 0]}>
                        <Band />
                    </Physics>
                    <Environment preset="city" />
                </Canvas>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-xs uppercase tracking-widest pointer-events-none z-30">
                Left-Click Scratch • Right-Click Drag Card
            </div>
        </div>
    );
}

export default function PlaygroundPage() {
    return <ScratchOff imageUrl="https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" />;
}