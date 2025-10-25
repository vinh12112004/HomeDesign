import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

const ClickableModel = ({ mtlPath, objPath, name, onSelect, isSelected }) => {
  const materials = useLoader(MTLLoader, mtlPath);
  const object = useLoader(OBJLoader, objPath, (loader) => {
    loader.setMaterials(materials);
  });
  const ref = useRef();

  useEffect(() => {
    if (object) {
      object.scale.set(0.1, 0.1, 0.1);
    }
  }, [object]);

  return (
    <>
      {isSelected ? (
        // ✅ Nếu được chọn → có TransformControls
        <TransformControls mode="translate">
          <primitive
            ref={ref}
            object={object}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(name);
            }}
          />
        </TransformControls>
      ) : (
        // 🚫 Nếu chưa được chọn → chỉ render mô hình bình thường
        <primitive
          ref={ref}
          object={object}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(name);
          }}
        />
      )}
    </>
  );
};

const ObjScene = () => {
  const orbitRef = useRef();
  const transformRef = useRef();
  const [selected, setSelected] = useState(null);

  // 🔄 Khi dùng TransformControls thì tắt OrbitControls trong lúc kéo
  useEffect(() => {
    if (!transformRef.current || !orbitRef.current) return;
    const controls = transformRef.current;
    const orbit = orbitRef.current;

    const onDraggingChanged = (event) => {
      orbit.enabled = !event.value;
    };

    controls.addEventListener('dragging-changed', onDraggingChanged);
    return () => controls.removeEventListener('dragging-changed', onDraggingChanged);
  }, []);

  // 🧹 Bỏ chọn nếu click vào nền
  const handleDeselect = () => setSelected(null);

  return (
    <Canvas
      camera={{ position: [3, 3, 3], fov: 60 }}
      onPointerMissed={handleDeselect}
      style={{ width: '100vw', height: '100vh', background: '#eeeeee' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />

      <OrbitControls ref={orbitRef} makeDefault />

      <axesHelper args={[5]} />
      <gridHelper args={[10, 10]} />

      <Suspense fallback={null}>
        <ClickableModel
          name="sofa"
          mtlPath="/models/sofa1.mtl"
          objPath="/models/sofa1.obj"
          onSelect={setSelected}
          isSelected={selected === 'sofa'}
        />
        <ClickableModel
          name="table"
          mtlPath="/models/couchTable.mtl"
          objPath="/models/couchTable.obj"
          onSelect={setSelected}
          isSelected={selected === 'table'}
        />
      </Suspense>
    </Canvas>
  );
};

export default ObjScene;
