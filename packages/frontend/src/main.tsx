import React from "react";
import { Amplify } from "aws-amplify";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import config from "./config.ts";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

Amplify.configure({
  API: {
    endpoints: [
      {
        name: "notes",
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
      },
    ],
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
