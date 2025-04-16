import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  Modal,
  Select,
  Form,
  Input as AntInput,
  InputNumber
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
  PlusOutlined,
  FileOutlined,
  UploadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import AddPozModal from '../components/AddPozModal';
import FileUpload from '../components/FileUpload';
import cdnAdapter from '../utils/cdnAdapter';
import axios from 'axios';

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
  const user = useSelector((state) => state.user.user);
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
  const [documents, setDocuments] = useState([]);
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteForm] = Form.useForm();
  const [noteLoading, setNoteLoading] = useState(false);
  const [isEditPozModalVisible, setIsEditPozModalVisible] = useState(false);

  // Yetki kontrolü
  const canEdit = user && (user.userType === 'Sistem Yetkilisi' || user.userType === 'Supervisor');
  const canChangeStatus = user && (user.userType === 'Sistem Yetkilisi' || user.userType === 'Supervisor');
  const canAddNote = user && (user.userType === 'Sistem Yetkilisi' || user.userType === 'Supervisor' || user.userType === 'Taşeron');

  // Sistem verilerini yükle
  useEffect(() => {
    dispatch(fetchSystemData());
  }, [dispatch]);

  // Proje detaylarını çeken fonksiyon
  const fetchProjectDetails = async (refresh) => {
    try {
      if(refresh == true) setLoading(true);
      setLoadingDocuments(true); // Belge yükleme durumunu da ayarla
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
          setDocuments(response.data.documents || []); // Belgeleri API yanıtından al
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
      setLoadingDocuments(false); // Belge yükleme durumunu güncelle
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails(true);
    }
  }, [id]);

  // Dosya yükleme başarılı olduğunda
  const handleFileUploadSuccess = (url) => {
    setDocumentUrl(url);
    message.success('Belge başarıyla yüklendi');
  };

  // Belge ekle
  const handleAddDocument = async () => {
    if (!documentType || !documentUrl) {
      message.warning('Lütfen belge türü seçin ve bir dosya yükleyin');
      return;
    }

    try {
      await api.post('/api/project/document', {
        project: id,
        documentType,
        documentUrl
      });

      message.success('Belge başarıyla eklendi');
      setIsAddDocumentModalOpen(false);
      setDocumentType('');
      setDocumentUrl('');
      fetchProjectDetails(); // Proje detaylarını yeniden yükle
    } catch (error) {
      console.error('Belge eklenirken hata:', error);
      message.error('Belge eklenirken bir hata oluştu');
    }
  };

  // Belge sil
  const handleDeleteDocument = async (documentId) => {
    try {
      await api.delete(`/api/project/document/${documentId}`);
      message.success('Belge başarıyla silindi');
      fetchProjectDetails(); // Proje detaylarını yeniden yükle
    } catch (error) {
      console.error('Belge silinirken hata:', error);
      message.error('Belge silinirken bir hata oluştu');
    }
  };

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

      // Poz verilerini hazırla
      const pozToAdd = {
        projectId: id,
        pozId: pozData.pozId,
        amount: pozData.amount,
        contractorPrice: pozData.contractorPrice,
        status: 'Beklemede'
      };

      // Pozu ekle
      const response = await api.post(`/api/project/poz/${id}`, pozToAdd);

      if (response.data) {
        message.success('Poz başarıyla eklendi');
        //setIsAddPozModalOpen(false); //şimdilik false
        fetchProjectDetails(false); // Proje detaylarını yeniden yükle
      }
    } catch (error) {
      console.error('Poz eklenirken hata:', error);
      message.error('Poz eklenirken bir hata oluştu');
      
    }finally {
      setIsAddingPoz(false);
    }
  };

  const handleDeleteProject = async () => {
    // Kullanıcıya onay sorusu gösteriliyor
    const isConfirmed = window.confirm("Proje silinecek. Emin misiniz?");

    if (isConfirmed) {
      try {
        const response = await api.delete(`/api/project/${id}`);
        if (response.status === 200) {
          message.success("Proje silindi.");
          setTimeout(() => {
            navigate("/"); // Anasayfaya yönlendiriyor
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        message.error("Silme işlemi sırasında bir hata oluştu.");
      }
    } else {
      message.info("Silme işlemi iptal edildi.");
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

  // Statüs seçenekleri
  const statusOptions = [
    { value: 'İşlemde', label: 'İşlemde' },
    { value: 'Onayda', label: 'Onayda' },
    { value: 'İncelendi', label: 'İncelendi' },
    { value: 'Montaj Tamam', label: 'Montaj Tamam' },
    { value: 'Tamamlandı', label: 'Tamamlandı' },
    { value: 'Islah ve Düzenleme', label: 'Islah ve Düzenleme' },
    { value: 'Beklemede', label: 'Beklemede' },
    { value: 'Arşivde', label: 'Arşivde' }
  ];

  const handleStatusChange = async () => {
    if (!selectedStatus) {
      message.error('Lütfen bir durum seçin');
      return;
    }

    setStatusLoading(true);
    try {
      await api.put(`/api/project/status/${id}`, { status: selectedStatus });
      message.success('Proje durumu başarıyla güncellendi');
      setStatusModalVisible(false);
      setSelectedStatus('');
      fetchProjectDetails();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      message.error('Durum güncellenirken bir hata oluştu');
    } finally {
      setStatusLoading(false);
    }
  };

  // Not ekleme fonksiyonu
  const handleAddNote = async (values) => {
    try {
      setNoteLoading(true);
      const response = await api.post(`/api/project/log/${id}`, {
        note: values.note
      });

      if (response.status === 200) {
        message.success('Not başarıyla eklendi');
        setNoteModalVisible(false);
        noteForm.resetFields();
        // Proje detaylarını yeniden yükle
        fetchProjectDetails();
      }
    } catch (error) {
      console.error('Not ekleme hatası:', error);
      message.error('Not eklenirken bir hata oluştu');
    } finally {
      setNoteLoading(false);
    }
  };

  // Poz tablosu kolonları
  const pozColumns = [
    {
      title: 'Poz Kodu',
      dataIndex: 'code',
      key: 'code',
      render: (text, record) => record.pozId?.code || '-'
    },
    {
      title: 'Poz Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => record.pozId?.name || '-'
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => (record.quantity || 0).toLocaleString('tr-TR')
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      render: (text, record) => record.pozId?.unit || '-'
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'price',
      key: 'price',
      render: (text, record) => {
        const price = user.userType === 'Taşeron' ? record.contractorPrice : record.price;
        return (price || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
      }
    },
    {
      title: 'Toplam',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (text, record) => {
        const price = user.userType === 'Taşeron' ? record.contractorPrice : record.price;
        const total = (price || 0) * (record.quantity || 0);
        return total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
      }
    },
    ...(user.userType === 'Sistem Yetkilisi' ? [
      {
        title: 'Taşeron Fiyat',
        dataIndex: 'contractorPrice',
        key: 'contractorPrice',
        render: (text, record) => (record.contractorPrice || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
      },
      {
        title: 'Taşeron Toplam',
        dataIndex: 'contractorTotalPrice',
        key: 'contractorTotalPrice',
        render: (text, record) => {
          const total = (record.contractorPrice || 0) * (record.quantity || 0);
          return total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
        }
      }
    ] : []),
    {
      title: 'İşlemler',
      key: 'actions',
      render: (text, record) => (
        <Space>
          <Button
            type="link"
            danger
            onClick={() => handleDeletePoz(record._id)}
            icon={<DeleteOutlined />}
            disabled={isDeleting}
            loading={isDeleting}
          >
            Sil
          </Button>
        </Space>
      )
    }
  ];

  // Belge tablosu sütunları
  const documentColumns = [
    {
      title: 'Belge Türü',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Belge Formatı',
      dataIndex: 'documentUrl',
      key: 'format',
      render: (url) => {
        const extension = url.split('.').pop().toLowerCase();
        let format = extension.toUpperCase();
        let color = 'default';

        // Format tipine göre renk belirleme
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
          color = 'green';
        } else if (extension === 'pdf') {
          color = 'red';
        } else if (['zip', 'rar'].includes(extension)) {
          color = 'purple';
        } else if (['doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
          color = 'blue';
        } else if (['kmz', 'kml'].includes(extension)) {
          color = 'orange';
        } else if (extension === 'sor') {
          color = 'geekblue';
        }

        return <Tag color={color}>{format}</Tag>;
      }
    },
    {
      title: 'Ekleyen',
      dataIndex: ['user', 'fullName'],
      key: 'user',
      render: (text) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-gray-500" />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Eklenme Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('tr-TR')
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<FileOutlined />}
            onClick={() => window.open(cdnAdapter.getFileUrl(record.documentUrl), '_blank')}
          >
            Görüntüle
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => Modal.confirm({
              title: 'Belgeyi Sil',
              content: 'Bu belgeyi silmek istediğinizden emin misiniz?',
              okText: 'Evet',
              cancelText: 'İptal',
              onOk: () => handleDeleteDocument(record._id)
            })}
          >
            Sil
          </Button>
        </Space>
      )
    }
  ];

  // Poz düzenleme modalı
  const EditPozModal = () => {
    const [form] = Form.useForm();
    const { selectedPoz } = useSelector(state => state.project);

    useEffect(() => {
      if (selectedPoz) {
        form.setFieldsValue({
          quantity: selectedPoz.quantity,
          status: selectedPoz.status,
          notes: selectedPoz.notes
        });
      }
    }, [selectedPoz, form]);

    const handleSubmit = async (values) => {
      try {
        await api.put(`/api/project/poz/${selectedPoz._id}`, values);
        message.success("Poz başarıyla güncellendi");
        dispatch(fetchProjectDetail(projectId));
        setIsEditPozModalVisible(false);
      } catch (error) {
        message.error("Poz güncellenirken bir hata oluştu");
      }
    };

    return (
      <Modal
        title="Poz Düzenle"
        open={isEditPozModalVisible}
        onCancel={() => setIsEditPozModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="quantity"
            label="Miktar"
            rules={[{ required: true, message: "Lütfen miktar giriniz" }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Durum"
            rules={[{ required: true, message: "Lütfen durum seçiniz" }]}
          >
            <Select>
              <Option value="Beklemede">Beklemede</Option>
              <Option value="İşlemde">İşlemde</Option>
              <Option value="Tamamlandı">Tamamlandı</Option>
              <Option value="İptal">İptal</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notlar"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Kaydet
              </Button>
              <Button onClick={() => setIsEditPozModalVisible(false)}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
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

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <Card className="shadow-lg rounded-2xl border-0">
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
            {canChangeStatus && (
              <div>
                <Button
                  danger
                  type="primary"
                  onClick={() => {
                    handleDeleteProject();
                  }}
                >
                  Sil
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setSelectedStatus(project.status);
                    setStatusModalVisible(true);
                  }}
                >
                  Durum Değiştir
                </Button>
              </div>

            )}
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
                  <Descriptions.Item label={<span><CodeOutlined className="mr-1" /> Toplam Kazanç</span>}>
                    {user.userType === "Sistem Yetkilisi" ? project.totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : project.totalContractorPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || "-"}
                  </Descriptions.Item>
                  {
                    user.userType === "Sistem Yetkilisi" && (
                      <Descriptions.Item label={<span><CodeOutlined className="mr-1" />Taşeron Kazanç</span>}>
                       {project.totalContractorPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} 
                      </Descriptions.Item>
                    )
                  }
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
        >
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Pozlar</h2>
              <Button
                type="primary"
                onClick={() => setIsAddPozModalOpen(true)}
                icon={<PlusOutlined />}
              >
                Poz Ekle
              </Button>
            </div>
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
          </div>
        </Card>

        {/* Belgeler Bölümü */}
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Proje Belgeleri</span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddDocumentModalOpen(true)}
              >
                Belge Ekle
              </Button>
            </div>
          }
          className="mb-6 shadow-md"
        >
          {loadingDocuments ? (
            <div className="text-center py-4">
              <Spin size="large" />
              <div className="mt-2">Belgeler yükleniyor...</div>
            </div>
          ) : documents.length === 0 ? (
            <Empty description="Henüz belge eklenmemiş" />
          ) : (
            <Table
              columns={documentColumns}
              dataSource={documents}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
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

        {/* Not Ekleme Butonu */}
        <div className="mb-4">
          <Button
            type="primary"
            onClick={() => setNoteModalVisible(true)}
            icon={<PlusOutlined />}
          >
            Not Ekle
          </Button>
        </div>

        {/* Not Ekleme Modalı */}
        <Modal
          title="Projeye Not Ekle"
          open={noteModalVisible}
          onCancel={() => setNoteModalVisible(false)}
          footer={null}
        >
          <Form
            form={noteForm}
            onFinish={handleAddNote}
            layout="vertical"
          >
            <Form.Item
              name="note"
              label="Not"
              rules={[{ required: true, message: 'Lütfen bir not girin' }]}
            >
              <AntInput.TextArea
                rows={4}
                placeholder="Notunuzu buraya yazın..."
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={noteLoading}
                >
                  Kaydet
                </Button>
                <Button onClick={() => setNoteModalVisible(false)}>
                  İptal
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

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

        {/* Belge Ekleme Modalı */}
        <Modal
          title="Proje Belgesi Ekle"
          open={isAddDocumentModalOpen}
          onCancel={() => {
            setIsAddDocumentModalOpen(false);
            setDocumentType('');
            setDocumentUrl('');
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsAddDocumentModalOpen(false);
                setDocumentType('');
                setDocumentUrl('');
              }}
            >
              İptal
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleAddDocument}
              disabled={!documentType || !documentUrl}
            >
              Belge Ekle
            </Button>
          ]}
        >
          <div className="mb-4">
            <label className="block mb-2">Belge Türü:</label>
            <Select
              placeholder="Belge türü seçin"
              style={{ width: '100%' }}
              value={documentType}
              onChange={(value) => setDocumentType(value)}
            >
              <Select.Option value="AKTIVASYON FOTO">AKTIVASYON FOTO</Select.Option>
              <Select.Option value="BARKOD">BARKOD</Select.Option>
              <Select.Option value="HASARSIZLIK (FORM)">HASARSIZLIK (FORM)</Select.Option>
              <Select.Option value="IMALAT FOTO">IMALAT FOTO</Select.Option>
              <Select.Option value="ISLAH FOTO">ISLAH FOTO</Select.Option>
              <Select.Option value="KESIF (FORM)">KESIF (FORM)</Select.Option>
              <Select.Option value="KMZ (KMZ)">KMZ (KMZ)</Select.Option>
              <Select.Option value="MUTABAKAT (FORM)">MUTABAKAT (FORM)</Select.Option>
              <Select.Option value="OTDR (SOR)">OTDR (SOR)</Select.Option>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Belge Yükle:</label>
            <FileUpload
              onSuccess={handleFileUploadSuccess}
              buttonText="Belge Yükle"
              maxFileSize={10}
            />
            {documentUrl && (
              <div className="mt-2 text-green-500">
                ✓ Belge başarıyla yüklendi
              </div>
            )}
          </div>
        </Modal>

        <Modal
          title="Proje Durumu Değiştir"
          open={statusModalVisible}
          onOk={handleStatusChange}
          onCancel={() => {
            setStatusModalVisible(false);
            setSelectedStatus('');
          }}
          confirmLoading={statusLoading}
        >
          <Form layout="vertical">
            <Form.Item label="Yeni Durum" required>
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="Durum seçin"
                options={statusOptions}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ProjectDetail; 