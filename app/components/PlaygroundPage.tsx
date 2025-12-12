"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
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

// Extend Three.js with MeshLine
extend({ MeshLineGeometry, MeshLineMaterial });

// CRITICAL TYPE FIX: Augment the @react-three/fiber namespace
declare module '@react-three/fiber' {
    interface IntrinsicElements {
        meshLineGeometry: any;
        meshLineMaterial: any;
    }
}

// --- LANYARD COMPONENT (The 3D Card) ---
interface BandProps {
    maxSpeed?: number;
    minSpeed?: number;
    isMobile?: boolean;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }: BandProps) {
    // Refs for physics bodies and the mesh line
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
        type: 'dynamic' as RigidBodyProps['type'],
        canSleep: true,
        colliders: false,
        angularDamping: 4,
        linearDamping: 4
    };

    const [curve] = useState(
        () =>
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(), 
                new THREE.Vector3(), 
                new THREE.Vector3(), 
                new THREE.Vector3()
            ])
    );
    
    const [dragged, drag] = useState<false | THREE.Vector3>(false);
    const [hovered, hover] = useState(false);

    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
    useSphericalJoint(j3, card, [
        [0, 0, 0],
        [0, 1.45, 0]
    ]);

    useEffect(() => {
        if (hovered) {
            document.body.style.cursor = dragged ? 'grabbing' : 'grab';
            return () => {
                document.body.style.cursor = 'auto';
            };
        }
    }, [hovered, dragged]);

    useFrame((state, delta) => {
        if (dragged && typeof dragged !== 'boolean') {
            vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
            dir.copy(vec).sub(state.camera.position).normalize();
            vec.add(dir.multiplyScalar(state.camera.position.length()));
            [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
            card.current?.setNextKinematicTranslation({
                x: vec.x - dragged.x,
                y: vec.y - dragged.y,
                z: vec.z - dragged.z
            });
        }
        
        if (fixed.current) {
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
            
            band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
            
            ang.copy(card.current.angvel());
            rot.copy(card.current.rotation());
            card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
        }
    });

    curve.curveType = 'chordal';

    return (
        <>
            <group position={[0, 4, 0]}>
                <RigidBody ref={fixed} {...segmentProps} type={'fixed' as RigidBodyProps['type']} />
                
                <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
                    <BallCollider args={[0.1]} />
                </RigidBody>

                {/* The Card - Dragging is now on Right Click */}
                <RigidBody
                    position={[2, 0, 0]}
                    ref={card}
                    {...segmentProps}
                    type={dragged ? ('kinematicPosition' as RigidBodyProps['type']) : ('dynamic' as RigidBodyProps['type'])}
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
                            // 🔄 FIX 2: Trigger drag on Right Click (e.button === 2)
                            if (e.button === 2) { 
                                e.target.setPointerCapture(e.pointerId);
                                drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
                            }
                        }}
                    >
                        <mesh>
                            <boxGeometry args={[0.8, 1.125, 0.05]} />
                            <meshPhysicalMaterial
                                color="#ffffff"
                                clearcoat={1}
                                clearcoatRoughness={0.15}
                                roughness={0.3}
                                metalness={0.5}
                            />
                        </mesh>
                        
                        <group position={[0, 0, 0.03]}>
                            <Text
                                position={[0, 0.2, 0]}
                                fontSize={0.15}
                                color="#000000"
                                anchorX="center"
                                anchorY="middle"
                            >
                                DEV SHISHIR
                            </Text>
                            <Text
                                position={[0, -0.1, 0]}
                                fontSize={0.1}
                                color="#555555"
                                anchorX="center"
                                anchorY="middle"
                            >
                                Developer
                            </Text>
                        </group>

                        <mesh position={[0, 0.6, 0]}>
                            <boxGeometry args={[0.3, 0.1, 0.1]} />
                            <meshStandardMaterial color="#888" />
                        </mesh>
                    </group>
                </RigidBody>
            </group>
            
            <mesh ref={band}>
                <meshLineGeometry attach="geometry" />
                <meshLineMaterial
                    attach="material"
                    color="white"
                    depthTest={false}
                    resolution={[1000, 1000]}
                    lineWidth={1}
                />
            </mesh>
        </>
    );
}

// --- SCRATCH-OFF WRAPPER COMPONENT ---
interface ScratchOffProps {
    imageUrl: string;
}

