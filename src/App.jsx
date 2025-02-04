import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AbsolutePositionUI from "./components/AbsolutePositionUI";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AbsolutePositionUI/>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
