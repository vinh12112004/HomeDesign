import React, {useState} from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import FurniturePickerModal from './FurniturePickerModal';
import { createObject } from '../../store/slices/objectSlice';
import { setSelectedMesh } from '../../store/slices/uiSlice';

const SideMenu = () => {
  const dispatch = useDispatch();
  const { currentProject } = useSelector(s => s.projects);
  const [openPicker, setOpenPicker] = useState(false);

  const handleSelectFurniture = async (modelUrl) => {
    if (!currentProject || !modelUrl) return;

    const objectData = {
      type: 'Furniture',
      assetKey: 'model/glb',
      positionJson: JSON.stringify({ x: 0, y: 0, z: 0 }),
      rotationJson: JSON.stringify({ x: 0, y: 0, z: 0 }),
      scaleJson: JSON.stringify({ x: 1, y: 1, z: 1 }),
      metadataJson: JSON.stringify({
        geometry: 'model',
        modelUrl,
      })
    };

    try {
      const created = await dispatch(createObject({
        projectId: currentProject.id,
        objectData
      })).unwrap();

      if (created?.id) {
        dispatch(setSelectedMesh(created.id));
      }
    } catch (e) {
      console.error('Create furniture failed:', e?.message || e);
    }
  };
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 56,       
        padding: '0 16px',
        background: '#ffffff',  
        borderBottom: '1px solid #eee',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        zIndex: 50,
      }}
    >

      <Button type="default" onClick={() => setOpenPicker(true)}>Add</Button>
      <Button type="default">Move</Button>
      <Button type="default">Rotate</Button>
      <Button type="default">Measure</Button>


      <div style={{ flex: 1 }} />
      <FurniturePickerModal
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        onSelect={handleSelectFurniture}
      />

    </div>
  );
};

export default SideMenu;
