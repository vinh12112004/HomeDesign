import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader  } from '@react-three/fiber';
import { PointerLockControls, KeyboardControls, useKeyboardControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';

const PlayerMovement = ({ controlsRef }) => {
  const { camera } = useThree();
  const [sub, get] = useKeyboardControls();
  const velocity = useRef(new THREE.Vector3());
  const speed = 5;

  useEffect(() => {
    return sub(
      (state) => state,
      (pressed) => {
        const { forward, backward, left, right, jump } = get();
        velocity.current.x = (right ? 1 : 0) - (left ? 1 : 0);
        velocity.current.z = (backward ? 1 : 0) - (forward ? 1 : 0);
      }
    );
  }, [get, sub]);

  useFrame((_, delta) => {
    if (controlsRef.current && controlsRef.current.isLocked) {
      const moveDirection = new THREE.Vector3(velocity.current.x, 0, velocity.current.z);
      moveDirection.applyQuaternion(camera.quaternion);

      if (moveDirection.length() > 0) {
        const moveVector = moveDirection.normalize().multiplyScalar(speed * delta);
        camera.position.add(moveVector);
      }
    }
  });

  return <PointerLockControls ref={controlsRef} />; 
};

const RoomScene = ({ width, length, height, controlsRef }) => {
  const floorTexture = useLoader(TextureLoader, '/textures/floor.png');
  const repeatX = width / 2;
  const repeatY = length / 2;

  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(repeatX, repeatY);

  const canvasRef = useRef();
  const containerRef = useRef()
  useEffect(() => {
    const handleClick = (e) => {
      // Kiểm tra xem click có phải từ canvas không
      // Bỏ qua nếu click vào element có pointer-events: auto (UI overlay)
      const isCanvas = e.target.tagName === 'CANVAS';
      
      if (isCanvas && controlsRef.current && !controlsRef.current.isLocked) {
        controlsRef.current.lock();
      }
    };

    const container = containerRef.current;
    if (container) {
      // Sử dụng capture phase để bắt event trước khi bubble
      container.addEventListener('click', handleClick, true);
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleClick, true);
      }
      
      if (canvasRef.current && canvasRef.current.renderer) {
        console.log('🧹 Disposing WebGLRenderer...');
        canvasRef.current.renderer.dispose();
      }
    };
  }, [controlsRef]);
  
  const handleCanvasClick = (e) => {
    if (e.target.tagName === 'CANVAS' && controlsRef.current && !controlsRef.current.isLocked) {
      controlsRef.current.lock();
    }
  };

  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
        { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
        { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
        { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
        { name: 'jump', keys: ['Space'] },
      ]}
    >
      <Canvas camera={{ position: [0, 1.7, 0], fov: 75 }} 
              shadows
              onClick={handleCanvasClick}
              style={{ cursor: 'pointer' }}
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

        {/* Floor */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[width, length]} />
          <meshStandardMaterial map={floorTexture} color="white" /> 
        </mesh>

        {/* Walls */}
        <mesh position={[-width / 2, height / 2, 0]} castShadow>
          <boxGeometry args={[0.1, height, length]} />
          <meshStandardMaterial color="lightblue" />
        </mesh>
        <mesh position={[width / 2, height / 2, 0]} castShadow>
          <boxGeometry args={[0.1, height, length]} />
          <meshStandardMaterial color="lightblue" />
        </mesh>
        <mesh position={[0, height / 2, -length / 2]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.1, height, width]} />
          <meshStandardMaterial color="lightblue" />
        </mesh>
        <mesh position={[0, height / 2, length / 2]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.1, height, width]} />
          <meshStandardMaterial color="lightblue" />
        </mesh>

        <PlayerMovement controlsRef={controlsRef} />
      </Canvas>
    </KeyboardControls>
  );
};

export default RoomScene;