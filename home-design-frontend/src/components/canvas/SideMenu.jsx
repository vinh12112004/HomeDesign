import React from 'react';
import { Button } from 'antd';

const SideMenu = () => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 56,             // chiều cao thanh menu (tuỳ ý)
        padding: '0 16px',
        background: '#ffffff',  // hoặc trong suốt, tuỳ design
        borderBottom: '1px solid #eee',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        zIndex: 50,
      }}
    >
      {/* Ví dụ các nút chức năng - sau này bạn có thể thêm nhiều hơn */}
      <Button type="default">Add</Button>
      <Button type="default">Move</Button>
      <Button type="default">Rotate</Button>
      <Button type="default">Measure</Button>

      {/* Spacer - đẩy phần còn lại sang phải */}
      <div style={{ flex: 1 }} />

      {/* Các nút ở phía phải */}
      {/* <Button type="primary">Save</Button> */}
    </div>
  );
};

export default SideMenu;
