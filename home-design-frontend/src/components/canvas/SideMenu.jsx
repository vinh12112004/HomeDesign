import React, {useState} from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import FurniturePickerModal from './FurniturePickerModal';
import { createObject, fetchObjects } from '../../store/slices/objectSlice';
import { setSelectedMesh, openObjectEditor  } from '../../store/slices/uiSlice';

const SideMenu = () => {
  const dispatch = useDispatch();
  const { currentProject } = useSelector(s => s.projects);
  const { selectedMesh } = useSelector(s => s.ui);

  const [openPicker, setOpenPicker] = useState(false);

  const handlePropertiesClick = () => {
    if (selectedMesh) {
      dispatch(openObjectEditor());
    }
  };
  const handleSelectFurniture = async (modelData) => {
    if (!currentProject || !modelData) return;
    
    // Parse JSON chứa objPath, mtlPath, texturePath
    let parsed;
    try {
      parsed = JSON.parse(modelData);
    } catch {
      parsed = { objPath: modelData };
    }

    const objectData = {
      type: 'Furniture',
      assetKey: 'model/obj',
      positionJson: JSON.stringify({ x: 0, y: 0, z: 0 }),
      rotationJson: JSON.stringify({ x: 0, y: 0, z: 0 }),
      scaleJson: JSON.stringify({ x: 0.01, y: 0.01, z: 0.01 }),
      metadataJson: JSON.stringify({
        geometry: 'model',
        ...parsed, // thêm objPath, mtlPath, texturePath
      }),
    };

    try {
      const created = await dispatch(createObject({
        projectId: currentProject.id,
        objectData,
      })).unwrap();

      if (created?.id) {
        dispatch(setSelectedMesh(created.id));
      }
    } catch (e) {
      console.error('Create furniture failed:', e?.message || e);
    } finally {
      dispatch(fetchObjects(currentProject.id));
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
      <Button 
        type="primary" 
        onClick={handlePropertiesClick}
        disabled={!selectedMesh}
      >
        Properties
      </Button>


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
