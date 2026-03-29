import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Cylinder, Html, SpotLight, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { X } from 'lucide-react';

const Player = ({ isLocked, isCabin }: { isLocked: boolean, isCabin?: boolean }) => {
  const { camera } = useThree();
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    if (!isLocked) {
      setMovement({ forward: false, backward: false, left: false, right: false });
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement(m => ({ ...m, forward: true })); break;
        case 'KeyS': case 'ArrowDown': setMovement(m => ({ ...m, backward: true })); break;
        case 'KeyA': case 'ArrowLeft': setMovement(m => ({ ...m, left: true })); break;
        case 'KeyD': case 'ArrowRight': setMovement(m => ({ ...m, right: true })); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement(m => ({ ...m, forward: false })); break;
        case 'KeyS': case 'ArrowDown': setMovement(m => ({ ...m, backward: false })); break;
        case 'KeyA': case 'ArrowLeft': setMovement(m => ({ ...m, left: false })); break;
        case 'KeyD': case 'ArrowRight': setMovement(m => ({ ...m, right: false })); break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isLocked]);

  useFrame((state, delta) => {
    const speed = 5 * delta;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, (movement.backward ? 1 : 0) - (movement.forward ? 1 : 0));
    const sideVector = new THREE.Vector3((movement.left ? 1 : 0) - (movement.right ? 1 : 0), 0, 0);
    
    const yaw = new THREE.Euler(0, camera.rotation.y, 0, 'YXZ');
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed).applyEuler(yaw);
    
    // Collision bounds
    const newX = camera.position.x + direction.x;
    const newZ = camera.position.z + direction.z;
    
    if (isCabin) {
      if (newX > -5.5 && newX < 5.5) camera.position.x = newX;
      if (newZ > -7.5 && newZ < 7.5) camera.position.z = newZ;
    } else {
      // Check X movement
      if (camera.position.z < 29.5) {
        if (newX > -14 && newX < 14) camera.position.x = newX;
      } else {
        if (newX > -2 && newX < 2) camera.position.x = newX;
      }

      // Check Z movement
      if (camera.position.x > -2 && camera.position.x < 2) {
        if (newZ > -29 && newZ < 44) camera.position.z = newZ;
      } else {
        if (newZ > -29 && newZ < 29.5) camera.position.z = newZ;
      }
    }
    
    // Gentle rocking motion for the boat
    const time = state.clock.getElapsedTime();
    camera.position.y = 1.7 + Math.sin(time * 0.5) * 0.05;
  });

  return null;
};

const Chair = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
  <group position={position} rotation={rotation}>
    {/* Seat */}
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
      <meshStandardMaterial color="#7f1d1d" roughness={0.8} />
    </mesh>
    {/* Leg */}
    <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.05, 0.2, 0.5, 16]} />
      <meshStandardMaterial color="#3d1c04" roughness={0.6} />
    </mesh>
    {/* Backrest */}
    <mesh position={[0, 0.8, -0.25]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.4, 0.4, 0.05]} />
      <meshStandardMaterial color="#7f1d1d" roughness={0.8} />
    </mesh>
    {/* Backrest supports */}
    <mesh position={[-0.15, 0.65, -0.2]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.3]} />
      <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0.15, 0.65, -0.2]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.3]} />
      <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.3} />
    </mesh>
  </group>
);

