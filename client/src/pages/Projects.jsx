import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Table, 
  Tooltip, 
  Button, 
  message, 
  Tag, 
  Card, 
  Space, 
  Tabs, 
  Badge, 
  Avatar, 
  Typography,
  Spin
} from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  PlusOutlined, 
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ProjectOutlined
} from "@ant-design/icons";
import api from "../utils/api";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const calculateElapsedTime = (createdAt) => {
  const startDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now - startDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Gün olarak hesapla

  if (diffInDays === 0) return "Bugün";
  if (diffInDays === 1) return "Dün";
  return `${diffInDays} gün`;
};

// Status URL parametrelerini veritabanı değerleriyle eşleştiren obje
const statusMapping = {
  'islemde': 'İşlemde',
  'onayda': 'Onayda',
  'incelendi': 'İncelendi',
  'montaj-tamam': 'Montaj Tamam',
  'tamamlandi': 'Tamamlandı',
  'islah-duzenleme': 'Islah ve Düzenleme',
  'beklemede': 'Beklemede',
  'arsivde': 'Arşivde'
};

// Durum renk ve ikonları
const statusConfig = {
  'İşlemde': { color: 'blue', icon: <ClockCircleOutlined /> },
  'Onayda': { color: 'cyan', icon: <ClockCircleOutlined /> },
  'İncelendi': { color: 'purple', icon: <CheckCircleOutlined /> },
  'Montaj Tamam': { color: 'geekblue', icon: <CheckCircleOutlined /> },
  'Tamamlandı': { color: 'green', icon: <CheckCircleOutlined /> },
  'Islah ve Düzenleme': { color: 'orange', icon: <ClockCircleOutlined /> },
  'Beklemede': { color: 'gold', icon: <ClockCircleOutlined /> },
  'Arşivde': { color: 'gray', icon: <CheckCircleOutlined /> }
};

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || "islemde"; // Varsayılan olarak "islemde" projeleri göster
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  // Yetki kontrolü
  const canCreateProject = user && (user.userType === 'Sistem Yetkilisi' || user.userType === 'Supervisor');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // URL parametresini veritabanı formatına dönüştür
        const dbStatus = statusMapping[statusParam] || 'İşlemde';
        
        // API çağrısını yap - populate parametresi ekleyerek
        const response = await api.get(`/api/project?populate=true`);
        
        // Filtrelemeyi istemci tarafında yapalım
        const filteredProjects = response.data.filter(project => project.status === dbStatus);

        const updatedProjects = filteredProjects.map((project) => ({
          ...project,
          elapsedTime: calculateElapsedTime(project.createdAt),
          key: project._id,
        }));

        setProjects(updatedProjects);
        console.log("Gelen projeler:", response.data); // Veriyi kontrol et
      } catch (error) {
        console.error("Projeler yüklenirken hata oluştu:", error);
        message.error("Projeler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [statusParam]);

  // Tab değiştiğinde URL parametresini güncelle
  const handleTabChange = (key) => {
    setSearchParams({ status: key });
  };

  // Başlık için görünen durum metnini belirle
  const getDisplayStatus = () => {
    return statusMapping[statusParam] || 'İşlemde';
  };

  // Durum için renk ve ikon ata
  const getStatusTag = (status) => {
    const config = statusConfig[status] || { color: 'default', icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {status}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Proje Bilgileri",
      key: "projectInfo",
      width: 280,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            <div className="flex items-center mb-1">
              <span className="font-semibold mr-2">DDO:</span> {record.ddo}
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Tellcordia:</span> {record.tellcordiaNo}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Konum",
      key: "location",
      width: 180,
      render: (_, record) => (
        <div>
          <div className="flex items-center mb-1">
            <EnvironmentOutlined className="mr-1 text-blue-500" /> 
            <span>{record.city}</span>
          </div>
          <div className="text-xs text-gray-500">
            <div className="mb-1"><span className="font-semibold">Öbek:</span> {record.clusterName}</div>
            <div><span className="font-semibold">Saha:</span> {record.fieldName} ({record.fieldType})</div>
          </div>
        </div>
      ),
    },
    {
      title: "Sorumlular",
      key: "responsibles",
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div className="flex items-center">
            <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500 mr-2" />
            <div>
              <div className="text-xs font-semibold">Supervisor</div>
              <div>{record.supervisor && record.supervisor.fullName ? record.supervisor.fullName : "Atanmamış"}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Avatar size="small" icon={<TeamOutlined />} className="bg-green-500 mr-2" />
            <div>
              <div className="text-xs font-semibold">Taşeron</div>
              <div>{record.contractor && record.contractor.fullName ? record.contractor.fullName : "Atanmamış"}</div>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Tarihler",
      key: "dates",
      width: 150,
      render: (_, record) => (
        <div>
          <div className="flex items-center mb-2">
            <ClockCircleOutlined className="mr-2 text-blue-500" />
            <div>
              <div className="text-xs">Başlangıç</div>
              <div>{new Date(record.createdAt).toLocaleDateString("tr-TR")}</div>
            </div>
          </div>
          <Tag color="blue">{record.elapsedTime}</Tag>
        </div>
      ),
    },
    {
      title: "İşlemler",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => navigate(`/projects/${record._id}`)}
          size="middle"
          className="bg-blue-500 hover:bg-blue-600"
        >
          Detay
        </Button>
      ),
    },
  ];

  // Durumları tab olarak göster
  const statusTabs = Object.entries(statusMapping).map(([key, value]) => {
    const config = statusConfig[value] || {};
    return (
      <TabPane 
        tab={
          <span>
            {config.icon} {value}
          </span>
        } 
        key={key}
      />
    );
  });

  return (
    <div className="p-6">
      <Card className="shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <ProjectOutlined className="text-2xl mr-3 text-blue-600" />
            <Title level={2} className="m-0">Projeler</Title>
          </div>
          {canCreateProject && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => navigate('/projects/new')}
              size="large"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Yeni Proje Ekle
            </Button>
          )}
        </div>

        <Tabs 
          activeKey={statusParam} 
          onChange={handleTabChange}
          type="card"
          className="mb-4"
        >
          {statusTabs}
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" tip="Projeler yükleniyor..." />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <Text type="secondary">Bu durumda herhangi bir proje bulunamadı.</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="_id"
            bordered={false}
            loading={loading}
            pagination={{ 
              pageSize: 10, 
              position: ["bottomCenter"],
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} proje`
            }}
            size="middle"
            scroll={{ x: 1100 }}
            rowClassName="hover:bg-blue-50 transition-colors"
          />
        )}
      </Card>
    </div>
  );
};

export default Projects;
