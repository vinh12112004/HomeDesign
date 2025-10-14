import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrbitControls } from '@react-three/drei';
import PlayerMovement from './PlayerMovement';
import RoomStructure from './RoomStructure';

const RoomScene = ({ width, length, height, controlsRef, viewMode }) => {
  const canvasRef = useRef();
  const containerRef = useRef();
  const [hoveredMesh, setHoveredMesh] = useState(null);
  
  const handleHover = (mesh, isHovering) => {
    // Chỉ highlight khi ở chế độ fixed
    if (viewMode === 'fixed') {
      if (isHovering) {
        setHoveredMesh(mesh);
        console.log('Hovering mesh:', mesh);
      } else {
        setHoveredMesh(null);
      }
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === 'CANVAS' && controlsRef.current && !controlsRef.current.isLocked) {
        controlsRef.current.lock();
      }
    };

    const container = containerRef.current;
    if (container) container.addEventListener('click', handleClick, true);

    return () => {
      if (container) container.removeEventListener('click', handleClick, true);
      if (canvasRef.current && canvasRef.current.renderer) {
        canvasRef.current.renderer.dispose();
      }
    };
  }, [controlsRef]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
          { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
          { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
          { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
          { name: 'jump', keys: ['Space'] },
        ]}
      >
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 1.7, 0], fov: 75 }}
          shadows
          style={{ cursor: viewMode === 'free' ? 'pointer' : 'grab' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            position={[5, 10, 7.5]}
            intensity={1}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          <RoomStructure 
            width={width} 
            length={length} 
            height={height} 
            viewMode={viewMode} 
            onHoverChange={handleHover}
            hoveredMesh={hoveredMesh}
          />

          {viewMode === 'free'
            ? <PlayerMovement controlsRef={controlsRef} />
            : <OrbitControls makeDefault target={[0, height / 2, 0]} enablePan enableDamping />}
        </Canvas>
      </KeyboardControls>
    </div>
  );
};

export default RoomScene;