const RouletteWheel = ({ position }: { position: [number, number, number] }) => {
  const wheelRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.y = clock.elapsedTime * 2;
    }
  });

  return (
    <group position={position}>
      {/* Outer bowl */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
        <meshStandardMaterial color="#3d1c04" roughness={0.4} />
      </mesh>
      {/* Inner spinning wheel */}
      <group ref={wheelRef} position={[0, 0.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
        </mesh>
        {/* Center cone */}
        <mesh position={[0, 0.05, 0]}>
          <coneGeometry args={[0.1, 0.1, 16]} />
          <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

const Cards = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[-0.1, 0.01, 0]} rotation={[0, 0.2, 0]}>
      <boxGeometry args={[0.15, 0.01, 0.2]} />
      <meshStandardMaterial color="#ffffff" roughness={0.8} />
    </mesh>
    <mesh position={[0.1, 0.02, 0.05]} rotation={[0, -0.1, 0]}>
      <boxGeometry args={[0.15, 0.01, 0.2]} />
      <meshStandardMaterial color="#ffffff" roughness={0.8} />
    </mesh>
    {/* Chips */}
    <mesh position={[0.3, 0.02, -0.1]}>
      <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
      <meshStandardMaterial color="#f43f5e" roughness={0.6} />
    </mesh>
    <mesh position={[0.3, 0.06, -0.1]}>
      <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
      <meshStandardMaterial color="#3b82f6" roughness={0.6} />
    </mesh>
  </group>
);

const Table = ({ position, name, minBet, type = 'cards', onPlayGame }: { position: [number, number, number], name: string, minBet: string, type?: 'cards' | 'roulette' | 'craps', onPlayGame?: (gameId: string) => void }) => {
  const [hovered, setHovered] = useState(false);
  const [joined, setJoined] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleJoin = (e: any) => {
    if (!document.pointerLockElement) return;
    e.stopPropagation();
    if (onPlayGame) {
      // Map table type/name to game ID
      let gameId = 'poker';
      if (type === 'roulette') gameId = 'roulette';
      if (type === 'craps') gameId = 'craps'; // Or whatever game ID is appropriate
      if (name.toLowerCase().includes('blackjack')) gameId = 'blackjack';
      if (name.toLowerCase().includes('baccarat')) gameId = 'baccarat';
      onPlayGame(gameId);
      return;
    }
    if (joined || result) return;
    setJoined(true);
    setResult(null);
    setTimeout(() => {
      setJoined(false);
      const won = Math.random() > 0.5;
      setResult(won ? 'You Won! +1.0 ETH' : 'Dealer Wins');
      setTimeout(() => setResult(null), 3000);
    }, 3000);
  };

  return (
    <group 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={handleJoin}
    >
      <Cylinder args={[0.5, 0.5, 1, 32]} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#EAB308" roughness={0.3} metalness={0.8} />
      </Cylinder>
      <Cylinder args={[1.5, 1.5, 0.1, 32]} position={[0, 1.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial 
          color={hovered ? "#1E2B50" : "#0A1128"} 
          roughness={0.9} 
          emissive={hovered ? "#EAB308" : "#000000"} 
          emissiveIntensity={0.1} 
        />
      </Cylinder>
      <Cylinder args={[1.6, 1.6, 0.15, 32]} position={[0, 1.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3d1c04" roughness={0.4} />
      </Cylinder>

      {/* Table Accessories */}
      {type === 'roulette' && <RouletteWheel position={[0, 1.1, 0]} />}
      {type === 'cards' && <Cards position={[0, 1.1, 0]} />}
      {type === 'craps' && (
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.6]} />
          <meshStandardMaterial color="#047857" roughness={0.8} />
        </mesh>
      )}

      {/* Chairs */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI * 2) / 6;
        const x = Math.cos(angle) * 2;
        const z = Math.sin(angle) * 2;
        return <Chair key={i} position={[x, 0, z]} rotation={[0, -angle - Math.PI / 2, 0]} />;
      })}

      {/* UI */}
      <Html position={[0, 2.5, 0]} center zIndexRange={[100, 0]}>
        <div className={`transition-all duration-300 ${hovered || joined || result ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
          <div className="bg-black/90 text-white px-6 py-3 rounded-xl border border-gold/50 whitespace-nowrap backdrop-blur-md shadow-2xl shadow-gold/20">
            {joined ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                <span className="text-gold font-serif text-lg">Playing...</span>
              </div>
            ) : result ? (
              <span className={`font-serif font-bold text-xl ${result.includes('Won') ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`}>
                {result}
              </span>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="font-serif text-xl text-gold font-bold">{name}</span>
                <span className="text-white/70 text-sm">Min Bet: {minBet}</span>
                <span className="text-xs text-gold/50 mt-1 uppercase tracking-widest">Click to Play</span>
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
};

const Chandelier = ({ position }: { position: [number, number, number] }) => {
  const ringRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Chain */}
      <Cylinder args={[0.05, 0.05, 3]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#EAB308" metalness={0.9} roughness={0.2} />
      </Cylinder>
      
      {/* Tiers */}
      <group ref={ringRef}>
        <Cylinder args={[2, 2, 0.1, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[1, 1, 0.1, 16]} position={[0, -0.5, 0]}>
          <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.2} />
        </Cylinder>
        
        {/* Lights */}
        <pointLight position={[1.8, 0.2, 0]} color="#FDE047" intensity={3} distance={10} />
        <pointLight position={[-1.8, 0.2, 0]} color="#FDE047" intensity={3} distance={10} />
        <pointLight position={[0, 0.2, 1.8]} color="#FDE047" intensity={3} distance={10} />
        <pointLight position={[0, 0.2, -1.8]} color="#FDE047" intensity={3} distance={10} />
        <pointLight position={[0, -0.5, 0]} color="#FDE047" intensity={6} distance={20} />
      </group>
    </group>
  );
};

const WallSconce = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.2, 0.6, 0.1]} />
        <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.3, 0.2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.3, 0.4]} color="#FDE047" intensity={2} distance={10} />
    </group>
  );
};

const CaptainsWheel = ({ position }: { position: [number, number, number] }) => {
  const wheelRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (wheelRef.current) {
      // Slow, gentle turning of the wheel
      wheelRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Base/Stand */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 1, 16]} />
        <meshStandardMaterial color="#3d1c04" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 8, 0, 0]}>
        <boxGeometry args={[0.4, 1.5, 0.4]} />
        <meshStandardMaterial color="#3d1c04" roughness={0.6} />
      </mesh>
      
      {/* The Wheel */}
      <group ref={wheelRef} position={[0, 1.8, 0.2]} rotation={[Math.PI / 8, 0, 0]}>
        {/* Outer Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.1, 16, 32]} />
          <meshStandardMaterial color="#3d1c04" roughness={0.5} />
        </mesh>
        {/* Inner Hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
          <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Spokes */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2.4, 8]} />
            <meshStandardMaterial color="#3d1c04" roughness={0.5} />
          </mesh>
        ))}
      </group>
      
      {/* Spotlight on the wheel */}
      <spotLight position={[0, 4, 2]} angle={0.4} penumbra={0.5} intensity={4} color="#FDE047" target-position={[0, 1.8, 0]} />
    </group>
  );
};

const BarArea = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  const [hovered, setHovered] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = (e: any) => {
    if (!document.pointerLockElement) return;
    e.stopPropagation();
    const messages = ["What can I get ya?", "Rough night at the tables?", "Drinks are on the house for VIPs."];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Bar Counter */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[8, 1.2, 2]} />
        <meshStandardMaterial color="#3d1c04" roughness={0.4} />
      </mesh>
      {/* Bar Top */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[8.2, 0.1, 2.2]} />
        <meshStandardMaterial color="#111" roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Bartender Character */}
      <group 
        position={[0, 1.3, -0.5]} 
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        {/* Vest */}
        <mesh position={[0, 0.4, 0.05]}>
          <cylinderGeometry args={[0.21, 0.21, 0.6]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.4} />
        </mesh>

        {/* Interaction UI */}
        <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
          <div className={`transition-all duration-300 ${hovered || message ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
            <div className="bg-black/90 text-white px-4 py-2 rounded-xl border border-gold/50 whitespace-nowrap backdrop-blur-md">
              {message ? (
                <span className="text-emerald-400 font-serif">{message}</span>
              ) : (
                <span className="text-gold font-serif text-sm">Click to interact</span>
              )}
            </div>
          </div>
        </Html>
      </group>
      
      {/* Back Bar Shelves */}
      <mesh position={[0, 2, -1.8]}>
        <boxGeometry args={[7, 4, 0.5]} />
        <meshStandardMaterial color="#2a1103" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.5, -1.5]}>
        <boxGeometry args={[6.8, 0.1, 0.4]} />
        <meshStandardMaterial color="#0A1128" roughness={0.2} />
      </mesh>
      <mesh position={[0, 2.5, -1.5]}>
        <boxGeometry args={[6.8, 0.1, 0.4]} />
        <meshStandardMaterial color="#0A1128" roughness={0.2} />
      </mesh>
      
      {/* Bottles (Simple representation) */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <group key={`bottle-${i}`}>
          <mesh position={[x, 1.7, -1.5]}>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#EAB308" : "#10b981"} metalness={0.6} roughness={0.2} transparent opacity={0.8} />
          </mesh>
          <mesh position={[x + 0.3, 2.7, -1.5]}>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
            <meshStandardMaterial color={i % 3 === 0 ? "#f43f5e" : "#88ccff"} metalness={0.6} roughness={0.2} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Bar Stools */}
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <group key={`stool-${i}`} position={[x, 0, 1.5]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.05, 0.2, 0.8, 16]} />
            <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
            <meshStandardMaterial color="#0A1128" roughness={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* Bar Lights */}
      <pointLight position={[0, 3, 0]} color="#FDE047" intensity={3} distance={15} />
    </group>
  );
};

const Window = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        if (child.userData.isRiverElement) {
          child.position.x -= 2.0 * delta; // Faster river
          if (child.position.x < -3) {
            child.position.x = 3;
            child.position.y = (Math.random() - 0.5) * 5;
          }
        }
      });
    }
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.01 * delta;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Hollow Frame */}
      <mesh position={[-1.9, 0, 0]}>
        <boxGeometry args={[0.3, 6.2, 0.3]} />
        <meshStandardMaterial color="#1a0b02" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[1.9, 0, 0]}>
        <boxGeometry args={[0.3, 6.2, 0.3]} />
        <meshStandardMaterial color="#1a0b02" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[4.1, 0.3, 0.3]} />
        <meshStandardMaterial color="#1a0b02" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, -3, 0]}>
        <boxGeometry args={[4.1, 0.3, 0.3]} />
        <meshStandardMaterial color="#1a0b02" roughness={0.5} metalness={0.2} />
      </mesh>
      
      {/* Glass / River View Background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[3.8, 5.8]} />
        <meshPhysicalMaterial 
          color="#020617"
          transmission={0.5}
          opacity={1}
          metalness={0.9}
          roughness={0.1}
          ior={1.5}
          thickness={1}
          transparent
        />
      </mesh>

      {/* Distant Stars/Lights */}
      <group ref={starsRef} position={[0, 0, -5]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={`star-${i}`} position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, 0]}>
            <sphereGeometry args={[0.02]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Moving River Elements */}
      <group ref={groupRef} position={[0, 0, -0.08]}>
        {Array.from({ length: 25 }).map((_, i) => (
          <mesh 
            key={i} 
            position={[(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5, 0]} 
            userData={{ isRiverElement: true }}
          >
            <planeGeometry args={[0.6 + Math.random() * 1, 0.03]} />
            <meshBasicMaterial 
              color={Math.random() > 0.9 ? "#fde047" : "#0ea5e9"} 
              transparent 
              opacity={0.1 + Math.random() * 0.3} 
            />
          </mesh>
        ))}
      </group>
      
      {/* Window Panes (Mullions) */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.1, 5.8, 0.1]} />
        <meshStandardMaterial color="#1a0b02" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[3.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#1a0b02" roughness={0.8} />
      </mesh>
    </group>
  );
};

