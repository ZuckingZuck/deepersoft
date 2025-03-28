import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalUsers: 0,
    completedProjects: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('İstatistikler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Toplam Proje',
      value: stats.totalProjects,
      icon: <ProjectOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      title: 'Aktif Projeler',
      value: stats.activeProjects,
      icon: <ClockCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      title: 'Tamamlanan Projeler',
      value: stats.completedProjects,
      icon: <CheckCircleOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      color: '#722ed1'
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      color: '#fa8c16'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gösterge Paneli</h1>
      
      <Row gutter={[16, 16]}>
        {cards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              className="h-full shadow-md hover:shadow-lg transition-shadow duration-300"
              bodyStyle={{ padding: '24px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: `${card.color}15` }}>
                  {card.icon}
                </div>
              </div>
              <Statistic
                title={<span className="text-gray-600">{card.title}</span>}
                value={card.value}
                valueStyle={{ color: card.color, fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Buraya ek dashboard bileşenleri eklenebilir */}
      
    </div>
  );
};

export default Dashboard; 