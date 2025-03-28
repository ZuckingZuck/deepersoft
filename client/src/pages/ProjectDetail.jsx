import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchSystemData } from '../redux/systemSlice';
import { 
  Card, 
  Button, 
  Descriptions, 
  Tag, 
  Spin, 
  message, 
  Divider, 
  Typography, 
  Row, 
  Col, 
  Space,
  Timeline,
  Empty,
  Table,
  Avatar,
  Tooltip,
  Modal
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ProjectOutlined, 
  EnvironmentOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  NumberOutlined,
  CodeOutlined,
  HomeOutlined,
  ToolOutlined,
  PhoneOutlined,
  MailOutlined,
  WarningOutlined,
  PlusOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import AddPozModal from '../components/AddPozModal';

const { Title, Text } = Typography;

// Durum konfigürasyonu
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

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pozes, setPozes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddPozModalOpen, setIsAddPozModalOpen] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPoz, setSelectedPoz] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingPoz, setIsAddingPoz] = useState(false);

  useEffect(() => {
    // Sistem verilerini yükle
    dispatch(fetchSystemData());
  }, [dispatch]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API'den proje detaylarını çekelim - supervisor ve contractor populate edilmiş olacak
        const response = await api.get(`/api/project/${id}`);
        console.log("API Response:", response.data);
        
        // Response'un yapısını kontrol edelim ve hata ayıklama için tüm veriyi konsola yazdıralım
        console.log("Tüm API Yanıtı:", JSON.stringify(response.data, null, 2));
        
        // Response'un yapısını kontrol edelim
        if (response.data) {
          if (response.data.project) {
            // { project, logs, pozes } formatında
            setProject(response.data.project);
            setLogs(response.data.logs || []);
            setPozes(response.data.pozes || []);
          } else {
            // Doğrudan proje verisi
            setProject(response.data);
          }
        } else {
          throw new Error("Proje verileri boş");
        }
      } catch (error) {
        console.error('Proje detayları yüklenirken hata:', error);
        setError('Proje detayları yüklenemedi. Lütfen daha sonra tekrar deneyin.');
        message.error('Proje detayları yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  // Durum etiketi oluştur
  const getStatusTag = (status) => {
    if (!status) return <Tag>Bilinmiyor</Tag>;
    
    const config = statusConfig[status] || { color: 'default', icon: null };
    return (
      <Tag color={config.color} icon={config.icon} className="text-base py-1 px-3">
        {status}
      </Tag>
    );
  };

  // Formatlanmış tarih döndür
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Kullanıcı bilgileri göster
  const renderUserInfo = (user, type) => {
    // Önce null veya undefined durumunu kontrol edelim
    if (!user) {
      return <Text type="secondary">Atanmamış</Text>;
    }
    
    // String şeklindeki ID'yi kontrol et - Eğer ID gelirse, doğrudan ismini gösterelim
    if (typeof user === 'string' || (typeof user === 'object' && !user.fullName)) {
      return (
        <div className="flex items-center">
          <Avatar
            size="large" 
            icon={<UserOutlined />} 
            style={{ backgroundColor: type === 'supervisor' ? '#1890ff' : '#722ed1' }} 
            className="mr-3"
          />
          <div>
            <div className="font-medium text-lg">
              {type === 'supervisor' ? 'Denetçi' : 'Yüklenici'}
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-600">ID: {typeof user === 'string' ? user : 'Bilinmiyor'}</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Obje şeklindeki user verisini kontrol et
    if (typeof user === 'object' && user.fullName) {
      const bgColor = type === 'supervisor' ? '#1890ff' : '#722ed1';
      return (
        <div className="flex items-center">
          <Avatar
            size="large" 
            icon={<UserOutlined />} 
            style={{ backgroundColor: bgColor }} 
            className="mr-3"
          />
          <div>
            <div className="font-medium text-lg">{user.fullName}</div>
            <div className="flex items-center mt-1">
              <MailOutlined className="text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">{user.email || "-"}</span>
            </div>
            <div className="flex items-center mt-1">
              <PhoneOutlined className="text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">{user.phone || "-"}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <Tag color={type === 'supervisor' ? 'blue' : 'purple'}>
                {user.userType}
              </Tag>
            </div>
          </div>
        </div>
      );
    }
    
    return <Text type="secondary">Kullanıcı bilgileri geçersiz</Text>;
  };

  const handleAddPoz = async (pozData) => {
    try {
      setIsAddingPoz(true);
      const response = await api.post(`/api/project/poz/${id}`, {
        poz: pozData.poz._id,
        amount: pozData.amount
      });
      
      if (response.data) {
        message.success('Poz başarıyla eklendi');
        // Pozları yeniden yükle
        const updatedProject = await api.get(`/api/project/${id}`);
        setPozes(updatedProject.data.pozes || []);
      }
    } catch (error) {
      console.error('Poz eklenirken hata:', error);
      message.error('Poz eklenirken bir hata oluştu');
    } finally {
      setIsAddingPoz(false);
      setIsAddPozModalOpen(false);
    }
  };

  // Silme fonksiyonu
  const handleDeletePoz = async (pozId) => {
    try {
      setIsDeleting(true);
      console.log("Silme isteği gönderiliyor:", pozId);
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await api.delete(`/api/project/poz/${pozId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Silme yanıtı:", response);
      
      if (response.status === 200) {
        message.success('Poz başarıyla silindi');
        // Pozları yeniden yükle
        const updatedProject = await api.get(`/api/project/${id}`);
        if (updatedProject.data.pozes) {
          setPozes(updatedProject.data.pozes);
        }
      }
    } catch (error) {
      console.error('Poz silinirken hata:', error);
      if (error.response) {
        console.log('Hata detayı:', error.response.data);
        message.error(error.response.data.message || 'Poz silinirken bir hata oluştu');
      } else if (error.request) {
        console.log('İstek hatası:', error.request);
        message.error('Sunucuya bağlanılamadı');
      } else {
        console.log('Diğer hata:', error.message);
        message.error('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      setSelectedPoz(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Proje detayları yükleniyor..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="shadow-md rounded-lg text-center py-12">
          <ExclamationCircleOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />
          <Title level={3} className="mt-6">Proje Bulunamadı</Title>
          <Text className="block mb-6">
            {error || "İstediğiniz proje bulunamadı veya erişim izniniz yok."}
          </Text>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/projects')}
          >
            Projelere Dön
          </Button>
        </Card>
      </div>
    );
  }

  // Debug bilgileri
  console.log("Proje:", project);
  console.log("Supervisor:", project.supervisor, typeof project.supervisor);
  console.log("Contractor:", project.contractor, typeof project.contractor);
  console.log("Pozlar:", pozes);

  // Poz tablosu sütunları
  const pozColumns = [
    {
      title: 'Poz Kodu',
      dataIndex: ['poz', 'code'],
      key: 'code',
      render: (text, record) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: 'Poz Adı',
      dataIndex: ['poz', 'name'],
      key: 'name',
    },
    {
      title: 'Birim',
      dataIndex: ['poz', 'unit'],
      key: 'unit',
      render: (text) => (
        <Tag color="cyan">{text}</Tag>
      )
    },
    {
      title: 'Fiyat Tipi',
      dataIndex: ['poz', 'priceType'],
      key: 'priceType',
      render: (text) => (
        <Tag color={text === 'M' ? 'orange' : 'green'}>
          {text === 'M' ? 'Malzeme' : 'Servis'}
        </Tag>
      )
    },
    {
      title: 'Birim Fiyat',
      dataIndex: ['poz', 'price'],
      key: 'price',
      render: (price) => (
        <span className="font-medium">₺{price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
      )
    },
    {
      title: 'Taşeron Fiyatı',
      dataIndex: ['poz', 'contractorPrice'],
      key: 'contractorPrice',
      render: (price) => (
        <span className="font-medium">₺{price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
      )
    },
    {
      title: 'Miktar',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Tag color="purple" className="text-center" style={{ minWidth: '60px' }}>
          {amount}
        </Tag>
      )
    },
    {
      title: 'Toplam',
      key: 'total',
      render: (_, record) => (
        <span className="font-medium text-green-600">
          ₺{(record.amount * record.poz.price)?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      title: 'İşlem',
      key: 'action',
      render: (_, record) => {
        console.log("Poz verisi:", record);
        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              console.log("Silme butonuna tıklandı");
              console.log("Silinecek poz ID:", record._id);
              setSelectedPoz(record);
              setDeleteModalVisible(true);
            }}
          />
        );
      }
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <ProjectOutlined className="text-2xl mr-3 text-blue-600" />
          <Title level={2} className="m-0">Proje Detayları</Title>
        </div>
        <Space>
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/projects')}
          >
            Projelere Dön
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/projects/edit/${id}`)}
          >
            Düzenle
          </Button>
        </Space>
      </div>

      {/* Ana proje bilgileri kartı */}
      <Card className="shadow-md rounded-lg mb-6">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <Title level={3} className="mb-1">{project.name || "İsimsiz Proje"}</Title>
            <div className="flex items-center">
              <Text type="secondary" className="mr-2">Durum:</Text>
              {getStatusTag(project.status)}
            </div>
          </div>
          <div className="text-right">
            <Text type="secondary">Oluşturulma Tarihi</Text>
            <div className="text-base font-medium">{formatDate(project.createdAt)}</div>
          </div>
        </div>

        {/* Proje detayları bölümü */}
        <Row gutter={[24, 24]}>
          <Col span={24} lg={12}>
            <Card 
              title={<div className="flex items-center"><ProjectOutlined className="mr-2" /> Proje Bilgileri</div>} 
              className="h-full"
              type="inner"
            >
              <Descriptions column={1} layout="vertical" bordered size="small">
                <Descriptions.Item label={<span><ProjectOutlined className="mr-1" /> Proje Adı</span>}>
                  {project.name || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<span><CodeOutlined className="mr-1" /> DDO Numarası</span>}>
                  {project.ddo || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<span><CodeOutlined className="mr-1" /> Tellcordia Numarası</span>}>
                  {project.tellcordiaNo || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<span><HomeOutlined className="mr-1" /> Home Pass</span>}>
                  {project.homePass || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<span><CalendarOutlined className="mr-1" /> Proje Tarihi</span>}>
                  {formatDate(project.date) || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<span><DatabaseOutlined className="mr-1" /> Küme</span>}>
                  <Tag color="blue" icon={<DatabaseOutlined />}>{project.clusterName || "Belirtilmemiş"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<span><CalendarOutlined className="mr-1" /> Son Güncelleme</span>}>
                  {formatDate(project.updatedAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={24} lg={12}>
            <Card 
              title={<div className="flex items-center"><EnvironmentOutlined className="mr-2" /> Konum ve Saha Bilgileri</div>} 
              className="h-full"
              type="inner"
            >
              <Descriptions column={1} layout="vertical" bordered size="small">
                <Descriptions.Item label={<span><EnvironmentOutlined className="mr-1" /> Şehir</span>}>
                  {project.city || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<span><ToolOutlined className="mr-1" /> Saha Tipi</span>}>
                  {project.fieldType || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<span><ToolOutlined className="mr-1" /> Saha Adı</span>}>
                  {project.fieldName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<span><CodeOutlined className="mr-1" /> LOC</span>}>
                  {project.loc || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={<span><CodeOutlined className="mr-1" /> SIR</span>}>
                  {project.sir || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Denetçi (Supervisor) bilgileri */}
          <Col span={24} lg={12}>
            <Card 
              title={<div className="flex items-center"><UserOutlined className="mr-2" /> Denetçi (Supervisor)</div>} 
              className="h-full shadow-sm"
              type="inner"
            >
              {renderUserInfo(project.supervisor, 'supervisor')}
            </Card>
          </Col>

          {/* Yüklenici (Taşeron) bilgileri */}
          <Col span={24} lg={12}>
            <Card 
              title={<div className="flex items-center"><TeamOutlined className="mr-2" /> Yüklenici (Taşeron)</div>} 
              className="h-full shadow-sm"
              type="inner"
            >
              {renderUserInfo(project.contractor, 'contractor')}
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Notlar bölümü */}
      {project.notes && (
        <Card 
          title={<div className="flex items-center"><MessageOutlined className="mr-2" /> Proje Notları</div>}
          className="shadow-md rounded-lg mb-6"
        >
          <div className="bg-gray-50 p-3 rounded-lg whitespace-pre-line">
            {project.notes || "Not eklenmemiş."}
          </div>
        </Card>
      )}

      {/* Poz Bilgileri Bölümü */}
      <Card 
        title={<div className="flex items-center"><DatabaseOutlined className="mr-2" /> Poz Bilgileri</div>}
        className="shadow-md rounded-lg mb-6"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsAddPozModalOpen(true)}
          >
            Poz Ekle
          </Button>
        }
      >
        {pozes && pozes.length > 0 ? (
          <div className="overflow-x-auto">
            <Table 
              columns={pozColumns} 
              dataSource={pozes} 
              rowKey="_id"
              pagination={false}
            />
          </div>
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={
              <div>
                <p className="text-lg mb-2">Poz bilgisi bulunamadı</p>
                <p className="text-gray-500">Bu projeye henüz poz bilgisi eklenmemiş.</p>
              </div>
            }
          />
        )}
      </Card>

      {/* Tarihçe Bölümü */}
      <Card 
        title={<div className="flex items-center"><ClockCircleOutlined className="mr-2" /> Proje Tarihçesi</div>}
        className="shadow-md rounded-lg mb-6"
      >
        {logs && logs.length > 0 ? (
          <Timeline className="p-4">
            {/* Oluşturulma kaydı */}
            <Timeline.Item color="green">
              <div className="font-medium">Proje oluşturuldu</div>
              <div className="text-sm text-gray-500">
                {formatDate(project.createdAt)}
              </div>
            </Timeline.Item>
            
            {/* Log kayıtları */}
            {logs.map((log, index) => (
              <Timeline.Item key={index} color="blue">
                <div className="font-medium">{log.note}</div>
                <div className="text-sm text-gray-500">
                  {formatDate(log.createdAt)}
                  {log.user && <span> - {log.user.fullName}</span>}
                </div>
              </Timeline.Item>
            ))}
            
            {/* Son güncelleme kaydı (eğer farklıysa) */}
            {project.updatedAt && project.createdAt !== project.updatedAt && (
              <Timeline.Item color="orange">
                <div className="font-medium">Son güncelleme</div>
                <div className="text-sm text-gray-500">
                  {formatDate(project.updatedAt)}
                  <span> - Durum: {project.status}</span>
                </div>
              </Timeline.Item>
            )}
          </Timeline>
        ) : (
          <Empty description="Proje tarihçesi bulunamadı" />
        )}
      </Card>

      <AddPozModal
        isOpen={isAddPozModalOpen}
        onClose={() => {
          setIsAddPozModalOpen(false);
          setIsAddingPoz(false);
        }}
        onAdd={handleAddPoz}
        loading={isAddingPoz}
      />

      <Modal
        title="Poz Silme"
        open={deleteModalVisible}
        onOk={() => {
          if (selectedPoz) {
            handleDeletePoz(selectedPoz._id);
          }
        }}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedPoz(null);
          setIsDeleting(false);
        }}
        okText="Evet"
        cancelText="Hayır"
        okType="danger"
        confirmLoading={isDeleting}
      >
        {selectedPoz && (
          <p>{selectedPoz.poz.name} pozunu silmek istediğinizden emin misiniz?</p>
        )}
      </Modal>
    </div>
  );
};

export default ProjectDetail; 