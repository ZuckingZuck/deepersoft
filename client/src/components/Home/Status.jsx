import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  PlusOutlined, 
  ToolOutlined, 
  CheckCircleOutlined, 
  EyeOutlined, 
  CheckSquareOutlined, 
  ClockCircleOutlined, 
  InboxOutlined,
  PauseCircleOutlined,
  FileDoneOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Badge, Typography, Spin } from 'antd';
import api from '../../utils/api';

const { Text } = Typography;

const statusConfig = [
  { 
    name: 'Yeni Proje', 
    path: '/projects/new', 
    icon: <PlusOutlined />, 
    bgColor: 'bg-blue-100', 
    iconColor: 'text-blue-600',
    count: 0,
    status: null,
    urlParam: null
  },
  { 
    name: 'İşlemde', 
    path: '/projects?status=islemde', 
    icon: <ToolOutlined />, 
    bgColor: 'bg-orange-100', 
    iconColor: 'text-orange-600',
    count: 0,
    status: "İşlemde",
    urlParam: "islemde"
  },
  { 
    name: 'Onayda', 
    path: '/projects?status=onayda', 
    icon: <CheckCircleOutlined />, 
    bgColor: 'bg-green-100', 
    iconColor: 'text-green-600',
    count: 0,
    status: "Onayda",
    urlParam: "onayda"
  },
  { 
    name: 'İncelendi', 
    path: '/projects?status=incelendi', 
    icon: <EyeOutlined />, 
    bgColor: 'bg-purple-100', 
    iconColor: 'text-purple-600',
    count: 0,
    status: "İncelendi",
    urlParam: "incelendi"
  },
  { 
    name: 'Montaj Tamam', 
    path: '/projects?status=montaj-tamam', 
    icon: <CheckSquareOutlined />, 
    bgColor: 'bg-cyan-100', 
    iconColor: 'text-cyan-600',
    count: 0,
    status: "Montaj Tamam",
    urlParam: "montaj-tamam"
  },
  { 
    name: 'Tamamlandı', 
    path: '/projects?status=tamamlandi', 
    icon: <FileDoneOutlined />, 
    bgColor: 'bg-green-100', 
    iconColor: 'text-green-600',
    count: 0,
    status: "Tamamlandı",
    urlParam: "tamamlandi"
  },
  { 
    name: 'Islah ve Düzenleme', 
    path: '/projects?status=islah-duzenleme', 
    icon: <InboxOutlined />, 
    bgColor: 'bg-amber-100', 
    iconColor: 'text-amber-600',
    count: 0,
    status: "Islah ve Düzenleme",
    urlParam: "islah-duzenleme"
  },
  { 
    name: 'Beklemede', 
    path: '/projects?status=beklemede', 
    icon: <PauseCircleOutlined />, 
    bgColor: 'bg-gray-100', 
    iconColor: 'text-gray-600',
    count: 0,
    status: "Beklemede",
    urlParam: "beklemede"
  },
  { 
    name: 'Arşivde', 
    path: '/projects?status=arsivde', 
    icon: <ClockCircleOutlined />, 
    bgColor: 'bg-gray-100', 
    iconColor: 'text-gray-500',
    count: 0,
    status: "Arşivde",
    urlParam: "arsivde"
  }
];

const Status = () => {
  const [statuses, setStatuses] = useState(statusConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectCounts = async () => {
      setLoading(true);
      try {
        // Tüm projeleri çekelim
        const response = await api.get('/api/project');
        const projects = response.data;
        
        // Her durum için sayıları hesaplayalım
        const updatedStatuses = statuses.map(status => {
          if (status.status) {
            const count = projects.filter(project => project.status === status.status).length;
            return { ...status, count };
          }
          return status;
        });
        
        setStatuses(updatedStatuses);
      } catch (error) {
        console.error('Proje sayıları yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectCounts();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statuses.map((status) => (
            <div className="status-card-wrapper h-full" key={status.path}>
              <NavLink to={status.path} className="block h-full">
                <Badge 
                  count={status.count} 
                  overflowCount={99} 
                  offset={[-10, -10]}
                >
                  <div className={`flex flex-col items-center justify-center p-4 ${status.bgColor} rounded-lg hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200 h-full aspect-[4/3]`}>
                    <div className={`text-3xl ${status.iconColor} mb-3`}>
                      {status.icon}
                    </div>
                    <Text strong className="text-center text-gray-800 line-clamp-1 w-full">
                      {status.name}
                    </Text>
                  </div>
                </Badge>
              </NavLink>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .status-card-wrapper {
          display: block;
          height: 120px;
        }
        
        .status-card-wrapper .ant-badge {
          display: block;
          height: 100%;
          width: 100%;
        }
        
        .status-card-wrapper .ant-badge-count {
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default Status;
