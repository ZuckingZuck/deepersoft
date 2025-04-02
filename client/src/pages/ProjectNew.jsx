import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Card, 
  Typography, 
  message, 
  Divider,
  Row,
  Col,
  Spin,
  Alert,
  Space
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ProjectOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FieldTimeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import { fetchAllUsers } from '../redux/userSlice';
import { fetchAllClusters, setSelectedCity, setSelectedCluster, clearClusterError } from '../redux/clusterSlice';
import locale from 'antd/es/date-picker/locale/tr_TR';
import 'dayjs/locale/tr';

const { Title } = Typography;
const { Option } = Select;

const ProjectNew = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state'ten kullanıcıları al
  const supervisors = useSelector(state => state.user.supervisors);
  const contractors = useSelector(state => state.user.contractors);
  const userStatus = useSelector(state => state.user.userStatus);
  
  // Redux state'ten şehir ve öbek bilgilerini al
  const cities = useSelector(state => state.cluster.cities);
  const clustersByCity = useSelector(state => state.cluster.clustersByCity);
  const selectedCity = useSelector(state => state.cluster.selectedCity);
  const selectedCluster = useSelector(state => state.cluster.selectedCluster);
  const clusterStatus = useSelector(state => state.cluster.clusterStatus);
  const clusterError = useSelector(state => state.cluster.error);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldTypes, setFieldTypes] = useState([]);
  const [fieldTypesLoading, setFieldTypesLoading] = useState(false);
  const [fieldTypesError, setFieldTypesError] = useState(null);
  const [availableClusters, setAvailableClusters] = useState([]);

  const loadFieldTypes = async () => {
    try {
      setFieldTypesLoading(true);
      setFieldTypesError(null);
      const fieldTypesResponse = await api.get('/api/definitions/field');
      setFieldTypes(fieldTypesResponse.data);
    } catch (error) {
      console.error('Saha tiplerini getirirken hata:', error);
      setFieldTypesError('Saha tipi bilgileri yüklenemedi.');
    } finally {
      setFieldTypesLoading(false);
    }
  };

  const reloadClusters = async () => {
    try {
      // Önce Redux store'daki hata durumunu temizle
      dispatch(clearClusterError());
      // Sonra yeniden yüklemeyi başlat
      await dispatch(fetchAllClusters()).unwrap();
      message.success('Öbek bilgileri başarıyla yüklendi.');
    } catch (error) {
      console.error('Öbekleri yeniden yüklerken hata oluştu:', error);
      message.error('Öbek bilgileri yüklenemedi. Lütfen API bağlantınızı kontrol edin.');
    }
  };

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        // Redux üzerinden kullanıcıları getirme
        if (userStatus === 'idle') {
          try {
            await dispatch(fetchAllUsers()).unwrap();
          } catch (error) {
            console.error('Kullanıcılar getirilirken hata:', error);
            message.error('Kullanıcı verileri yüklenemedi.');
          }
        }

        // Redux üzerinden öbekleri getirme
        if (clusterStatus === 'idle') {
          try {
            await dispatch(fetchAllClusters()).unwrap();
          } catch (error) {
            console.error('Öbekleri getirirken hata:', error);
            message.error('Öbek bilgileri yüklenemedi. API bağlantınızı kontrol edin.');
          }
        }

        // Saha tipi listesini çek
        await loadFieldTypes();

      } catch (error) {
        console.error('Form verisi yüklenirken hata oluştu:', error);
        message.error('Gerekli veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [dispatch, userStatus, clusterStatus]);

  // Şehir seçildiğinde kullanılabilir öbekleri güncelle
  useEffect(() => {
    if (selectedCity && clustersByCity[selectedCity]) {
      setAvailableClusters(clustersByCity[selectedCity]);
      // Şehir değiştiğinde öbek ve clusterName alanını temizle
      form.setFieldsValue({ 
        clusterId: undefined, 
        clusterName: undefined
      });
    } else {
      setAvailableClusters([]);
    }
  }, [selectedCity, clustersByCity, form]);

  // Öbek seçildiğinde clusterName alanını doldur
  useEffect(() => {
    if (selectedCluster) {
      form.setFieldValue('clusterName', selectedCluster.name);
    }
  }, [selectedCluster, form]);

  // Şehir değiştiğinde Redux store'a bildir
  const handleCityChange = (city) => {
    dispatch(setSelectedCity(city));
  };

  // Öbek değiştiğinde Redux store'a bildir
  const handleClusterChange = (clusterId) => {
    dispatch(setSelectedCluster(clusterId));
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      
      // Tarih formatını düzeltme
      const formattedValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        // Tüm bayrakları false olarak ayarla
        IMLT: false,
        AKTV: false,
        ISLH: false,
        HSRSZ: false,
        KMZ: false,
        OTDR: false,
        MTBKT: false,
        KSF: false,
        BRKD: false
      };

      // API'ya gönder
      await api.post('/api/project', formattedValues);
      
      message.success('Proje başarıyla oluşturuldu');
      navigate('/projects?status=islemde');
    } catch (error) {
      console.error('Proje kaydedilirken hata oluştu:', error);
      message.error('Proje kaydedilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Kullanıcı ve öbek verileri yüklenirken gösterilecek
  const isLoadingUsers = userStatus === 'loading';
  const isLoadingClusters = clusterStatus === 'loading';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Veriler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <Card className="shadow-lg rounded-2xl border-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <ProjectOutlined className="text-2xl mr-3 text-blue-600" />
            <Title level={2} className="m-0">Yeni Proje Oluştur</Title>
          </div>
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            Geri Dön
          </Button>
        </div>

        {/* Öbek verileri hata durumu */}
        {clusterStatus === 'failed' && (
          <Alert
            message="Öbek Verileri Yüklenemedi"
            description={
              <div>
                <p>{clusterError || 'API ile bağlantı kurulurken bir sorun oluştu.'}</p>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={reloadClusters}
                  className="mt-2"
                >
                  Yeniden Dene
                </Button>
              </div>
            }
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {/* Saha tipleri hata durumu */}
        {fieldTypesError && (
          <Alert
            message="Saha Tipi Verileri Yüklenemedi"
            description={
              <div>
                <p>{fieldTypesError}</p>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={loadFieldTypes}
                  className="mt-2"
                >
                  Yeniden Dene
                </Button>
              </div>
            }
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        <Card className="shadow-md rounded-lg">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            scrollToFirstError
          >
            <Row gutter={24}>
              <Col span={24}>
                <Title level={4} className="mb-4">
                  <ProjectOutlined className="mr-2" />
                  Proje Bilgileri
                </Title>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Proje Adı"
                  rules={[{ required: true, message: 'Lütfen proje adını girin' }]}
                >
                  <Input placeholder="Proje adını girin" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ddo"
                  label="DDO Numarası"
                  rules={[{ required: true, message: 'Lütfen DDO numarasını girin' }]}
                >
                  <Input placeholder="DDO numarasını girin" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="tellcordiaNo"
                  label="Tellcordia Numarası"
                  rules={[{ required: true, message: 'Lütfen Tellcordia numarasını girin' }]}
                >
                  <Input placeholder="Tellcordia numarasını girin" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="homePass"
                  label="Home Pass"
                  rules={[{ required: true, message: 'Lütfen Home Pass değerini girin' }]}
                >
                  <Input placeholder="Home Pass değerini girin" />
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            
            <Row gutter={24}>
              <Col span={24}>
                <Title level={4} className="mb-4">
                  <EnvironmentOutlined className="mr-2" />
                  Konum Bilgileri
                </Title>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="city"
                  label="Şehir"
                  rules={[{ required: true, message: 'Lütfen şehir seçin' }]}
                  extra={isLoadingClusters ? "Şehirler yükleniyor..." : cities.length === 0 && clusterStatus !== 'loading' ? "Şehir verisi bulunamadı" : ""}
                >
                  <Select 
                    placeholder="Şehir seçin" 
                    loading={isLoadingClusters}
                    onChange={handleCityChange}
                    allowClear
                    disabled={clusterStatus === 'failed' || cities.length === 0}
                    notFoundContent={cities.length === 0 ? "Şehir verisi bulunamadı" : null}
                  >
                    {cities && cities.length > 0 ? (
                      cities.map((city, index) => (
                        <Option key={index} value={city}>{city}</Option>
                      ))
                    ) : null}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="clusterId"
                  label="Öbek"
                  rules={[{ required: true, message: 'Lütfen öbek seçin' }]}
                  extra={!selectedCity ? "Önce bir şehir seçin" : isLoadingClusters ? "Öbekler yükleniyor..." : availableClusters.length === 0 ? "Seçilen şehirde öbek bulunamadı" : ""}
                >
                  <Select 
                    placeholder="Önce şehir seçin" 
                    loading={isLoadingClusters}
                    onChange={handleClusterChange}
                    disabled={!selectedCity || availableClusters.length === 0 || clusterStatus === 'failed'}
                    allowClear
                    notFoundContent={availableClusters.length === 0 ? "Öbek verisi bulunamadı" : null}
                  >
                    {availableClusters && availableClusters.length > 0 ? (
                      availableClusters.map(cluster => (
                        <Option key={cluster._id} value={cluster._id}>{cluster.name}</Option>
                      ))
                    ) : null}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="clusterName"
                  label="Öbek Adı"
                  tooltip="Öbek seçildiğinde otomatik doldurulur"
                  rules={[{ required: true, message: 'Lütfen öbek adını girin' }]}
                >
                  <Input disabled placeholder="Öbek adı" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="fieldType"
                  label="Saha Tipi"
                  rules={[{ required: true, message: 'Lütfen saha tipini seçin' }]}
                  extra={fieldTypesLoading ? "Saha tipleri yükleniyor..." : fieldTypes.length === 0 && !fieldTypesLoading ? "Saha tipi verisi bulunamadı" : ""}
                >
                  <Select 
                    placeholder="Saha tipi seçin" 
                    loading={fieldTypesLoading}
                    disabled={fieldTypes.length === 0 || fieldTypesError}
                    notFoundContent={fieldTypes.length === 0 ? "Saha tipi verisi bulunamadı" : null}
                  >
                    {fieldTypes && fieldTypes.length > 0 ? (
                      fieldTypes.map(type => (
                        <Option key={type._id} value={type.name}>{type.name}</Option>
                      ))
                    ) : null}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="fieldName"
                  label="Saha Adı"
                  rules={[{ required: true, message: 'Lütfen saha adını girin' }]}
                >
                  <Input placeholder="Saha adını girin" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="loc"
                  label="LOC"
                >
                  <Input placeholder="LOC değerini girin" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sir"
                  label="SIR"
                >
                  <Input placeholder="SIR değerini girin" />
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            
            <Row gutter={24}>
              <Col span={24}>
                <Title level={4} className="mb-4">
                  <UserOutlined className="mr-2" />
                  Proje Sorumluları
                </Title>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="supervisor"
                  label="Supervisor"
                  rules={[{ required: true, message: 'Lütfen supervisor seçin' }]}
                >
                  <Select 
                    placeholder="Supervisor seçin" 
                    loading={isLoadingUsers}
                    notFoundContent={supervisors.length === 0 ? "Supervisor verisi bulunamadı" : null}
                  >
                    {supervisors && supervisors.length > 0 ? (
                      supervisors.map(user => (
                        <Option key={user._id} value={user._id}>{user.fullName}</Option>
                      ))
                    ) : null}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contractor"
                  label="Taşeron"
                  rules={[{ required: true, message: 'Lütfen taşeron seçin' }]}
                >
                  <Select 
                    placeholder="Taşeron seçin" 
                    loading={isLoadingUsers}
                    notFoundContent={contractors.length === 0 ? "Taşeron verisi bulunamadı" : null}
                  >
                    {contractors && contractors.length > 0 ? (
                      contractors.map(user => (
                        <Option key={user._id} value={user._id}>{user.fullName}</Option>
                      ))
                    ) : null}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            
            <Row gutter={24}>
              <Col span={24}>
                <Title level={4} className="mb-4">
                  <FieldTimeOutlined className="mr-2" />
                  Zaman Bilgisi
                </Title>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Proje Tarihi"
                  rules={[{ required: true, message: 'Lütfen proje tarihini seçin' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY" 
                    placeholder="Tarih seçin"
                    locale={locale}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Başlangıç Durumu"
                  initialValue="İşlemde"
                >
                  <Select>
                    <Option value="İşlemde">İşlemde</Option>
                    <Option value="Beklemede">Beklemede</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item className="mt-6 flex justify-end">
              <Space>
                <Button 
                  type="default"
                  onClick={() => navigate(-1)}
                >
                  İptal
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={submitting}
                  disabled={clusterStatus === 'failed' || cities.length === 0}
                >
                  Projeyi Kaydet
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Card>
    </div>
  );
};

export default ProjectNew; 