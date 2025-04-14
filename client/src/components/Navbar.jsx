import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "../redux/userSlice";
import {
  HomeOutlined,
  ProjectOutlined,
  InboxOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  CloseOutlined,
  DownOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import api from "../utils/api";

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      dispatch(userLogout());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      await api.post("/api/auth/logout");
      navigate("/login");
    } catch {
      dispatch(userLogout());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  if (!user) return null;

  const isAdmin =
    user.userType === "Sistem Yetkilisi" || user.userType === "Supervisor";

  const menuItems = [
    {
      key: "home",
      label: "Ana Sayfa",
      link: "/",
      icon: <HomeOutlined />,
    },
    {
      key: "projects",
      label: "Proje Yönetimi",
      icon: <ProjectOutlined />,
      dropdown: [
        { key: "islemde", label: "İşlemde", link: "/projects?status=islemde" },
        { key: "islah", label: "Islah ve Düzenleme", link: "/projects?status=islah-duzenleme" },
        { key: "onayda", label: "Onayda", link: "/projects?status=onayda" },
        { key: "incelendi", label: "İncelendi", link: "/projects?status=incelendi" },
        { key: "montaj", label: "Montaj Tamam", link: "/projects?status=montaj-tamam" },
        { key: "tamamlandi", label: "Tamamlandı", link: "/projects?status=tamamlandi" },
        { key: "beklemede", label: "Beklemede", link: "/projects?status=beklemede" },
        { key: "arsivde", label: "Arşivde", link: "/projects?status=arsivde" },
      ],
    },
    {
      key: "stock",
      label: "Stok Yönetimi",
      icon: <InboxOutlined />,
      dropdown: [
        { key: "transfer", label: "Transfer", link: "/stok/transfer" },
        { key: "movements", label: "Stok Hareketleri", link: "/stok/hareketler" },
        { key: "status", label: "Stok Durumu", link: "/stok/durum" },
      ],
    },
    {
      key: "poz",
      label: "Poz Yönetimi",
      icon: <AppstoreOutlined />,
      link: "/poz/liste"
    },
    {
      key: "reports",
      label: "Raporlar",
      icon: <ProjectOutlined />,
      link: "/raporlar",
    },
    {
      key: "definitions",
      label: "Tanımlamalar",
      icon: <AppstoreOutlined />,
      dropdown: [
        { key: "cards", label: "Poz Kartları", link: "/tanimlamalar/poz-kartlari" },
        { key: "types", label: "Poz Tipleri", link: "/tanimlamalar/poz-tipleri" },
        { key: "units", label: "Poz Birimleri", link: "/tanimlamalar/poz-birimleri" },
        { key: "groups", label: "Öbekler", link: "/tanimlamalar/obekler" },
      ],
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Ayarlar",
      dropdown: [
        {
          key: "users",
          icon: <TeamOutlined />,
          label: "Kullanıcı Listesi",
          link: "/ayarlar/kullanıcılar",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Çıkış Yap",
          onClick: handleLogout,
        },
      ],
    },
  ];

  const filtered = isAdmin
    ? menuItems
    : menuItems.filter((item) => item.key === "home" || item.key === "projects");

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md z-50 relative">
      {/* Mobile */}
      <div className="md:hidden flex justify-between items-center p-4">
        <div className="font-bold text-xl">RMODEL TRACKING</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>
      <div className={`${mobileMenuOpen ? "block" : "hidden"} md:hidden px-4 pb-4`}>
        {filtered.map((item, i) => (
          <div key={i} className="mb-2">
            {item.dropdown ? (
              <div>
                <button
                  onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                  className="flex w-full justify-between items-center py-2 px-3 bg-gray-700 rounded"
                >
                  <span className="flex items-center gap-2">{item.icon}{item.label}</span>
                  <DownOutlined className={`${openDropdown === i && "rotate-180"} transition`} />
                </button>
                {openDropdown === i && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.dropdown.map((sub, j) =>
                      sub.onClick ? (
                        <button
                          key={j}
                          onClick={sub.onClick}
                          className="block w-full text-left py-1 px-2 hover:bg-gray-600 rounded"
                        >
                          {sub.label}
                        </button>
                      ) : (
                        <NavLink
                          key={j}
                          to={sub.link}
                          className="block py-1 px-2 hover:bg-gray-600 rounded"
                        >
                          {sub.label}
                        </NavLink>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.link}
                className="block py-2 px-3 bg-gray-700 rounded hover:bg-gray-600"
              >
                <span className="flex items-center gap-2">{item.icon}{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
        <div className="mt-4 flex items-center justify-between border-t border-gray-600 pt-4">
          <span className="flex items-center gap-2"><UserOutlined /> {user.fullName}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            <LogoutOutlined /> Çıkış
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex justify-between items-center px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="text-xl font-bold">RMODEL TRACKING</div>
          <ul className="flex gap-2">
            {filtered.map((item, i) => (
              <li key={i} className="relative">
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                      className={`flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-700 ${
                        openDropdown === i ? "bg-gray-700" : ""
                      }`}
                    >
                      {item.icon}
                      {item.label}
                      <DownOutlined
                        className={`transition-transform duration-200 ${
                          openDropdown === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === i && (
                      <ul className="absolute top-full mt-1 w-56 bg-gray-800 shadow-lg rounded z-20 border border-gray-700">
                        {item.dropdown.map((sub, j) => (
                          <li key={j}>
                            {sub.onClick ? (
                              <button
                                onClick={sub.onClick}
                                className="w-full text-left px-4 py-2 hover:bg-gray-700"
                              >
                                {sub.label}
                              </button>
                            ) : (
                              <NavLink
                                to={sub.link}
                                className="block px-4 py-2 hover:bg-gray-700"
                              >
                                {sub.label}
                              </NavLink>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.link}
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-700 ${
                        isActive ? "bg-gray-700" : ""
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="flex items-center gap-1 cursor-pointer hover:text-gray-300"
            onClick={() => navigate("/profile")}
          >
            <UserOutlined /> {user.fullName}
          </span>
          <Button type="link" onClick={handleLogout} className="text-white">
            Çıkış Yap
          </Button>
        </div>
      </div>
    </nav>
  );
}
