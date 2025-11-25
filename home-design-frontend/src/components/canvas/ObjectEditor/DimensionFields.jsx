import React from "react";
import { Form, InputNumber, Divider } from "antd";

const DimensionFields = ({ objectType }) => {
    if (objectType !== "Wall" && objectType !== "Floor") return null;

    return (
        <>
            <Divider orientation="left">Dimensions</Divider>
            {objectType === "Floor" && (
                <>
                    <Form.Item name="width" label="Width (m)">
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            step={0.1}
                        />
                    </Form.Item>
                    <Form.Item name="length" label="Length (m)">
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            step={0.1}
                        />
                    </Form.Item>
                </>
            )}
            {objectType === "Wall" && (
                <>
                    <Form.Item name="sizeX" label="Thickness (m)">
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            step={0.01}
                        />
                    </Form.Item>
                    <Form.Item name="sizeY" label="Height (m)">
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            step={0.1}
                        />
                    </Form.Item>
                    <Form.Item name="sizeZ" label="Length (m)">
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            step={0.1}
                        />
                    </Form.Item>
                </>
            )}
        </>
    );
};

export default DimensionFields;
