import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Divider, Badge, Skeleton } from 'antd';
import { 
  ProjectOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  InboxOutlined,
  BarChartOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import Status from '../components/Home/Status';

const { Title, Text } = Typography;

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card 
    className="h-full hover:shadow-md transition-shadow" 
    bodyStyle={{ padding: '20px' }}
    bordered={false}
    style={{ borderRadius: '8px' }}
  >
    {loading ? (
      <div className="flex justify-center items-center h-24">
        <Spin />
      </div>
    ) : (
      <>
        <div className="mb-2">
          <Text type="secondary">{title}</Text>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">{value}</span>
          <div 
            className={`flex items-center justify-center w-12 h-12 rounded-full ${color}`}
          >
            {icon}
          </div>
        </div>
      </>
    )}
  </Card>
);

const Home = () => {
  const user = useSelector(state => state.user.user);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    stockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Toplam projeleri çekelim
        const projectsResponse = await api.get('/api/project');
        const completedProjects = projectsResponse.data.filter(p => p.status === "Tamamlandı").length;
        const inProgressProjects = projectsResponse.data.filter(p => p.status === "İşlemde").length;
        
        // Stok sayısını çekebiliriz (mock olarak bırakıyorum, gerçek API uyarlaması yapılabilir)
        const stockCount = 135;

        setStats({
          totalProjects: projectsResponse.data.length,
          completedProjects,
          inProgressProjects,
          stockItems: stockCount
        });
      } catch (error) {
        console.error('İstatistikler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentProjects = async () => {
      setProjectsLoading(true);
      try {
        // En son projeleri çekelim
        const response = await api.get('/api/project');
        // Son 5 projeyi al ve tarih sırasına göre sırala
        const sortedProjects = [...response.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        
        setRecentProjects(sortedProjects);
      } catch (error) {
        console.error('Projeler yüklenirken hata oluştu:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchStats();
    fetchRecentProjects();
  }, []);

  // Günün zamanına göre selamlama metni
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Günaydın';
    if (hours < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Az önce";
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return "Dün";
    return `${Math.floor(diffInHours / 24)} gün önce`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hoş geldin mesajı */}
      <div className="mb-8">
        <Title level={2} className="mb-1 flex items-center">
          <span className="mr-2">{getGreeting()},</span> 
          <span className="text-blue-600">{user?.fullName}</span>
        </Title>
        <Text type="secondary" className="text-lg">
          İşte bugünkü özet:
        </Text>
      </div>

      {/* İstatistik kartları */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="Toplam Projeler" 
            value={stats.totalProjects} 
            icon={<ProjectOutlined style={{ fontSize: 24, color: "white" }} />} 
            color="bg-blue-600 text-white"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="Tamamlanan Projeler" 
            value={stats.completedProjects} 
            icon={<CheckCircleOutlined style={{ fontSize: 24, color: "white" }} />} 
            color="bg-green-600 text-white"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="İşlemdeki Projeler" 
            value={stats.inProgressProjects} 
            icon={<ClockCircleOutlined style={{ fontSize: 24, color: "white" }} />} 
            color="bg-orange-500 text-white"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="Stok Ürünleri" 
            value={stats.stockItems} 
            icon={<InboxOutlined style={{ fontSize: 24, color: "white" }} />} 
            color="bg-purple-600 text-white"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Durum kartı */}
      <div className="mb-8">
        <Title level={4} className="mb-4 flex items-center">
          <BarChartOutlined className="mr-2" />
          Proje Durumları
        </Title>
        <Card bordered={false} className="shadow-sm" style={{ borderRadius: '8px' }}>
          <Status />
        </Card>
      </div>

      {/* Son projeler */}
      <div className="mb-6">
        <Card 
          title={<div className="flex items-center"><ProjectOutlined className="mr-2" /> Son Projeler</div>}
          className="shadow-sm"
          bordered={false}
          style={{ borderRadius: '8px' }}
        >
          {projectsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                  {i < 5 && <Divider className="my-3" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={project._id}>
                  <div className="flex justify-between items-center">
                    <Text strong>{project.name}</Text>
                    <Badge 
                      count={project.status} 
                      style={{ 
                        backgroundColor: 
                          project.status === "Tamamlandı" ? "#10b981" :
                          project.status === "İşlemde" ? "#3b82f6" :
                          project.status === "Onayda" ? "#f59e0b" :
                          "#6b7280"
                      }}
                    />
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <CalendarOutlined className="mr-1" /> 
                    <Text type="secondary">Son güncelleme: {formatDate(project.createdAt)}</Text>
                  </div>
                  {index < recentProjects.length - 1 && <Divider className="my-3" />}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Home;