import { useState } from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "AnaSayfa", link: "/" },
  {
    label: "Proje Yönetimi",
    dropdown: ["İşlemde", "Islah ve Düzenleme", "Onayda", "İncelendi", "Montaj Tamam", "Tamamlandı", "Beklemede", "Arşivde"],
  },
  {
    label: "Stok Yönetimi",
    dropdown: ["İade", "Depo Giriş", "Transfer", "Stok Hareketleri", "Stok Durumu"],
  },
  {
    label: "Poz Yönetimi",
    dropdown: ["Pozlar", "Fiyatları İçeri Aktar", "Fiyatları Dışarı Aktar"],
  },
  {
    label: "Tanımlamalar",
    dropdown: ["Poz Kartları", "Poz Tipleri", "Poz Birimleri", "Öbekler"],
  },
  {
    label: "Ayarlar",
    dropdown: ["Kullanıcı Listesi", "Parola Değiştir"],
  },
];

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <ul className="flex space-x-6">
        {menuItems.map((item, index) => (
          <li key={index} className="relative">
            {item.dropdown ? (
              <button
                className="hover:bg-gray-700 px-3 py-2 rounded"
                onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
              >
                {item.label}
              </button>
            ) : (
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `hover:bg-gray-700 px-3 py-2 rounded ${isActive ? "bg-gray-700" : ""}`
                }
              >
                {item.label}
              </NavLink>
            )}
            {item.dropdown && openDropdown === index && (
              <ul className="absolute left-0 mt-2 w-48 bg-gray-700 text-white shadow-lg rounded-md overflow-hidden">
                {item.dropdown.map((subItem, subIndex) => (
                  <li key={subIndex}>
                    <NavLink
                      to={`/${subItem.replace(/ /g, "-").toLowerCase()}`}
                      className={({ isActive }) =>
                        `block px-4 py-2 hover:bg-gray-600 ${isActive ? "bg-gray-600" : ""}`
                      }
                    >
                      {subItem}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center space-x-4">
        <span className="font-semibold">Kullanıcı Adı Soyadı</span>
        <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">Oturumu Kapat</button>
      </div>
    </nav>
  );
}