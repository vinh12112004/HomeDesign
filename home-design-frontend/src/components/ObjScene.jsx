import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

const ClickableModel = ({ mtlPath, objPath, name, onSelect, isSelected, onPositionChange }) => {
  const materials = useLoader(MTLLoader, mtlPath);
  const object = useLoader(OBJLoader, objPath, (loader) => {
    loader.setMaterials(materials);
  });
  const ref = useRef();

  useEffect(() => {
    if (object) {
      object.scale.set(0.1, 0.1, 0.1);
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      box.getSize(size);
      console.log(`Kích thước ${name}:`, size);
    }
  }, [object, name]);

  // Log vị trí khi object thay đổi
  useEffect(() => {
    if (ref.current) {
      const position = ref.current.position;
      console.log(`Vị trí ${name}:`, {
        x: position.x.toFixed(2),
        y: position.y.toFixed(2),
        z: position.z.toFixed(2)
      });
    }
  }, [ref.current?.position, name]);

  return (
    <primitive
      ref={ref}
      object={object}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(name);
      }}
    />
  );
};

const ObjScene = () => {
  const orbitRef = useRef();
  const transformRef = useRef();
  const [selected, setSelected] = useState(null);

  // Tắt OrbitControls khi kéo TransformControls
  useEffect(() => {
    if (!transformRef.current || !orbitRef.current) return;
    const controls = transformRef.current;
    const orbit = orbitRef.current;

    const onDraggingChanged = (event) => {
      orbit.enabled = !event.value;
    };

    const onObjectChange = () => {
      if (controls.object) {
        const pos = controls.object.position;
        console.log(`🔄 ${selected} đang ở vị trí:`, {
          x: pos.x.toFixed(2),
          y: pos.y.toFixed(2),
          z: pos.z.toFixed(2)
        });
      }
    };

    controls.addEventListener('dragging-changed', onDraggingChanged);
    controls.addEventListener('objectChange', onObjectChange);
    
    return () => {
      controls.removeEventListener('dragging-changed', onDraggingChanged);
      controls.removeEventListener('objectChange', onObjectChange);
    };
  }, [selected]);

  const handleDeselect = () => setSelected(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        fontFamily: 'monospace'
      }}>
        <div>Đã chọn: {selected || 'Không có'}</div>
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#aaa' }}>
          Click vào vật thể để chọn, kéo để di chuyển
        </div>
      </div>

      <Canvas
        camera={{ position: [3, 3, 3], fov: 60 }}
        onPointerMissed={handleDeselect}
        style={{ width: '100%', height: '100%', background: '#eeeeee' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />

        <OrbitControls ref={orbitRef} makeDefault />

        {/* TransformControls nằm ngoài và attach vào object được chọn */}
        {selected && (
          <TransformControls ref={transformRef} mode="translate" />
        )}

        <axesHelper args={[5]} />
        <gridHelper args={[10, 10]} />

        <Suspense fallback={null}>
          <group name="sofa-group">
            <ClickableModel
              name="sofa"
              mtlPath="/models/sofa1.mtl"
              objPath="/models/sofa1.obj"
              onSelect={setSelected}
              isSelected={selected === 'sofa'}
            />
          </group>
          
          <group name="table-group">
            <ClickableModel
              name="table"
              mtlPath="/models/samsung_tv.mtl"
              objPath="/models/samsung_tv.obj"
              onSelect={setSelected}
              isSelected={selected === 'table'}
            />
          </group>
        </Suspense>

        {/* Attach TransformControls vào object được chọn */}
        <AttachTransform transformRef={transformRef} selected={selected} />
      </Canvas>
    </div>
  );
};

// Component helper để attach TransformControls
const AttachTransform = ({ transformRef, selected }) => {
  useEffect(() => {
    if (transformRef.current && selected) {
      const scene = transformRef.current.parent;
      const targetGroup = scene?.getObjectByName(`${selected}-group`);
      
      if (targetGroup && targetGroup.children[0]) {
        transformRef.current.attach(targetGroup.children[0]);
      }
    }
  }, [selected, transformRef]);

  return null;
};

export default ObjScene;