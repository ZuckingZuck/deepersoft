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
  TeamOutlined
} from "@ant-design/icons";
import { Button } from "antd";
import api from '../utils/api';

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Önce Redux store'u temizle
      dispatch(userLogout());
      
      // Local storage'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // API'ye çıkış isteği gönder
      await api.post('/api/auth/logout');
      
      // Login sayfasına yönlendir
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      // Hata olsa bile kullanıcıyı çıkış yaptır
      dispatch(userLogout());
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Url değiştiğinde dropdown menüleri kapat
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location]);

  const menuItems = [
    {
      key: 'home',
      label: "Ana Sayfa",
      link: "/",
      icon: <HomeOutlined />
    },
    {
      key: 'projects',
      label: "Proje Yönetimi",
      icon: <ProjectOutlined />,
      dropdown: [
        { key: 'islemde', label: "İşlemde", link: "/projects?status=islemde" },
        { key: 'islah', label: "Islah ve Düzenleme", link: "/projects?status=islah-duzenleme" },
        { key: 'onayda', label: "Onayda", link: "/projects?status=onayda" },
        { key: 'incelendi', label: "İncelendi", link: "/projects?status=incelendi" },
        { key: 'montaj', label: "Montaj Tamam", link: "/projects?status=montaj-tamam" },
        { key: 'tamamlandi', label: "Tamamlandı", link: "/projects?status=tamamlandi" },
        { key: 'beklemede', label: "Beklemede", link: "/projects?status=beklemede" },
        { key: 'arsivde', label: "Arşivde", link: "/projects?status=arsivde" }
      ]
    },
    {
      key: 'stock',
      label: "Stok Yönetimi",
      icon: <InboxOutlined />,
      dropdown: [
        { key: 'transfer', label: "Transfer", link: "/stok/transfer" },
        { key: 'movements', label: "Stok Hareketleri", link: "/stok/hareketler" },
        { key: 'status', label: "Stok Durumu", link: "/stok/durum" }
      ]
    },
    {
      key: 'poz',
      label: "Poz Yönetimi",
      icon: <AppstoreOutlined />,
      dropdown: [
        { key: 'list', label: "Pozlar", link: "/poz/liste" },
        { key: 'import', label: "Fiyatları İçeri Aktar", link: "/poz/import" },
        { key: 'export', label: "Fiyatları Dışarı Aktar", link: "/poz/export" }
      ]
    },
    {
      key: 'reports',
      label: "Raporlar",
      icon: <ProjectOutlined />,
      link: "/raporlar"
    },
    {
      key: 'definitions',
      label: "Tanımlamalar",
      icon: <AppstoreOutlined />,
      dropdown: [
        { key: 'cards', label: "Poz Kartları", link: "/tanimlamalar/poz-kartlari" },
        { key: 'types', label: "Poz Tipleri", link: "/tanimlamalar/poz-tipleri" },
        { key: 'units', label: "Poz Birimleri", link: "/tanimlamalar/poz-birimleri" },
        { key: 'groups', label: "Öbekler", link: "/tanimlamalar/obekler" }
      ]
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
      dropdown: [
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: 'Kullanıcı Listesi',
          link: '/ayarlar/kullanıcılar'
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Çıkış Yap',
          onClick: handleLogout
        }
      ]
    }
  ];

  // Kullanıcı girişi yoksa Navbar'ı gösterme
  if (!user) return null;

  // Kullanıcı yetkisine göre menü öğelerini belirle
  const isAdmin = user.userType === 'Sistem Yetkilisi' || user.userType === 'Supervisor';
  
  const filteredMenuItems = isAdmin ? menuItems : menuItems.filter(item => 
    item.key === 'home' || item.key === 'projects'
  );

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md">
      {/* Mobil hamburger menü */}
      <div className="md:hidden flex justify-between items-center p-4">
        <div className="font-bold text-xl">RMODEL TRACKING</div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white focus:outline-none"
        >
          {mobileMenuOpen ? <CloseOutlined className="text-xl" /> : <MenuOutlined className="text-xl" />}
        </button>
      </div>

      {/* Mobil menü */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} border-t border-gray-700`}>
        <ul className="space-y-2 pb-3 pt-2">
          {filteredMenuItems.map((item, index) => (
            <li key={index} className="px-4">
              {item.dropdown ? (
                <div>
                  <button
                    className="w-full flex items-center justify-between py-2 hover:bg-gray-800 rounded px-3 transition-colors duration-200"
                    onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                  >
                    <span className="flex items-center">
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </span>
                    <DownOutlined className={`transition-transform duration-200 ${openDropdown === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === index && (
                    <ul className="ml-6 mt-1 space-y-1 border-l-2 border-gray-600 pl-4">
                      {item.dropdown.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          {subItem.onClick ? (
                            <button
                              onClick={subItem.onClick}
                              className="w-full text-left py-1.5 hover:text-gray-200 text-white"
                            >
                              {subItem.label}
                            </button>
                          ) : (
                            <NavLink
                              to={subItem.link}
                              className={({ isActive }) =>
                                `block py-1.5 hover:text-gray-200 ${isActive ? "text-gray-200 font-medium" : "text-white"}`
                              }
                            >
                              {subItem.label}
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
                    `flex items-center py-2 hover:bg-gray-800 rounded px-3 transition-colors duration-200 ${isActive ? "bg-gray-700" : ""}`
                  }
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
          <li className="px-4 mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <UserOutlined className="mr-2" />
                <span className="font-medium">{user.fullName}</span>
              </div>
              <button 
                className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded flex items-center transition-colors"
                onClick={handleLogout}
              >
                <LogoutOutlined className="mr-1" />
                Çıkış
              </button>
            </div>
          </li>
        </ul>
      </div>

      {/* Masaüstü menü */}
      <div className="hidden md:flex justify-between items-center px-6 py-3">
        <div className="flex items-center space-x-1">
          <div className="font-bold text-xl mr-6">RMODEL TRACKING</div>
          <ul className="flex space-x-1">
            {filteredMenuItems.map((item, index) => (
              <li key={index} className="relative">
                {item.dropdown ? (
                  <button
                    className={`flex items-center space-x-1 hover:bg-gray-800 px-3 py-2 rounded transition-colors ${openDropdown === index ? 'bg-gray-700' : ''}`}
                    onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                    <DownOutlined className={`transition-transform duration-200 ${openDropdown === index ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <NavLink
                    to={item.link}
                    className={({ isActive }) =>
                      `flex items-center space-x-1 hover:bg-gray-800 px-3 py-2 rounded transition-colors ${isActive ? "bg-gray-700" : ""}`
                    }
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </NavLink>
                )}
                {item.dropdown && openDropdown === index && (
                  <ul className="absolute left-0 mt-1 w-56 bg-gray-800 text-gray-100 shadow-lg rounded-md overflow-hidden z-10 border border-gray-700">
                    {item.dropdown.map((subItem, subIndex) => (
                      <li key={subIndex} className="border-b border-gray-700 last:border-none">
                        {subItem.onClick ? (
                          <button
                            onClick={subItem.onClick}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition-colors text-white"
                          >
                            {subItem.label}
                          </button>
                        ) : (
                          <NavLink
                            to={subItem.link}
                            className={({ isActive }) =>
                              `block px-4 py-2.5 hover:bg-gray-700 transition-colors ${isActive ? "bg-gray-700 font-semibold text-white" : ""}`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <UserOutlined className="text-gray-300 mr-2" />
            <span 
              className="text-white hover:text-gray-200 cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              {user.fullName}
            </span>
          </div>
          <Button type="link" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </div>
      </div>
    </nav>
  );
}