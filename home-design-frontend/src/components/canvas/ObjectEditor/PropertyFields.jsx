import React from "react";
import { Form, Input, Select } from "antd";

const { Option } = Select;

const PropertyFields = () => (
    <>
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
    </>
);

export default PropertyFields;
