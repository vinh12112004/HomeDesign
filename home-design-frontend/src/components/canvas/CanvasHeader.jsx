import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import {
  InfoCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

const APP_NAME = "HomeDesign";

const CanvasHeader = ({ projectName }) => (
  <div
    onClick={(e) => e.stopPropagation()}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px',
      borderBottom: '1px solid #e8e8e8',
      backgroundColor: 'white',
      zIndex: 20, // Đảm bảo header nằm trên mọi thứ
    }}
  >
    {/* Left Side: Current Project & Info */}
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ fontWeight: 'bold' }}>{projectName}</span>
      <Tooltip title="Project Information">
        <InfoCircleOutlined style={{ marginRight: 8 }} />
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
    <div>
      <Tooltip title="Undo">
        <ArrowLeftOutlined style={{ margin: '0 8px', cursor: 'pointer' }} />
      </Tooltip>
      <Tooltip title="Redo">
        <ArrowRightOutlined style={{ margin: '0 8px', cursor: 'pointer' }} />
      </Tooltip>
      <Tooltip title="Save">
        <SaveOutlined style={{ margin: '0 8px', cursor: 'pointer' }} />
      </Tooltip>
      <Tooltip title="Share">
        <ShareAltOutlined style={{ margin: '0 8px', cursor: 'pointer' }} />
      </Tooltip>
      <Link to="/" style={{ marginLeft: 16 }}>
        <Button>Back</Button>
      </Link>
    </div>
  </div>
);

export default CanvasHeader;