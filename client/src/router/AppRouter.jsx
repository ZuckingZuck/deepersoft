import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Projects from "../pages/Projects";
import ProjectNew from "../pages/ProjectNew";
import ProjectDetail from "../pages/ProjectDetail";
import ProjectEdit from "../pages/ProjectEdit";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import PrivateRoute from "./PrivateRoute";
import { useSelector } from "react-redux";
import axios from "axios";
import api from "../utils/api";
import UserProfile from '../pages/UserProfile';
import UserList from '../pages/UserList';
import UserDetail from '../pages/UserDetail';
import StockStatus from '../pages/StockStatus';
import StockMovements from '../pages/StockMovements';
import StockTransfer from '../pages/StockTransfer';
import PozList from '../pages/PozList';
import Reports from '../pages/Reports';
import SearchResults from "../pages/SearchResults";

const AppRouter = () => {
  const user = useSelector((state) => state.user.user);
  return (
    <Routes>
      {/* Genel Rotalar */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="*" element={<NotFound />} />

      {/* Korumalı Rotalar */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/search" element={<SearchResults />} />
        <Route path="/projects/new" element={<ProjectNew />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/edit" element={<ProjectEdit />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:id" element={<UserDetail />} />
        <Route path="/ayarlar/kullanıcılar" element={<UserList />} />
        <Route path="/stok/durum" element={<StockStatus />} />
        <Route path="/stok/hareketler" element={<StockMovements />} />
        <Route path="/stok/transfer" element={<StockTransfer />} />
        <Route path="/poz/liste" element={<PozList />} />
        <Route path="/raporlar" element={<Reports />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
