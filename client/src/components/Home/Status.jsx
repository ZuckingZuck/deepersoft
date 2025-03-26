import React from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, Wrench, Check, Eye, ClipboardCheck, Clock, Archive, User } from 'lucide-react';

const statuses = [
  { name: 'Ekle', path: '/projects?s=ekle', icon: <Plus size={24} /> },
  { name: 'İşlemde', path: '/projects?s=İşlemde', icon: <Wrench size={24} /> },
  { name: 'Onayda', path: '/projects?s=Onayda', icon: <Check size={24} /> },
  { name: 'İncelendi', path: '/projects?s=İncelendi', icon: <Eye size={24} /> },
  { name: 'Montaj Tamam', path: '/projects?s=montaj-tamam', icon: <ClipboardCheck size={24} /> },
  { name: 'Tamamlandı', path: '/projects?s=tamamlandi', icon: <Check size={24} /> },
  { name: 'Islah ve Düzenleme', path: '/projects?s=islah-duzenleme', icon: <User size={24} /> },
  { name: 'Beklemede', path: '/projects?s=beklemede', icon: <Clock size={24} /> },
  { name: 'Arşivde', path: '/projects?s=arsivde', icon: <Archive size={24} /> }
];

const Status = () => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Menu</h2>
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow">
        {statuses.map((status) => (
          <NavLink
            key={status.path}
            to={status.path}
            className="flex flex-col items-center justify-center w-32 h-32 p-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-center"
          >
            <div className="text-gray-600 mb-2">{status.icon}</div>
            <span className="text-sm font-medium text-gray-700">{status.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Status;
