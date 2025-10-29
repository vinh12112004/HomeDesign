import React, { useEffect, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

export default function OBJModel({ 
  objPath,
  mtlPath,
  position,
  rotation,
  scale,
  castShadow,
  receiveShadow,
  userData 
}) {
  const groupRef = useRef();
  const materials = useLoader(MTLLoader, mtlPath);
  const object = useLoader(OBJLoader, objPath, (loader) => {
    loader.setMaterials(materials);
  });

  useEffect(() => {
    if (!object) return;

    // Áp dụng shadow + userData cho tất cả mesh con trong object
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
        // Thêm userData vào mesh con để có thể click
        child.userData = {
          ...child.userData,
          ...userData,
        };
      }
    });
  }, [object, castShadow, receiveShadow, userData]);

  // Log vị trí khi group thay đổi (debug)
  useEffect(() => {
    if (groupRef.current) {
      const pos = groupRef.current.position;
      const rot = groupRef.current.rotation;
      console.log(`📦 OBJ Model ${userData.objectId} loaded at:`, {
        position: { x: pos.x.toFixed(2), y: pos.y.toFixed(2), z: pos.z.toFixed(2) },
        rotation: { x: rot.x.toFixed(2), y: rot.y.toFixed(2), z: rot.z.toFixed(2) }
      });
    }
  }, [userData.objectId]);

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      userData={userData}
      name={`obj-model-${userData.objectId}`}
    >
      <primitive object={object} />
    </group>
  );
}