const NPC = ({ position, rotation = [0, 0, 0], color = "#475569", isPlayingSlot = false }: { position: [number, number, number], rotation?: [number, number, number], color?: string, isPlayingSlot?: boolean }) => {
  const armRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (isPlayingSlot && armRef.current) {
      // Animate arm pulling slot lever
      armRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.5 - 0.5;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.18]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.4} />
      </mesh>
      {/* Left Arm */}
      <mesh position={[-0.35, 0.9, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Right Arm (Animated if playing slot) */}
      <group position={[0.35, 1.1, 0]} ref={armRef}>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      </group>
      {/* Legs */}
      <mesh position={[-0.1, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
    </group>
  );
};

const SlotMachine = ({ position, rotation, onPlayGame }: { position: [number, number, number], rotation: [number, number, number], onPlayGame?: (gameId: string) => void }) => {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handlePlay = (e: any) => {
    if (!document.pointerLockElement) return;
    e.stopPropagation();
    if (onPlayGame) {
      onPlayGame('slots');
      return;
    }
    if (playing) return;
    setPlaying(true);
    setResult(null);
    setTimeout(() => {
      setPlaying(false);
      const won = Math.random() > 0.7;
      setResult(won ? 'JACKPOT! +0.5 ETH' : 'Try Again');
      setTimeout(() => setResult(null), 3000);
    }, 2000);
  };

  return (
    <group 
      position={position} 
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={handlePlay}
    >
      {/* Base */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.8, 1.5, 0.8]} />
        <meshStandardMaterial color="#1a0b02" roughness={0.6} />
      </mesh>
      
      {/* Screen Area */}
      <mesh position={[0, 1.6, 0.1]}>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
        <meshStandardMaterial color="#0A1128" roughness={0.2} />
      </mesh>
      
      {/* Glowing Screen */}
      <mesh position={[0, 1.6, 0.46]}>
        <planeGeometry args={[0.6, 0.5]} />
        <meshStandardMaterial 
          color={playing ? "#10b981" : "#EAB308"} 
          emissive={playing ? "#10b981" : "#EAB308"} 
          emissiveIntensity={hovered ? 2 : 1} 
        />
      </mesh>

      {/* Top Sign */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial color="#3d1c04" roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.1, 0.41]}>
        <planeGeometry args={[0.7, 0.3]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={1.5} />
      </mesh>

      {/* Lever */}
      <group position={[0.45, 1.4, 0]} rotation={[playing ? Math.PI / 4 : -Math.PI / 8, 0, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.2} />
        </mesh>
      </group>

      {/* Coin Tray */}
      <mesh position={[0, 0.8, 0.4]}>
        <boxGeometry args={[0.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Local Light for Slot Machine */}
      <pointLight position={[0, 1.8, 0.6]} color="#EAB308" intensity={2} distance={5} />

      {/* UI */}
      <Html position={[0, 2.5, 0]} center zIndexRange={[100, 0]}>
        <div className={`transition-all duration-300 ${hovered || playing || result ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
          <div className="bg-black/90 text-white px-6 py-3 rounded-xl border border-gold/50 whitespace-nowrap backdrop-blur-md shadow-2xl shadow-gold/20">
            {playing ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                <span className="text-emerald-400 font-serif text-lg animate-pulse">Spinning...</span>
              </div>
            ) : result ? (
              <span className={`font-serif font-bold text-xl ${result.includes('JACKPOT') ? 'text-gold animate-bounce inline-block' : 'text-rose-400'}`}>
                {result}
              </span>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="font-serif text-xl text-gold font-bold">Lucky Slots</span>
                <span className="text-white/70 text-sm">Play 0.01 ETH</span>
                <span className="text-xs text-gold/50 mt-1 uppercase tracking-widest">Click to Spin</span>
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
};

const CashierCage = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  const [hovered, setHovered] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = (e: any) => {
    if (!document.pointerLockElement) return;
    e.stopPropagation();
    const messages = ["Welcome to The Lucky Riverboat!", "Need to cash out?", "Good luck out there!"];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Counter */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[6, 1.2, 1.5]} />
        <meshStandardMaterial color="#3d1c04" roughness={0.5} />
      </mesh>
      {/* Counter Top */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[6.2, 0.1, 1.7]} />
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.5} />
      </mesh>
      
      {/* Cashier Character */}
      <group 
        position={[0, 1.3, -0.5]} 
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.4} />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 1.05, 0.1]}>
          <boxGeometry args={[0.3, 0.05, 0.2]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>

        {/* Interaction UI */}
        <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
          <div className={`transition-all duration-300 ${hovered || message ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
            <div className="bg-black/90 text-white px-4 py-2 rounded-xl border border-gold/50 whitespace-nowrap backdrop-blur-md">
              {message ? (
                <span className="text-emerald-400 font-serif">{message}</span>
              ) : (
                <span className="text-gold font-serif text-sm">Click to interact</span>
              )}
            </div>
          </div>
        </Html>
      </group>
      
      {/* Bars/Grille */}
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 2, 0.5]}>
            <cylinderGeometry args={[0.02, 0.02, 1.5]} />
            <meshStandardMaterial color="#EAB308" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {/* Horizontal bars */}
      <mesh position={[0, 1.5, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 6]} />
        <meshStandardMaterial color="#EAB308" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 2.5, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 6]} />
        <meshStandardMaterial color="#EAB308" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Sign */}
      <mesh position={[0, 3, 0.5]}>
        <boxGeometry args={[3, 0.6, 0.1]} />
        <meshStandardMaterial color="#0A1128" roughness={0.4} />
      </mesh>
      <Html position={[0, 3, 0.56]} center transform>
        <div className="text-gold font-serif text-2xl tracking-widest uppercase border border-gold/30 px-4 py-1 bg-black/50">
          Cashier
        </div>
      </Html>
    </group>
  );
};

