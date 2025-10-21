import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Upload, Image, Spin, Empty, Space, Switch } from 'antd';
import { PlusOutlined, UploadOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTextures, uploadTexture } from '../../store/slices/textureSlice';

const TexturePicker = ({ value, onChange }) => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.texture);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(value || '');
  const [enabled, setEnabled] = useState(!!value);

  useEffect(() => {
    if (open && items.length === 0) dispatch(fetchTextures());
  }, [open, items.length, dispatch]);

  useEffect(() => {
    setSelectedUrl(value || '');
    setEnabled(!!value);
  }, [value]);

  const filtered = items.filter(url =>
    !filter || url.toLowerCase().includes(filter.toLowerCase())
  );

  const handleConfirm = () => {
    onChange?.(enabled ? selectedUrl : '');
    setOpen(false);
  };

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const url = await dispatch(uploadTexture(file)).unwrap();
      setSelectedUrl(url);
      onSuccess?.(url);
    } catch (e) {
      onError?.(e);
    }
  };

  const nameFromUrl = (url) => {
    try { return decodeURIComponent(url.split('/').pop() || url); } catch { return url; }
  };

  return (
    <div>
      <Space>
        {enabled && value ? (
          <Image width={64} height={64} src={value} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 64, height: 64, background: '#eee' }} />
        )}

        <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          Select texture
        </Button>

        <Switch
          checked={enabled}
          onChange={(checked) => {
                setEnabled(checked);
                if (!checked) {
                onChange?.('');
                setSelectedUrl('');
                }
            }}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      </Space>

      <Modal
        title="Select a texture"
        open={open}
        onOk={handleConfirm}
        okText="Use this texture"
        onCancel={() => setOpen(false)}
        width={760}
      >
        <Space style={{ marginBottom: 12 }}>
          <Input
            placeholder="Filter by name..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            allowClear
          />
          <Upload customRequest={customUpload} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />}>Upload texture</Button>
          </Upload>
        </Space>

        {loading ? (
          <Spin />
        ) : filtered.length === 0 ? (
          <Empty description="No textures" />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 12,
              maxHeight: 420,
              overflow: 'auto',
            }}
          >
            {filtered.map(url => (
              <button
                key={url}
                onClick={() => setSelectedUrl(url)}
                style={{
                  border: selectedUrl === url ? '2px solid #1677ff' : '1px solid #ddd',
                  borderRadius: 6,
                  padding: 4,
                  cursor: 'pointer',
                  position: 'relative',
                  background: '#fff',
                }}
              >
                <Image
                  src={url}
                  alt={nameFromUrl(url)}
                  width="100%"
                  height={100}
                  style={{ objectFit: 'cover' }}
                  preview={true}
                />
                {selectedUrl === url && (
                  <CheckOutlined
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
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
    </div>
  );
};

export default TexturePicker;
