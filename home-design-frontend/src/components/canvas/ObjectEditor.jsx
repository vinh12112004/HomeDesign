import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Drawer, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Button, 
  Space,
  Divider,
  Card,
  ColorPicker
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { closeObjectEditor } from '../../store/slices/uiSlice';
import { updateObject } from '../../store/slices/objectSlice';

const { Option } = Select;

const ObjectEditor = () => {
  const dispatch = useDispatch();
  const { showObjectEditor, selectedMesh } = useSelector(state => state.ui);
  const { objects } = useSelector(state => state.objects);
  const { currentProject } = useSelector(state => state.projects);
  
  const [form] = Form.useForm();
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    if (selectedMesh && objects.length > 0) {
      const obj = objects.find(o => o.id === selectedMesh);
      if (obj) {
        setSelectedObject(obj);
        
        // Parse JSON data để hiển thị trong form
        const position = JSON.parse(obj.positionJson);
        const rotation = JSON.parse(obj.rotationJson);
        const scale = JSON.parse(obj.scaleJson);
        const metadata = JSON.parse(obj.metadataJson);
        
        form.setFieldsValue({
          name: metadata.name || `${obj.type} ${obj.id.substring(0, 8)}`,
          type: obj.type,
          position: position,
          rotation: rotation,
          scale: scale,
          color: metadata.color || '#F8F8FF',
          ...metadata
        });
      }
    }
  }, [selectedMesh, objects, form]);

  const handleClose = () => {
    dispatch(closeObjectEditor());
    form.resetFields();
    setSelectedObject(null);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (!selectedObject || !currentProject) return;
      
      // Chuẩn bị dữ liệu update
      const updateData = {
        type: values.type,
        assetKey: selectedObject.assetKey,
        positionJson: JSON.stringify(values.position),
        rotationJson: JSON.stringify(values.rotation),
        scaleJson: JSON.stringify(values.scale),
        metadataJson: JSON.stringify({
          name: values.name,
          geometry: values.geometry,
          width: values.width,
          length: values.length,
          height: values.height,
          sizeX: values.sizeX,
          sizeY: values.sizeY,
          sizeZ: values.sizeZ,
          texture: values.texture,
          color: typeof values.color === "string"
            ? values.color
            : values.color?.toHexString?.() || "#FFFFFF"
        })
      };

      await dispatch(updateObject({
        objectId: selectedObject.id,
        objectData: updateData
      })).unwrap();

      console.log('Object updated successfully');
      handleClose();
    } catch (error) {
      console.error('Failed to update object:', error);
    }
  };

  if (!selectedObject) return null;

  const metadata = JSON.parse(selectedObject.metadataJson);
  const position = JSON.parse(selectedObject.positionJson);
  const rotation = JSON.parse(selectedObject.rotationJson);
  const scale = JSON.parse(selectedObject.scaleJson);

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Edit this element</span>
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={handleClose}
            size="small"
          />
        </div>
      }
      placement="right"
      width={320}
      open={showObjectEditor}
      onClose={handleClose}
      closable={false}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>Save</Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: metadata.name || selectedObject.type,
          type: selectedObject.type,
          position: position,
          rotation: rotation,
          scale: scale,
          color: metadata.color || '#F8F8FF'
        }}
      >
        <div style={{ color: '#888', marginBottom: 16 }}>{selectedObject.type}</div>
        
        <Divider orientation="left">Properties</Divider>
        
        <Form.Item name="name" label="Name">
          <Input placeholder="Object name" />
        </Form.Item>
        
        <Form.Item name="type" label="Type">
          <Select placeholder="Select type">
            <Option value="Wall">Wall</Option>
            <Option value="Floor">Floor</Option>
            <Option value="Ceiling">Ceiling</Option>
            <Option value="Door">Door</Option>
            <Option value="Window">Window</Option>
          </Select>
        </Form.Item>

        <Divider orientation="left">Position</Divider>
        
        <Form.Item label="Position">
          <Space.Compact style={{ display: 'flex' }}>
            <Form.Item name={['position', 'x']} noStyle>
              <InputNumber placeholder="X" style={{ width: '33%' }} step={0.1} />
            </Form.Item>
            <Form.Item name={['position', 'y']} noStyle>
              <InputNumber placeholder="Y" style={{ width: '33%' }} step={0.1} />
            </Form.Item>
            <Form.Item name={['position', 'z']} noStyle>
              <InputNumber placeholder="Z" style={{ width: '34%' }} step={0.1} />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Divider orientation="left">Dimensions</Divider>
        
        {selectedObject.type === 'Floor' && (
          <>
            <Form.Item name="width" label="Width (m)">
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>
            <Form.Item name="length" label="Length (m)">
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>
          </>
        )}
        
        {selectedObject.type === 'Wall' && (
          <>
            <Form.Item name="sizeX" label="Thickness (m)">
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="sizeY" label="Height (m)">
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>
            <Form.Item name="sizeZ" label="Length (m)">
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>
          </>
        )}

        <Divider orientation="left">Rotation</Divider>
        
        <Form.Item label="Rotation (radians)">
          <Space.Compact style={{ display: 'flex' }}>
            <Form.Item name={['rotation', 'x']} noStyle>
              <InputNumber placeholder="X" style={{ width: '33%' }} step={0.1} />
            </Form.Item>
            <Form.Item name={['rotation', 'y']} noStyle>
              <InputNumber placeholder="Y" style={{ width: '33%' }} step={0.1} />
            </Form.Item>
            <Form.Item name={['rotation', 'z']} noStyle>
              <InputNumber placeholder="Z" style={{ width: '34%' }} step={0.1} />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Divider orientation="left">Scale</Divider>
        
        <Form.Item label="Scale">
          <Space.Compact style={{ display: 'flex' }}>
            <Form.Item name={['scale', 'x']} noStyle>
              <InputNumber 
                placeholder="X" 
                style={{ width: '33%' }} 
                step={0.1} 
                min={0.1}
                precision={2}
              />
            </Form.Item>
            <Form.Item name={['scale', 'y']} noStyle>
              <InputNumber 
                placeholder="Y" 
                style={{ width: '33%' }} 
                step={0.1} 
                min={0.1}
                precision={2}
              />
            </Form.Item>
            <Form.Item name={['scale', 'z']} noStyle>
              <InputNumber 
                placeholder="Z" 
                style={{ width: '34%' }} 
                step={0.1} 
                min={0.1}
                precision={2}
              />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Divider orientation="left">Style</Divider>
        
        <Form.Item name="color" label="Color">
          <ColorPicker 
            showText={(color) => color.toHexString()}
            format="hex"
            style={{ width: '100%' }}
            presets={[
              {
                label: 'Common Colors',
                colors: [
                  '#F8F8FF', // Ghost White (default)
                  '#FFFFFF', // White
                  '#F5F5F5', // White Smoke
                  '#E6E6FA', // Lavender
                  '#FFF8DC', // Cornsilk
                  '#F0F8FF', // Alice Blue
                  '#F5FFFA', // Mint Cream
                  '#FFFACD', // Lemon Chiffon
                  '#FFE4E1', // Misty Rose
                  '#F0FFFF', // Azure
                  '#808080', // Gray
                  '#A9A9A9', // Dark Gray
                  '#D3D3D3', // Light Gray
                  '#696969', // Dim Gray
                  '#778899', // Light Slate Gray
                  '#2F4F4F', // Dark Slate Gray
                ]
              }
            ]}
          />
        </Form.Item>
        
        <Form.Item name="texture" label="Texture">
          <Input placeholder="/textures/floor.png" />
        </Form.Item>

        <Divider orientation="left">Technical Details</Divider>
        
        <Form.Item name="geometry" label="Geometry">
          <Select placeholder="Select geometry" disabled>
            <Option value="plane">Plane</Option>
            <Option value="box">Box</Option>
            <Option value="cylinder">Cylinder</Option>
            <Option value="sphere">Sphere</Option>
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ObjectEditor;