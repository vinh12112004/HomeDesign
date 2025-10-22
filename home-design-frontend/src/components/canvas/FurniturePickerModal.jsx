import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Upload, Input, Image, Space, Spin, Empty } from 'antd';
import { UploadOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssets, uploadAsset } from '../../store/slices/assetSlice';

const FurniturePickerModal = ({ open, onClose, onSelect }) => {
  const dispatch = useDispatch();
  const items = useSelector(s => s.assets.items.furniture);
  const loading = useSelector(s => s.assets.loading.furniture);
  const [filter, setFilter] = useState('');
  const [selectedUrl, setSelectedUrl] = useState('');

  useEffect(() => {
    if (open && items.length === 0) {
      dispatch(fetchAssets({ type: 'furniture' }));
    }
  }, [open, items.length, dispatch]);

  const filtered = useMemo(
    () => items.filter(u => u.toLowerCase().includes(filter.toLowerCase())),
    [items, filter]
  );

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const res = await dispatch(uploadAsset({ type: 'furniture', file })).unwrap();
      const url = res?.url || res; // slice trả {type,url}; unwrap có thể trả object hoặc url tùy implement
      setSelectedUrl(url);
      onSuccess?.(url);
    } catch (e) { onError?.(e); }
  };

  const confirm = () => {
    if (selectedUrl) onSelect?.(selectedUrl);
    onClose?.();
  };

  return (
    <Modal
      title="Select furniture"
      open={open}
      onOk={confirm}
      onCancel={onClose}
      okText="Add to scene"
      width={820}
    >
      <Space style={{ marginBottom: 12 }}>
        <Input
          placeholder="Filter by name..."
          value={filter}
          onChange={(e)=>setFilter(e.target.value)}
          allowClear
        />
        <Upload customRequest={customUpload} showUploadList={false} accept=".glb,.gltf,.fbx,.obj">
          <Button icon={<UploadOutlined />}>Upload furniture</Button>
        </Upload>
      </Space>

      {loading ? <Spin/> : filtered.length === 0 ? <Empty description="No furniture files"/> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, maxHeight: 440, overflow: 'auto' }}>
          {filtered.map(url => (
            <button
              key={url}
              onClick={() => setSelectedUrl(url)}
              style={{
                border: selectedUrl === url ? '2px solid #1677ff' : '1px solid #ddd',
                borderRadius: 6,
                padding: 6,
                cursor: 'pointer',
                position: 'relative',
                background: '#fff'
              }}
            >
              <div style={{ position:'relative', width:'100%', aspectRatio:'1 / 1', background:'#f5f5f5', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Image src="/icons/furniture.png" preview={false} alt="furniture" style={{ width: 48, height: 48, opacity: 0.7 }} />
              </div>
              {selectedUrl === url && (
                <CheckOutlined style={{ position:'absolute', top:8, right:8, color:'#1677ff', fontSize:18 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default FurniturePickerModal;