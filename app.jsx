import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";

function Placeholder({ title }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080c1c",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <h1>{title}</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* New Plan */}
        <Route
          path="/new-plan"
          element={<Placeholder title="New Plan" />}
        />

        {/* My Plans */}
        <Route
          path="/plans"
          element={<Placeholder title="My Plans" />}
        />

        <Route
          path="/plans/:id"
          element={<Placeholder title="Plan Details" />}
        />

        {/* Bucket List */}
        <Route
          path="/bucket-list"
          element={<Placeholder title="Bucket List" />}
        />

        {/* Destination */}
        <Route
          path="/destination/:id"
          element={<Placeholder title="Destination Viewing" />}
        />

        {/* Journal */}
        <Route
          path="/journal"
          element={<Placeholder title="Journal" />}
        />

        <Route
          path="/journal/:id"
          element={<Placeholder title="Journal Entry" />}
        />

        {/* Activity */}
        <Route
          path="/activity"
          element={<Placeholder title="Activity History" />}
        />

        {/* Explore */}
        <Route
          path="/explore"
          element={<Placeholder title="Explore" />}
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={<Placeholder title="Profile" />}
        />

        {/* Default */}
        <Route
          path="*"
          element={<Dashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;