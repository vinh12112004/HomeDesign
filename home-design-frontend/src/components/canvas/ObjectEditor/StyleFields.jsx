import React from "react";
import { Form, ColorPicker, Divider } from "antd";
import TexturePicker from "./TexturePicker";

const StyleFields = () => (
    <>
        <Divider orientation="left">Style</Divider>
        <Form.Item name="color" label="Color">
            <ColorPicker
                showText={(color) => color.toHexString()}
                format="hex"
                style={{ width: "100%" }}
            />
        </Form.Item>
        <Form.Item name="texture" label="Texture">
            <TexturePicker />
        </Form.Item>
    </>
);

export default StyleFields;
