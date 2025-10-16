import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Tooltip } from 'antd';
import {
  InfoCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

const APP_NAME = "HomeDesign";

const CanvasHeader = () => {
  const { currentProject } = useSelector(state => state.projects);

  const handleSave = () => {
    console.log('Save project:', currentProject);
    // Implement save functionality
  };

  const handleShare = () => {
    console.log('Share project:', currentProject);
    // Implement share functionality
  };

  const handleUndo = () => {
    console.log('Undo action');
    // Implement undo functionality
  };

  const handleRedo = () => {
    console.log('Redo action');
    // Implement redo functionality
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid #e8e8e8',
        backgroundColor: 'white',
        zIndex: 20,
      }}
    >
      {/* Left Side: Current Project & Info */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>
          {currentProject?.name || 'Untitled Project'}
        </span>
        <Tooltip title="Project Information">
          <InfoCircleOutlined style={{ marginLeft: 8, cursor: 'pointer' }} />
        </Tooltip>
      </div>

      {/* Center: App Logo/Name */}
      <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#6A5ACD' }}>
        <span role="img" aria-label="logo" style={{ fontSize: 20, marginRight: 5 }}>
          ⚛️
        </span>
        {APP_NAME}
      </div>

      {/* Right Side: Actions */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Undo">
          <ArrowLeftOutlined 
            style={{ margin: '0 8px', cursor: 'pointer' }} 
            onClick={handleUndo}
          />
        </Tooltip>
        <Tooltip title="Redo">
          <ArrowRightOutlined 
            style={{ margin: '0 8px', cursor: 'pointer' }} 
            onClick={handleRedo}
          />
        </Tooltip>
        <Tooltip title="Save">
          <SaveOutlined 
            style={{ margin: '0 8px', cursor: 'pointer' }} 
            onClick={handleSave}
          />
        </Tooltip>
        <Tooltip title="Share">
          <ShareAltOutlined 
            style={{ margin: '0 8px', cursor: 'pointer' }} 
            onClick={handleShare}
          />
        </Tooltip>
        <Link to="/" style={{ marginLeft: 16 }}>
          <Button>Back</Button>
        </Link>
      </div>
    </div>
  );
};

export default CanvasHeader;