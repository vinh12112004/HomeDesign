import React from "react";
import { Form, InputNumber, Space, Divider } from "antd";

const Vector3Input = ({ name, step = 0.1, precision }) => (
    <Form.Item label={name.charAt(0).toUpperCase() + name.slice(1)}>
        <Space.Compact style={{ display: "flex" }}>
            <Form.Item name={[name, "x"]} noStyle>
                <InputNumber
                    placeholder="X"
                    style={{ width: "33%" }}
                    step={step}
                    precision={precision}
                />
            </Form.Item>
            <Form.Item name={[name, "y"]} noStyle>
                <InputNumber
                    placeholder="Y"
                    style={{ width: "33%" }}
                    step={step}
                    precision={precision}
                />
            </Form.Item>
            <Form.Item name={[name, "z"]} noStyle>
                <InputNumber
                    placeholder="Z"
                    style={{ width: "34%" }}
                    step={step}
                    precision={precision}
                />
            </Form.Item>
        </Space.Compact>
    </Form.Item>
);

const TransformFields = () => (
    <>
        <Divider orientation="left">Transform</Divider>
        <Vector3Input name="position" step={0.1} />
        <Vector3Input name="rotation" step={0.1} />
        <Vector3Input name="scale" step={0.001} precision={3} />
    </>
);

export default TransformFields;
