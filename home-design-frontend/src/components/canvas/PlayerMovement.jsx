import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

const PlayerMovement = ({ controlsRef }) => {
  const { camera } = useThree();
  const [sub, get] = useKeyboardControls();
  const velocity = useRef(new THREE.Vector3());
  const speed = 5;

  useEffect(() => {
    return sub(
      (state) => state,
      () => {
        const { forward, backward, left, right } = get();
        velocity.current.x = (right ? 1 : 0) - (left ? 1 : 0);
        velocity.current.z = (backward ? 1 : 0) - (forward ? 1 : 0);
      }
    );
  }, [get, sub]);

  useFrame((_, delta) => {
    if (controlsRef.current && controlsRef.current.isLocked) {
      const moveDir = new THREE.Vector3(velocity.current.x, 0, velocity.current.z);
      moveDir.applyQuaternion(camera.quaternion);
      if (moveDir.length() > 0) {
        const move = moveDir.normalize().multiplyScalar(speed * delta);
        camera.position.add(move);
      }
    }
  });

  return <PointerLockControls ref={controlsRef} />;
};

export default PlayerMovement;
