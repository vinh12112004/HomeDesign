import React from 'react';
import { Tooltip } from 'antd';
import { LockOutlined, DeploymentUnitOutlined } from '@ant-design/icons';

// Component hiển thị Chế độ xem (View Mode)
const ViewModeToggle = ({ mode, onToggle }) => {
    // Mode: 'fixed' (Cố Định) hoặc 'free' (Tự Do)
    const isFixed = mode === 'fixed';
    const icon = isFixed ? <LockOutlined /> : <DeploymentUnitOutlined />;
    const tooltip = isFixed ? 'Click để chuyển sang Chế độ Tự Do' : 'Click để chuyển sang Chế độ Cố Định';

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation(); // Ngăn event bubble xuống canvas
                onToggle();
            }}
            style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: 20,
                fontSize: 14,
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            }}
        >
            <Tooltip title={tooltip}>
                {icon}
                <span style={{ marginLeft: 6 }}>view mode</span>
            </Tooltip>
        </div>
    )
}

export default ViewModeToggle;