const PottedPlant = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Pot */}
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.4, 0.3, 0.8, 16]} />
      <meshStandardMaterial color="#1a0b02" roughness={0.8} />
    </mesh>
    {/* Plant/Leaves (simple representation) */}
    <mesh position={[0, 1.2, 0]}>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshStandardMaterial color="#064e3b" roughness={0.9} />
    </mesh>
    <mesh position={[0.2, 1.5, 0.2]}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color="#065f46" roughness={0.9} />
    </mesh>
    <mesh position={[-0.2, 1.4, -0.2]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#047857" roughness={0.9} />
    </mesh>
  </group>
);



const GrandPiano = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(time * 4) * 0.2 - 0.5;
      leftArmRef.current.rotation.z = Math.cos(time * 2) * 0.1;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.cos(time * 4.5) * 0.2 - 0.5;
      rightArmRef.current.rotation.z = Math.sin(time * 2.5) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Piano Body */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2, 0.4, 2.5]} />
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Piano Lid (Open) */}
      <mesh position={[0.5, 1.4, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[1.5, 0.1, 2.5]} />
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Keyboard Area */}
      <mesh position={[0, 0.7, 1.3]}>
        <boxGeometry args={[1.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.8, 0.4, -1]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#000000" roughness={0.1} />
      </mesh>
      <mesh position={[0.8, 0.4, -1]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#000000" roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.4, 1]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#000000" roughness={0.1} />
      </mesh>
      {/* Stool */}
      <mesh position={[0, 0.3, 1.8]}>
        <boxGeometry args={[0.6, 0.1, 0.3]} />
        <meshStandardMaterial color="#000000" roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.15, 1.8]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#000000" roughness={0.1} />
      </mesh>

      {/* Piano Player NPC */}
      <group position={[0, 0.4, 1.8]}>
        {/* Body */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.4} />
        </mesh>
        {/* Tuxedo Jacket Detail */}
        <mesh position={[0, 0.5, 0.1]}>
          <boxGeometry args={[0.25, 0.4, 0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {/* Arms */}
        <group position={[-0.25, 0.6, -0.1]} ref={leftArmRef}>
          <mesh position={[0, -0.2, -0.2]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.5]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
        <group position={[0.25, 0.6, -0.1]} ref={rightArmRef}>
          <mesh position={[0, -0.2, -0.2]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.5]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const ExposedPipes = () => (
  <group>
    {/* Horizontal Pipes */}
    {[2, 5, 8].map((y, i) => (
      <mesh key={`h-pipe-${i}`} position={[0, y, -29.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 30, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
    ))}
    {/* Vertical Pipes */}
    {[-10, 0, 10].map((x, i) => (
      <mesh key={`v-pipe-${i}`} position={[x, 6, -29.6]}>
        <cylinderGeometry args={[0.2, 0.2, 12, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>
    ))}
    {/* Steam Vents */}
    <group position={[5, 10, -28]}>
      <pointLight color="#fbbf24" intensity={2} distance={5} />
      <mesh>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  </group>
);

const PaddleWheelLarge = ({ position }: { position: [number, number, number] }) => {
  const wheelRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (wheelRef.current) wheelRef.current.rotation.x = clock.elapsedTime * 0.5;
  });

  return (
    <group position={position}>
      <group ref={wheelRef}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[5, 0.2, 16, 32]} />
          <meshStandardMaterial color="#78350f" metalness={0.5} roughness={0.5} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <mesh key={i} rotation={[(i * Math.PI) / 4, Math.PI / 2, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[0.2, 10, 2]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* Brass Hub */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[1, 1, 0.5, 16]} />
        <meshStandardMaterial color="#EAB308" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

const VaultDoor = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
  <group position={position} rotation={rotation}>
    {/* Door Frame */}
    <mesh>
      <boxGeometry args={[4.5, 6.5, 0.5]} />
      <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
    </mesh>
    {/* The Door */}
    <mesh position={[0, 0, 0.3]}>
      <boxGeometry args={[4, 6, 0.2]} />
      <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Combination Lock */}
    <mesh position={[1, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
      <meshStandardMaterial color="#EAB308" metalness={1} roughness={0.1} />
    </mesh>
    {/* Handle */}
    <mesh position={[1, 0, 0.55]}>
      <torusGeometry args={[0.3, 0.05, 16, 32]} />
      <meshStandardMaterial color="#EAB308" metalness={1} roughness={0.1} />
    </mesh>
  </group>
);

const VelvetDrapes = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[4, 8, 0.1]} />
      <meshStandardMaterial color="#7f1d1d" roughness={1} />
    </mesh>
    {/* Gold Tie-back */}
    <mesh position={[0, -1, 0.1]}>
      <boxGeometry args={[4.2, 0.2, 0.1]} />
      <meshStandardMaterial color="#EAB308" metalness={0.8} />
    </mesh>
  </group>
);

const FishTank = ({ position }: { position: [number, number, number] }) => {
  const fishRefs = useRef<THREE.Group[]>([]);
  
  useFrame(({ clock }) => {
    fishRefs.current.forEach((fish, i) => {
      if (fish) {
        fish.position.y = Math.sin(clock.elapsedTime * 2 + i) * 0.5 + 4;
        fish.rotation.y = clock.elapsedTime * 0.5 + i;
        fish.position.x = Math.cos(clock.elapsedTime * 0.5 + i) * 1.5;
        fish.position.z = Math.sin(clock.elapsedTime * 0.5 + i) * 1.5;
      }
    });
  });

  return (
    <group position={position}>
      {/* Tank Base */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 1, 32]} />
        <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Tank Glass */}
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[2, 2, 10, 32]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Tank Top */}
      <mesh position={[0, 11.5, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 1, 32]} />
        <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Water/Inner Volume */}
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 9.8, 32]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.4} />
      </mesh>

      {/* Fish */}
      {[...Array(10)].map((_, i) => (
        <group key={`fish-${i}`} ref={el => fishRefs.current[i] = el as THREE.Group}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <coneGeometry args={[0.1, 0.3, 4]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#f97316" : "#fbbf24"} />
          </mesh>
        </group>
      ))}

      {/* Crustaceans (Crabs) at bottom */}
      {[...Array(3)].map((_, i) => (
        <group key={`crab-${i}`} position={[Math.cos(i * 2) * 1.2, 1.2, Math.sin(i * 2) * 1.2]}>
          <mesh>
            <boxGeometry args={[0.3, 0.1, 0.2]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      ))}
      
      {/* Bubbles */}
      <pointLight position={[0, 6, 0]} color="#38bdf8" intensity={2} distance={10} />
    </group>
  );
};

const Musician = ({ color, instrument }: { color: string, instrument: string }) => {
  const armRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (armRef.current) {
      armRef.current.rotation.x = Math.sin(clock.elapsedTime * 5) * 0.2;
    }
  });

  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.4} />
      </mesh>
      {/* Arms */}
      <group position={[0, 0.8, 0]} ref={armRef}>
        <mesh position={[0.25, -0.2, 0.2]} rotation={[-Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-0.25, -0.2, 0.2]} rotation={[-Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* Instrument Prop */}
      {instrument === 'guitar' || instrument === 'bass' ? (
        <mesh position={[0, 0.6, 0.25]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[1, 0.2, 0.05]} />
          <meshStandardMaterial color={instrument === 'bass' ? "#7f1d1d" : "#d97706"} />
        </mesh>
      ) : null}
    </group>
  );
};

