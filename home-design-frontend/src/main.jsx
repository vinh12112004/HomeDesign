import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App.jsx";
import { App as AntdApp } from "antd";
import "antd/dist/reset.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <AntdApp>
                <App />
            </AntdApp>
        </Provider>
    </React.StrictMode>
);
