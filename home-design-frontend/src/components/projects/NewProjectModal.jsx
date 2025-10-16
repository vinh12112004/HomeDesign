import React from "react";
import { Modal, Form, Input, InputNumber, Radio, Row, Col } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../../store/slices/projectSlice';

const NewProjectModal = ({ visible, onCancel }) => {
  const dispatch = useDispatch();
  const { isCreating } = useSelector(state => state.projects);
  const [form] = Form.useForm();

  const handleCreate = async (values) => {
    try {
      await dispatch(createProject(values)).unwrap();
      form.resetFields();
      onCancel(); // Close modal on success
    } catch (error) {
      console.error('Failed to create project:', error);
      // Error message được handle ở AllProjectsPage
    }
  };

  return (
    <Modal
      open={visible}
      title="Create a New Project"
      okText="Create"
      cancelText="Cancel"
      onCancel={onCancel}
      confirmLoading={isCreating}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            handleCreate(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ status: "private" }}
      >
        <Form.Item
          name="name"
          label="Project Name"
          rules={[
            {
              required: true,
              message: "Please input the name of the project!",
            },
          ]}
        >
          <Input placeholder="Enter project name" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="width"
              label="Width (m)"
              rules={[{ required: true, message: "Please input the width!" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="length"
              label="Length (m)"
              rules={[{ required: true, message: "Please input the length!" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="height"
              label="Height (m)"
              rules={[{ required: true, message: "Please input the height!" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="status" label="Status">
          <Radio.Group>
            <Radio value="private">Private</Radio>
            <Radio value="public">Public (only view)</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewProjectModal;