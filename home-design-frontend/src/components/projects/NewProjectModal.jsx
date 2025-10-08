import React from "react";
import { Modal, Form, Input, InputNumber, Radio, Row, Col } from "antd";

const NewProjectModal = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      open={visible}
      title="Create a New Project"
      okText="Create"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
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
        initialValues={{ status: "private" }} // Mặc định status là private
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