const BandStage = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Stage Base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[6, 6, 0.4, 32]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.8} />
      </mesh>
      {/* Stage Trim */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[6.1, 6.1, 0.1, 32]} />
        <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Piano Player */}
      <GrandPiano position={[0, 0.4, -2]} rotation={[0, -Math.PI / 4, 0]} />

      {/* Bass Player */}
      <group position={[-3, 0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
        <Musician color="#1e293b" instrument="bass" />
      </group>

      {/* Guitar Player */}
      <group position={[3, 0.4, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <Musician color="#1e293b" instrument="guitar" />
      </group>

      {/* Drummer */}
      <group position={[0, 0.4, 3]} rotation={[0, 0, 0]}>
        <Musician color="#1e293b" instrument="drums" />
        {/* Simple Drum Kit */}
        <mesh position={[0, 0.5, 0.5]}>
          <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-0.6, 0.8, 0.3]} rotation={[0.2, 0, 0.2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0.6, 0.8, 0.3]} rotation={[0.2, 0, -0.2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {/* Cymbal */}
        <mesh position={[0.8, 1.2, 0.2]} rotation={[0.2, 0, -0.2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 16]} />
          <meshStandardMaterial color="#EAB308" metalness={0.8} />
        </mesh>
      </group>

      {/* Stage Lights */}
      <SpotLight position={[-4, 8, 4]} angle={0.5} penumbra={0.5} intensity={2} color="#fcd34d" castShadow target-position={[0, 0, 0]} />
      <SpotLight position={[4, 8, 4]} angle={0.5} penumbra={0.5} intensity={2} color="#fcd34d" castShadow target-position={[0, 0, 0]} />
    </group>
  );
};

const CasinoEnvironment = ({ theme, cabinSettings, onPlayGame }: { theme?: string, cabinSettings?: any, onPlayGame?: (gameId: string) => void }) => {
  // Theme Mapping:
  // '01' - The Bronze Deck
  // '02' - The Silver Saloon
  // '03' - The Gold Vault
  // '04' - The Platinum Quarters

  const isPlatinum = theme === '04';
  const isGold = theme === '03';
  const isSilver = theme === '02';
  const isBronze = theme === '01';

  const woodTexture = useMemo(() => {
    if (theme) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base wood color (rich mahogany/walnut)
    ctx.fillStyle = '#2a1810';
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw planks
    const plankWidth = 64;
    const plankHeight = 256;
    
    for (let x = 0; x < 1024; x += plankWidth) {
      for (let y = 0; y < 1024; y += plankHeight) {
        // Offset every other column for a staggered look
        const yOffset = (x / plankWidth) % 2 === 0 ? 0 : plankHeight / 2;
        const currentY = (y + yOffset) % 1024;

        // Plank variation
        const hueShift = Math.random() * 10 - 5;
        ctx.fillStyle = `hsl(20, 45%, ${15 + Math.random() * 10}%)`;
        ctx.fillRect(x, currentY, plankWidth, plankHeight);

        // Grain (subtle lines)
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(x + Math.random() * plankWidth, currentY);
          ctx.lineTo(x + Math.random() * plankWidth, currentY + plankHeight);
          ctx.stroke();
        }

        // Plank borders
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, currentY, plankWidth, plankHeight);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8); // Adjust repeat for the 30x60 floor
    return texture;
  }, [theme]);

  const floorColor = isPlatinum ? '#042f2e' : isBronze ? '#270a04' : !theme ? '#ffffff' : '#2a1103';
  const wallColor = (isPlatinum || !theme) ? '#164e63' : isBronze ? '#7c2d12' : cabinSettings?.wallColor || '#0A1128';
  const accentColor = isPlatinum ? '#06b6d4' : '#EAB308';

  return (
    <group>
      {/* The River (Outside) */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 60]} />
        <meshStandardMaterial 
          color={floorColor} 
          map={woodTexture}
          roughness={(!theme || isPlatinum) ? 0.3 : isBronze ? 0.8 : 0.4} 
          metalness={(!theme) ? 0.4 : (isBronze ? 0.5 : 0.1)} 
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 12, 0]} receiveShadow>
        <planeGeometry args={[30, 60]} />
        <meshStandardMaterial color={isBronze ? "#0f172a" : "#050814"} roughness={0.9} />
      </mesh>

      {/* Walls (Removed for sunset view) */}
      {/* 
      <mesh position={[0, 6, -30]} receiveShadow>
        <boxGeometry args={[30, 12, 1]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      
      <mesh position={[-9.5, 6, 30]} receiveShadow>
        <boxGeometry args={[11, 12, 1]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      <mesh position={[9.5, 6, 30]} receiveShadow>
        <boxGeometry args={[11, 12, 1]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 10, 30]} receiveShadow>
        <boxGeometry args={[8, 4, 1]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      */}

      <Sky sunPosition={[100, 10, 100]} turbidity={0.5} rayleigh={2} />

      {/* Entrance Hall Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 37.5]} receiveShadow>
        <planeGeometry args={[8, 15]} />
        <meshStandardMaterial 
          color={floorColor} 
          map={woodTexture}
          roughness={(!theme || isPlatinum) ? 0.3 : isBronze ? 0.8 : 0.4} 
          metalness={(!theme) ? 0.4 : (isBronze ? 0.5 : 0.1)} 
        />
      </mesh>
      
      {/* Entrance Hall Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 37.5]} receiveShadow>
        <planeGeometry args={[8, 15]} />
        <meshStandardMaterial color={isBronze ? "#0f172a" : "#050814"} roughness={0.9} />
      </mesh>
      
      {/* Entrance Hall Walls (Removed for sunset view) */}
      {/*
      <mesh position={[-4.5, 4, 37.5]} receiveShadow>
        <boxGeometry args={[1, 8, 15]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      <mesh position={[4.5, 4, 37.5]} receiveShadow>
        <boxGeometry args={[1, 8, 15]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      
      <mesh position={[0, 4, 45]} receiveShadow>
        <boxGeometry args={[10, 8, 1]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      */}

      {/* Red Carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 37.5]} receiveShadow>
        <planeGeometry args={[4, 15]} />
        <meshStandardMaterial color="#991b1b" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 25]} receiveShadow>
        <planeGeometry args={[4, 10]} />
        <meshStandardMaterial color="#991b1b" roughness={0.9} />
      </mesh>

      {/* Guardrails in Entrance Hall */}
      <mesh position={[-2.2, 0.5, 37.5]} receiveShadow>
        <boxGeometry args={[0.1, 1, 15]} />
        <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[2.2, 0.5, 37.5]} receiveShadow>
        <boxGeometry args={[0.1, 1, 15]} />
        <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Guardrail Posts */}
      {[-2.2, 2.2].map((x) => (
        <group key={`posts-${x}`}>
          {[30.5, 34, 37.5, 41, 44.5].map((z) => (
            <mesh key={`post-${x}-${z}`} position={[x, 0.5, z]} receiveShadow castShadow>
              <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
              <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Entrance Hall Lights */}
      <pointLight position={[0, 6, 35]} color="#FDE047" intensity={2} distance={15} />
      <pointLight position={[0, 6, 40]} color="#FDE047" intensity={2} distance={15} />
      
      {/* Specific Decorations per Tier */}
      {isBronze && <ExposedPipes />}
      
      {isSilver && (
        <group>
          <PaddleWheelLarge position={[-14, 6, 0]} />
          <PaddleWheelLarge position={[14, 6, 0]} />
          <pointLight position={[0, 8, 0]} color="#38bdf8" intensity={5} distance={30} />
        </group>
      )}

      {isGold && (
        <group>
          <Chandelier position={[0, 9, -15]} />
          <Chandelier position={[0, 9, 15]} />
          <VelvetDrapes position={[-14.4, 6, -10]} rotation={[0, Math.PI / 2, 0]} />
          <VelvetDrapes position={[-14.4, 6, 10]} rotation={[0, Math.PI / 2, 0]} />
          <VelvetDrapes position={[14.4, 6, -10]} rotation={[0, -Math.PI / 2, 0]} />
          <VelvetDrapes position={[14.4, 6, 10]} rotation={[0, -Math.PI / 2, 0]} />
          <GrandPiano position={[8, 0, -20]} rotation={[0, -Math.PI / 4, 0]} />
        </group>
      )}

      {isPlatinum && (
        <group>
          <VaultDoor position={[0, 3, -29.4]} rotation={[0, 0, 0]} />
          <CaptainsWheel position={[0, 0, 25]} />
          <Chandelier position={[0, 10, 0]} />
          <BarArea position={[-10, 0, -20]} rotation={[0, Math.PI / 2, 0]} />
          <pointLight position={[0, 8, -25]} color="#EAB308" intensity={4} distance={20} />
        </group>
      )}

      {/* Side Walls (Split into top and bottom to leave room for windows) */}
      {/* Left Side */}
      <mesh position={[-15, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[60, 3, 1]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      <mesh position={[-15, 10.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[60, 3, 1]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      {/* Vertical strips between windows (Left) */}
      {[
        { z: -23.5, w: 13 },
        { z: -10, w: 6 },
        { z: 0, w: 6 },
        { z: 10, w: 6 },
        { z: 23.5, w: 13 }
      ].map((strip, i) => (
        <mesh key={`l-strip-${i}`} position={[-15, 6, strip.z]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[strip.w, 6, 1]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>
      ))}

      {/* Right Side */}
      <mesh position={[15, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[60, 3, 1]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      <mesh position={[15, 10.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[60, 3, 1]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      {/* Vertical strips between windows (Right) */}
      {[
        { z: -23.5, w: 13 },
        { z: -10, w: 6 },
        { z: 0, w: 6 },
        { z: 10, w: 6 },
        { z: 23.5, w: 13 }
      ].map((strip, i) => (
        <mesh key={`r-strip-${i}`} position={[15, 6, strip.z]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[strip.w, 6, 1]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>
      ))}

      {/* Wood Trim / Wainscoting (Not in Boiler Room) */}
      {!isBronze && (
        <group>
          <mesh position={[0, 1.5, -29.4]} receiveShadow>
            <boxGeometry args={[30, 3, 0.2]} />
            <meshStandardMaterial color="#3d1c04" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.5, 29.4]} receiveShadow>
            <boxGeometry args={[30, 3, 0.2]} />
            <meshStandardMaterial color="#3d1c04" roughness={0.6} />
          </mesh>
          <mesh position={[-14.4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
            <boxGeometry args={[60, 3, 0.2]} />
            <meshStandardMaterial color="#3d1c04" roughness={0.6} />
          </mesh>
          <mesh position={[14.4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
            <boxGeometry args={[60, 3, 0.2]} />
            <meshStandardMaterial color="#3d1c04" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* Pillars and Windows (Windows only in higher tiers) */}
      {[-20, -10, 0, 10, 20].map((z, i) => (
        <group key={i}>
          <Cylinder args={[0.4, 0.4, 12, 16]} position={[-14, 6, z]}>
            <meshStandardMaterial color={isBronze ? "#475569" : accentColor} metalness={0.8} roughness={0.2} />
          </Cylinder>
          <Cylinder args={[0.4, 0.4, 12, 16]} position={[14, 6, z]}>
            <meshStandardMaterial color={isBronze ? "#475569" : accentColor} metalness={0.8} roughness={0.2} />
          </Cylinder>
          
          {/* Windows (Not in Boiler Room) */}
          {!isBronze && (
            <>
              <Window position={[-15, 6, z - 5]} rotation={[0, Math.PI / 2, 0]} />
              <Window position={[15, 6, z - 5]} rotation={[0, -Math.PI / 2, 0]} />
            </>
          )}
        </group>
      ))}

      {/* Ambient Lighting (Sunset) */}
      <ambientLight intensity={0.4} color="#f59e0b" />
      <hemisphereLight intensity={0.6} color="#f59e0b" groundColor="#451a03" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#fef3c7" distance={100} />
      <pointLight position={[10, 10, 20]} intensity={0.5} color="#fef3c7" distance={100} />
      <pointLight position={[-10, 10, -20]} intensity={0.5} color="#fef3c7" distance={100} />
      
      {/* Interior Props based on Tier */}
      {isBronze ? (
        <group>
          {/* Industrial Stools and Barrels */}
          {[-5, 0, 5].map((x, i) => (
            <group key={i} position={[x, 0, -10]}>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.8} />
              </mesh>
            </group>
          ))}
          <SlotMachine position={[-13.5, 0, 10]} rotation={[0, Math.PI / 2, 0]} onPlayGame={onPlayGame} />
          <SlotMachine position={[13.5, 0, 10]} rotation={[0, -Math.PI / 2, 0]} onPlayGame={onPlayGame} />
        </group>
      ) : isSilver ? (
        <group>
          <SpotLight position={[0, 8, -10]} angle={0.6} penumbra={0.5} intensity={2} color="#fcd34d" castShadow target-position={[0, 0, -10]} />
          <Table position={[0, 0, -10]} name="Paddlewheel Poker" minBet="0.05 ETH" onPlayGame={onPlayGame} />
          
          <SpotLight position={[-10, 8, 15]} angle={0.5} penumbra={0.5} intensity={1.5} color="#fcd34d" castShadow target-position={[-10, 0, 15]} />
          <SlotMachine position={[-10, 0, 15]} rotation={[0, Math.PI / 2, 0]} onPlayGame={onPlayGame} />
          
          <SpotLight position={[10, 8, 15]} angle={0.5} penumbra={0.5} intensity={1.5} color="#fcd34d" castShadow target-position={[10, 0, 15]} />
          <SlotMachine position={[10, 0, 15]} rotation={[0, -Math.PI / 2, 0]} onPlayGame={onPlayGame} />
          
          <SpotLight position={[0, 8, -25]} angle={0.8} penumbra={0.5} intensity={1.5} color="#fbbf24" castShadow target-position={[0, 0, -25]} />
          <BarArea position={[0, 0, -25]} />

          {/* Paddlewheels on walls */}
          <PaddleWheelLarge position={[-14.5, 6, 0]} />
          <PaddleWheelLarge position={[14.5, 6, 0]} />
        </group>
      ) : isGold ? (
        <group>
          <SpotLight position={[-6, 8, 0]} angle={0.6} penumbra={0.5} intensity={2} color="#fcd34d" castShadow target-position={[-6, 0, 0]} />
          <Table position={[-6, 0, 0]} name="Grand Baccarat" minBet="0.1 ETH" onPlayGame={onPlayGame} />
          
          <SpotLight position={[6, 8, 0]} angle={0.6} penumbra={0.5} intensity={2} color="#fcd34d" castShadow target-position={[6, 0, 0]} />
          <Table position={[6, 0, 0]} name="Royal Roulette" minBet="0.1 ETH" type="roulette" onPlayGame={onPlayGame} />
          
          <SpotLight position={[0, 8, -25]} angle={0.8} penumbra={0.5} intensity={1.5} color="#fbbf24" castShadow target-position={[0, 0, -25]} />
          <BarArea position={[0, 0, -25]} />
          
          <PottedPlant position={[-12, 0, -25]} />
          <PottedPlant position={[12, 0, -25]} />
          
          <GrandPiano position={[8, 0, -20]} rotation={[0, -Math.PI / 4, 0]} />
        </group>
      ) : isPlatinum ? (
        <group>
          <SpotLight position={[0, 8, 0]} angle={0.6} penumbra={0.5} intensity={2.5} color="#fcd34d" castShadow target-position={[0, 0, 0]} />
          <Table position={[0, 0, 0]} name="Captain's High Stakes" minBet="1.0 ETH" onPlayGame={onPlayGame} />
          
          <SpotLight position={[-8, 8, 10]} angle={0.6} penumbra={0.5} intensity={2} color="#fcd34d" castShadow target-position={[-8, 0, 10]} />
          <Table position={[-8, 0, 10]} name="Elite Blackjack" minBet="0.5 ETH" onPlayGame={onPlayGame} />
          
          <SpotLight position={[8, 8, 10]} angle={0.6} penumbra={0.5} intensity={2} color="#fcd34d" castShadow target-position={[8, 0, 10]} />
          <Table position={[8, 0, 10]} name="Diamond Craps" minBet="0.5 ETH" type="craps" onPlayGame={onPlayGame} />
          
          <PottedPlant position={[-12, 0, 20]} />
          <PottedPlant position={[12, 0, 20]} />
        </group>
      ) : (
        // Default Casino Floor (If no theme matches) - Degenerate Paradise
        <group>
          {/* Centerpiece */}
          <FishTank position={[0, 0, 0]} />

          {/* Main Gaming Area */}
          <SpotLight position={[-8, 10, -15]} angle={0.6} penumbra={0.5} intensity={3} color="#fcd34d" castShadow target-position={[-8, 0, -15]} />
          <Table position={[-8, 0, -15]} name="High Stakes Poker" minBet="0.1 ETH" onPlayGame={onPlayGame} />
          
          <SpotLight position={[8, 10, -15]} angle={0.6} penumbra={0.5} intensity={3} color="#fcd34d" castShadow target-position={[8, 0, -15]} />
          <Table position={[8, 0, -15]} name="Royal Roulette" minBet="0.05 ETH" type="roulette" onPlayGame={onPlayGame} />
          
          <SpotLight position={[0, 10, 5]} angle={0.6} penumbra={0.5} intensity={3} color="#fcd34d" castShadow target-position={[0, 0, 5]} />
          <Table position={[0, 0, 5]} name="Blackjack" minBet="0.01 ETH" onPlayGame={onPlayGame} />

          {/* New Tables for Degenerate Paradise */}
          <SpotLight position={[-8, 10, 5]} angle={0.6} penumbra={0.5} intensity={3} color="#fcd34d" castShadow target-position={[-8, 0, 5]} />
          <Table position={[-8, 0, 5]} name="Baccarat Lounge" minBet="0.2 ETH" onPlayGame={onPlayGame} />

          <SpotLight position={[8, 10, 5]} angle={0.6} penumbra={0.5} intensity={3} color="#fcd34d" castShadow target-position={[8, 0, 5]} />
          <Table position={[8, 0, 5]} name="Craps Pit" minBet="0.1 ETH" type="craps" onPlayGame={onPlayGame} />

          <SpotLight position={[0, 10, -10]} angle={0.6} penumbra={0.5} intensity={3} color="#fcd34d" castShadow target-position={[0, 0, -10]} />
          <Table position={[0, 0, -10]} name="Texas Hold'em" minBet="0.5 ETH" onPlayGame={onPlayGame} />
          
          {/* Entertainment */}
          <BandStage position={[12, 0, -25]} rotation={[0, -Math.PI / 4, 0]} />

          {/* Bar & Social */}
          <SpotLight position={[0, 10, -25]} angle={0.8} penumbra={0.5} intensity={2} color="#fbbf24" castShadow target-position={[0, 0, -25]} />
          <BarArea position={[0, 0, -25]} />

          {/* Cashier */}
          <CashierCage position={[-12, 0, -25]} rotation={[0, Math.PI / 4, 0]} />
          
          {/* Slots Row */}
          <group position={[-14, 0, 15]}>
            <SpotLight position={[0, 10, 0]} angle={0.5} penumbra={0.5} intensity={2} color="#fcd34d" castShadow target-position={[0, 0, 0]} />
            <SlotMachine position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} onPlayGame={onPlayGame} />
            <SlotMachine position={[0, 0, -2]} rotation={[0, Math.PI / 2, 0]} onPlayGame={onPlayGame} />
            <SlotMachine position={[0, 0, 2]} rotation={[0, Math.PI / 2, 0]} onPlayGame={onPlayGame} />
          </group>
          
          <group position={[14, 0, 15]}>
            <SpotLight position={[0, 10, 0]} angle={0.5} penumbra={0.5} intensity={2} color="#fcd34d" castShadow target-position={[0, 0, 0]} />
            <SlotMachine position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} onPlayGame={onPlayGame} />
            <SlotMachine position={[0, 0, -2]} rotation={[0, -Math.PI / 2, 0]} onPlayGame={onPlayGame} />
            <SlotMachine position={[0, 0, 2]} rotation={[0, -Math.PI / 2, 0]} onPlayGame={onPlayGame} />
          </group>

          {/* Decorations */}
          <PottedPlant position={[-13, 0, -28]} />
          <PottedPlant position={[13, 0, -28]} />
          <PottedPlant position={[-13, 0, 28]} />
          <PottedPlant position={[13, 0, 28]} />
          <CaptainsWheel position={[0, 0, 25]} />
          
          {/* Paddlewheels on walls */}
          <PaddleWheelLarge position={[-14.5, 6, 0]} />
          <PaddleWheelLarge position={[14.5, 6, 0]} />
        </group>
      )}
    </group>
  );
};

export default function CasinoWorld({ onClose, theme, roomName, onPlayGame }: { onClose: () => void, theme?: string, roomName?: string, onPlayGame?: (gameId: string) => void }) {
  const [isLocked, setIsLocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set ambient volume
      // Attempt to play immediately, though it might need the first click interaction
      audioRef.current.play().catch(e => console.log("Audio autoplay prevented until interaction:", e));
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Ambient Water Sound */}
      <audio 
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/water/ocean_waves_pebbles.ogg" 
        loop 
        autoPlay 
      />

      <button 
        onPointerDown={(e) => {
          e.stopPropagation();
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          onClose();
        }}
        className="absolute top-6 right-6 z-[110] text-white/50 hover:text-white transition-colors bg-black/50 p-2 rounded-full cursor-pointer pointer-events-auto"
      >
        <X className="w-6 h-6" />
      </button>

      {!isLocked && (
        <div 
          className="absolute inset-0 z-[105] flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer" 
          onClick={() => {
            // This is a bit of a hack since we don't have direct access to the PointerLockControls instance easily here
            // but we can try to lock the document or the canvas container
            const container = document.getElementById('casino-container');
            if (container) {
              container.requestPointerLock();
            }
          }}
        >
          <div className="text-center">
            <h2 className="font-serif text-4xl text-gold mb-4">{roomName || 'Riverboat Casino Floor'}</h2>
            <p className="text-white/70 mb-8">Click anywhere to enter. Use WASD to move, Mouse to look around.</p>
            <p className="text-white/40 text-sm">Press ESC to pause.</p>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {isLocked && (
        <div className="absolute inset-0 z-[105] flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-white/50 mix-blend-difference"></div>
        </div>
      )}

      <div id="casino-container" className="absolute inset-0">
        <Canvas shadows camera={{ position: [0, 1.7, 43], fov: 75 }}>
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 5, 30]} />
          <CasinoEnvironment theme={theme} onPlayGame={onPlayGame} />
          <Player isLocked={isLocked} />
          <PointerLockControls 
            makeDefault
            onLock={() => setIsLocked(true)} 
            onUnlock={() => setIsLocked(false)} 
          />
        </Canvas>
      </div>
    </div>
  );
}
