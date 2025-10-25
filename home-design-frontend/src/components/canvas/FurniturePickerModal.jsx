import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Upload, Input, Image, Space, Spin, Empty, message } from 'antd';
import { UploadOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssets, uploadFurnitureModel } from '../../store/slices/assetSlice';

const FurniturePickerModal = ({ open, onClose, onSelect }) => {
  const dispatch = useDispatch();
  const items = useSelector(s => s.assets.items.furniture);
  const loading = useSelector(s => s.assets.loading.furniture);
  const [filter, setFilter] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);

  // State cho các file upload
  const [files, setFiles] = useState({
    obj: null,
    mtl: null,
    texture: null,
  });
  const [nameModel, setNameModel] = useState('');

  useEffect(() => {
    if (open && items.length === 0) {
      dispatch(fetchAssets({ type: 'furniture' }));
    }
  }, [open, items.length, dispatch]);

  const filtered = useMemo(
    () => items.filter(model => 
      model.nameModel.toLowerCase().includes(filter.toLowerCase())
    ),
    [items, filter]
  );

  const beforeUpload = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['obj', 'mtl', 'jpg', 'jpeg', 'png'].includes(ext)) {
      message.error('Chỉ chấp nhận file .obj, .mtl, .jpg, .png');
      return Upload.LIST_IGNORE;
    }

    setFiles((prev) => ({
      ...prev,
      [ext === 'obj'
        ? 'obj'
        : ext === 'mtl'
        ? 'mtl'
        : 'texture']: file,
    }));

    return false;
  };

  const handleUploadAll = async () => {
    const { obj, mtl, texture } = files;
    
    if (!nameModel.trim()) {
      message.warning('Vui lòng nhập tên model');
      return;
    }
    
    if (!obj || !mtl || !texture) {
      message.warning('Vui lòng chọn đủ 3 file: .obj, .mtl và .jpg/.png');
      return;
    }

    try {
      const result = await dispatch(uploadFurnitureModel({
        objFile: obj,
        mtlFile: mtl,
        textureFile: texture,
        nameModel: nameModel.trim(),
      })).unwrap();

      message.success('Upload thành công!');
      
      // Reset form
      setFiles({ obj: null, mtl: null, texture: null });
      setNameModel('');
      
      // Refresh list
      dispatch(fetchAssets({ type: 'furniture' }));
    } catch (e) {
      console.error(e);
      message.error('Upload thất bại, vui lòng thử lại.');
    }
  };

  const confirm = () => {
    if (selectedModel) {
      onSelect?.(JSON.stringify(selectedModel));
    }
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
      <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }}>
        <Input
          placeholder="Filter by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          allowClear
        />

        <Space wrap>
          <Input
            placeholder="Nhập tên model (vd: Chair01)"
            value={nameModel}
            onChange={(e) => setNameModel(e.target.value)}
            style={{ width: 200 }}
          />

          <Upload
            beforeUpload={beforeUpload}
            showUploadList={{
              showRemoveIcon: true,
              showPreviewIcon: false,
            }}
            multiple
          >
            <Button icon={<UploadOutlined />}>Chọn .obj / .mtl / .jpg</Button>
          </Upload>

          <Button type="primary" onClick={handleUploadAll}>
            Upload tất cả
          </Button>
        </Space>
      </Space>

      {loading ? (
        <Spin />
      ) : filtered.length === 0 ? (
        <Empty description="No furniture files" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            maxHeight: 440,
            overflow: 'auto',
          }}
        >
          {filtered.map((model) => (
            <button
              key={model.nameModel}
              onClick={() => setSelectedModel(model)}
              style={{
                border: selectedModel?.nameModel === model.nameModel 
                  ? '2px solid #1677ff' 
                  : '1px solid #ddd',
                borderRadius: 6,
                padding: 6,
                cursor: 'pointer',
                position: 'relative',
                background: '#fff',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  background: '#f5f5f5',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={model.texturePath}
                  preview={false}
                  alt={model.nameModel}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  fallback="/icons/furniture.png"
                />
              </div>
              <div style={{
                marginTop: 4,
                fontSize: 12,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {model.nameModel}
              </div>
              {selectedModel?.nameModel === model.nameModel && (
                <CheckOutlined
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#1677ff',
                    fontSize: 18,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default FurniturePickerModal;