import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Text, Float, RoundedBox, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CabinCard3DProps {
  level: string;
  id: string;
  color: string;
  accent: string;
}

const CardMesh = ({ level, id, color, accent }: CabinCard3DProps) => {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Map level to colors
  const getColors = () => {
    if (level.includes('Standard')) return { bg: '#1a1a1a', edge: '#333333', text: '#ffffff', accent: '#a8a29e' };
    if (level.includes('Premium')) return { bg: '#1e1b4b', edge: '#312e81', text: '#ffffff', accent: '#818cf8' };
    if (level.includes('Luxury')) return { bg: '#3f2c00', edge: '#713f12', text: '#ffffff', accent: '#fbbf24' };
    if (level.includes('Presidential')) return { bg: '#000000', edge: '#111111', text: '#ffffff', accent: '#fbbf24' };
    return { bg: '#1a1a1a', edge: '#333333', text: '#ffffff', accent: '#a8a29e' };
  };

  const colors = getColors();

  useFrame((state) => {
    if (group.current) {
      // Gentle floating rotation
      const t = state.clock.getElapsedTime();
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        hovered ? Math.sin(t * 2) * 0.1 : Math.sin(t) * 0.2,
        0.1
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        hovered ? Math.cos(t * 2) * 0.05 : Math.cos(t) * 0.1,
        0.1
      );
    }
  });

  return (
    <group 
      ref={group} 
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Main Card Body */}
        <RoundedBox args={[2.5, 3.8, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color={colors.bg} metalness={0.8} roughness={0.2} />
        </RoundedBox>

        {/* Edge / Border */}
        <RoundedBox args={[2.55, 3.85, 0.08]} radius={0.12} smoothness={4} position={[0, 0, -0.02]}>
          <meshStandardMaterial color={colors.edge} metalness={0.9} roughness={0.1} />
        </RoundedBox>

        {/* Magnetic Stripe */}
        <mesh position={[0, 1.2, 0.06]}>
          <planeGeometry args={[2.5, 0.4]} />
          <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.8} />
        </mesh>

        {/* Smart Chip */}
        <RoundedBox args={[0.6, 0.8, 0.02]} radius={0.05} position={[-0.7, 0.2, 0.06]}>
          <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} />
        </RoundedBox>

        {/* Text Elements */}
        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.4}
          color={colors.accent}
          anchorX="center"
          anchorY="middle"
        >
          ❖
        </Text>

        <Text
          position={[0, -0.8, 0.06]}
          fontSize={0.25}
          color={colors.text}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/playfairdisplay/v29/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff"
        >
          {level}
        </Text>

        <Text
          position={[0, -1.2, 0.06]}
          fontSize={0.12}
          color={colors.accent}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          OWNER ACCESS
        </Text>

        <Text
          position={[0.8, 0.2, 0.06]}
          fontSize={0.15}
          color={colors.text}
          anchorX="right"
          anchorY="middle"
          letterSpacing={0.1}
        >
          #{id}
        </Text>

        {/* Holographic overlay effect */}
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[2.4, 3.7]} />
          <meshPhysicalMaterial 
            color={colors.accent} 
            transparent 
            opacity={0.1} 
            metalness={1} 
            roughness={0} 
            clearcoat={1} 
            clearcoatRoughness={0.1} 
          />
        </mesh>
      </Float>
    </group>
  );
};

export default function CabinCard3D(props: CabinCard3DProps) {
  console.log('CabinCard3D rendering:', props);
  return (
    <div className="w-full h-[400px] relative cursor-pointer">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <CardMesh {...props} />
        <OrbitControls enableZoom={false} enablePan={false} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
