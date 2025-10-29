import React, { useEffect, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { useSelector, useDispatch } from 'react-redux';
import { useThree } from '@react-three/fiber';
import { updateObject } from '../../store/slices/objectSlice';

export default function TransformControlsManager() {
  const { selectedMesh, showTranformControls } = useSelector(state => state.ui);
  const { objects } = useSelector(state => state.objects);
  const dispatch = useDispatch();
  const transformRef = useRef();
  const { scene, gl } = useThree();

  // Tắt OrbitControls khi đang kéo TransformControls
  useEffect(() => {
    if (!transformRef.current) return;
    
    const transformControls = transformRef.current;
    const canvas = gl.domElement;

    const onDraggingChanged = (event) => {
      // Tìm OrbitControls trong scene
      const orbitControls = gl.domElement.parentElement?.querySelector('canvas')?.__r3f?.orbitControls;
      if (orbitControls) {
        orbitControls.enabled = !event.value;
      }

      // Thay đổi cursor khi đang kéo
      if (canvas) {
        canvas.style.cursor = event.value ? 'grabbing' : 'grab';
      }
    };

    const onObjectChange = () => {
      if (transformControls.object) {
        const pos = transformControls.object.position;
        const rot = transformControls.object.rotation;
        console.log(`🔄 Đang kéo:`, {
          position: { x: pos.x.toFixed(2), y: pos.y.toFixed(2), z: pos.z.toFixed(2) },
          rotation: { x: rot.x.toFixed(2), y: rot.y.toFixed(2), z: rot.z.toFixed(2) }
        });
      }
    };

    transformControls.addEventListener('dragging-changed', onDraggingChanged);
    transformControls.addEventListener('objectChange', onObjectChange);
    
    return () => {
      transformControls.removeEventListener('dragging-changed', onDraggingChanged);
      transformControls.removeEventListener('objectChange', onObjectChange);
    };
  }, [gl]);

  // Attach TransformControls vào object được chọn
  useEffect(() => {
    if (!transformRef.current || !selectedMesh || !showTranformControls) {
      if (transformRef.current) {
        transformRef.current.detach();
      }
      return;
    }

    // Tìm group có userData.objectId khớp với selectedMesh
    const findTargetGroup = (object) => {
      // Kiểm tra userData trực tiếp
      if (object.userData?.objectId === selectedMesh) {
        return object;
      }
      // Tìm trong children
      for (let child of object.children) {
        const found = findTargetGroup(child);
        if (found) return found;
      }
      return null;
    };

    const targetGroup = findTargetGroup(scene);
    
    if (targetGroup) {
      transformRef.current.attach(targetGroup);
      console.log('🎯 Đã attach TransformControls vào:', selectedMesh, targetGroup);
    } else {
      console.warn('⚠️ Không tìm thấy object với ID:', selectedMesh);
    }
  }, [selectedMesh, showTranformControls, scene]);

  // Xử lý khi kéo xong (mouseUp)
  const handleMouseUp = () => {
    if (!transformRef.current?.object) return;

    const targetObject = transformRef.current.object;
    const newPosition = targetObject.position;
    const newRotation = targetObject.rotation;

    // Tìm object data từ Redux store
    const currentObject = objects.find(obj => obj.id === selectedMesh);
    if (!currentObject) {
      console.warn('⚠️ Không tìm thấy object trong Redux store:', selectedMesh);
      return;
    }

    // Chuẩn bị data để update
    const fullObjectData = {
      type: currentObject.type,
      assetKey: currentObject.assetKey,
      positionJson: JSON.stringify({
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z
      }),
      rotationJson: JSON.stringify({
        x: newRotation.x,
        y: newRotation.y,
        z: newRotation.z
      }),
      scaleJson: currentObject.scaleJson,
      metadataJson: currentObject.metadataJson
    };

    // Dispatch update
    dispatch(updateObject({
      objectId: selectedMesh,
      objectData: fullObjectData
    }));
    
    console.log('✅ Cập nhật vị trí vật thể:', fullObjectData);
  };

  // Chỉ render khi ở fixed mode và có object được chọn
  if (!showTranformControls || !selectedMesh) {
    return null;
  }

  return (
    <TransformControls 
      ref={transformRef} 
      mode="translate"
      onMouseUp={handleMouseUp}
      size={0.8}
      showX={true}
      showY={true}
      showZ={true}
    />
  );
}