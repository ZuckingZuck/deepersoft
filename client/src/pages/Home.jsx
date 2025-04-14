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
    className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
    bodyStyle={{ padding: '24px' }}
    bordered={false}
    style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}
  >
    {loading ? (
      <div className="flex justify-center items-center h-24">
        <Spin />
      </div>
    ) : (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            {icon}
          </div>
          <div className="text-3xl font-bold text-gray-800">{value}</div>
        </div>
        <Text type="secondary" className="text-base font-medium">{title}</Text>
      </div>
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

  // Yetki kontrolü
  const canCreateProject = user && (user.userType === 'Sistem Yetkilisi' || user.userType === 'Supervisor');

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
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Hoş geldin mesajı */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm">
        <Title level={2} className="mb-1 flex items-center">
          <span className="mr-2 text-gray-700">{getGreeting()},</span> 
          <span className="text-blue-600 font-semibold">{user?.fullName}</span>
        </Title>
        <Text type="secondary" className="text-lg">
          İşte bugünkü özet:
        </Text>
      </div>

      {/* İstatistik kartları */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="Toplam Projeler" 
            value={stats.totalProjects} 
            icon={<ProjectOutlined style={{ fontSize: 28, color: "#3b82f6" }} />} 
            color="text-blue-500"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="Tamamlanan Projeler" 
            value={stats.completedProjects} 
            icon={<CheckCircleOutlined style={{ fontSize: 28, color: "#10b981" }} />} 
            color="text-green-500"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="İşlemdeki Projeler" 
            value={stats.inProgressProjects} 
            icon={<ClockCircleOutlined style={{ fontSize: 28, color: "#f59e0b" }} />} 
            color="text-orange-500"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatCard 
            title="Stok Ürünleri" 
            value={stats.stockItems} 
            icon={<InboxOutlined style={{ fontSize: 28, color: "#8b5cf6" }} />} 
            color="text-purple-500"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Durum kartı */}
      <div className="mb-8">
        <Card 
          bordered={false} 
          className="shadow-sm rounded-2xl overflow-hidden"
          title={
            <div className="flex items-center">
              <BarChartOutlined className="text-xl text-blue-500 mr-2" />
              <span className="text-lg font-medium">Proje Durumları</span>
            </div>
          }
        >
          <Status />
        </Card>
      </div>

      {/* Son projeler */}
      <div className="mb-6">
        <Card 
          bordered={false}
          className="shadow-sm rounded-2xl overflow-hidden"
          title={
            <div className="flex items-center">
              <ProjectOutlined className="text-xl text-blue-500 mr-2" />
              <span className="text-lg font-medium">Son Projeler</span>
            </div>
          }
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
                <div key={project._id} className="p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex justify-between items-center">
                    <Text strong className="text-base">{project.name}</Text>
                    <Badge 
                      count={project.status} 
                      style={{ 
                        backgroundColor: 
                          project.status === "Tamamlandı" ? "#10b981" :
                          project.status === "İşlemde" ? "#3b82f6" :
                          project.status === "Onayda" ? "#f59e0b" :
                          "#6b7280",
                        padding: "1px 12px",
                        borderRadius: "8px"
                      }}
                    />
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mt-2">
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