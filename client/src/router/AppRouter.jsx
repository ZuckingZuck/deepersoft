import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Projects from "../pages/Projects";
import NotFound from "../pages/NotFound";
import { useSelector } from "react-redux";

const AppRouter = () => {
    //const admin = useSelector((state) => state.admin.admin)
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />
      <Route path="/projects" element={<Projects />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