function ScratchOff({ imageUrl }: ScratchOffProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const lastPoint = useRef<{x: number, y: number} | null>(null);
    const maskRef = useRef<HTMLDivElement>(null);

    const draw = (x: number, y: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && lastPoint.current) {
            ctx.beginPath();
            ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            // FIX: Use camelCase (webkitMaskImage) for direct DOM style assignment
            maskRef.current!.style.webkitMaskImage = `url(${canvas.toDataURL()})`;
            maskRef.current!.style.maskImage = `url(${canvas.toDataURL()})`;
        }
        lastPoint.current = { x, y };
    };

    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const mask = maskRef.current;

        if (canvas && mask) {
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.globalCompositeOperation = 'destination-out'; 
                ctx.lineWidth = 40; 
                ctx.lineCap = 'round';

                // FIX: Use camelCase (webkitMaskImage) for direct DOM style assignment
                mask.style.webkitMaskImage = `url(${canvas.toDataURL()})`;
                mask.style.maskImage = `url(${canvas.toDataURL()})`;
            }
        }
    }, []);

    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const mask = maskRef.current;

        if (canvas && mask) {
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.globalCompositeOperation = 'destination-out'; 
                ctx.lineWidth = 40; 
                ctx.lineCap = 'round';

                // 🚨 FIX 2: Use webkitMaskImage (camelCase) for direct DOM styling
                mask.style.webkitMaskImage = `url(${canvas.toDataURL()})`;
                mask.style.maskImage = `url(${canvas.toDataURL()})`;
            }
        }
    }, []);

    useEffect(() => {
        initializeCanvas();
        window.addEventListener('resize', initializeCanvas); 
        return () => window.removeEventListener('resize', initializeCanvas);
    }, [initializeCanvas]);

    const getCursorPosition = (event: React.MouseEvent) => {
        return {
            x: event.clientX,
            y: event.clientY,
        };
    };

    const handleStart = (event: React.MouseEvent) => {
        // 🔄 FIX 3: Start drawing on Left Click (event.button === 0)
        if (event.button === 0) { 
            event.preventDefault(); 
            const pos = getCursorPosition(event);
            lastPoint.current = pos;
            draw(pos.x, pos.y); // Draw immediately on click start
            setIsDrawing(true);
        }
    };

    const handleMove = (event: React.MouseEvent) => {
        if (!isDrawing) return;
        event.preventDefault();
        const pos = getCursorPosition(event);
        draw(pos.x, pos.y);
    };

    const handleEnd = () => {
        setIsDrawing(false);
        lastPoint.current = null;
    };


    return (
        <div 
            className="w-full h-full relative"
            style={{
                backgroundImage: `url('${imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
            }}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onMouseDown={handleStart}
            // Prevents right-click menu, allowing the right-click drag to work
            onContextMenu={(e) => e.preventDefault()} 
        >
            {/* 1. R3F Canvas (Interactive, z-20) */}
            <div className="absolute top-0 left-0 w-full h-full z-20">
                <Canvas
                    camera={{ position: [0, 0, 20], fov: 20 }}
                    dpr={[1, 2]}
                    gl={{ alpha: true }}
                >
                    <ambientLight intensity={Math.PI} />
                    
                    <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
                        <Band isMobile={false} />
                    </Physics>
                    
                    <Environment blur={0.75}>
                        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
                    </Environment>
                </Canvas>
            </div>

            {/* 2. Opaque Overlay Mask (The Scratchable Coating, z-10) */}
            <div
                ref={maskRef}
                className="absolute top-0 left-0 w-full h-full z-10"
                style={{
                    backgroundColor: '#050505',
                    // Note: Here (in JSX style prop) PascalCase IS correct, 
                    // but the assignments in the functions must be camelCase.
                    WebkitMaskImage: 'initial', 
                    maskImage: 'initial',
                    maskComposite: 'exclude',
                    pointerEvents: 'none', 
                    transition: 'none'
                }}
            />

            {/* 3. Hidden HTML Canvas (z-0, Used only for drawing the mask texture) */}
            <canvas 
                ref={canvasRef}
                className="absolute top-0 left-0"
                style={{
                    visibility: 'hidden', 
                    pointerEvents: 'none'
                }}
            />

            {/* Overlay Text */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none z-30">
                **Left-Click and scribble** the background to reveal the image! **Right-Click and drag the card.**
            </div>
        </div>
    );
}


// --- MAIN PAGE COMPONENT ---
const BACKGROUND_IMAGE_URL = 'https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

export default function PlaygroundPage() {
    return (
        <div className="relative z-0 w-full h-screen flex justify-center items-center overflow-hidden">
            <ScratchOff imageUrl={BACKGROUND_IMAGE_URL} />
        </div>
    );
}