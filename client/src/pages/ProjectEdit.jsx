// dosya: ProjectEdit.js
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
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ProjectOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/tr_TR';
import api from '../utils/api';
import { fetchAllUsers } from '../redux/userSlice';
import {
  fetchAllClusters,
  setSelectedCity,
  setSelectedCluster,
  clearClusterError,
} from '../redux/clusterSlice';

const { Title } = Typography;
const { Option } = Select;

const ProjectEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const supervisors = useSelector((state) => state.user.supervisors);
  const contractors = useSelector((state) => state.user.contractors);
  const userStatus = useSelector((state) => state.user.userStatus);

  const cities = useSelector((state) => state.cluster.cities);
  const clustersByCity = useSelector((state) => state.cluster.clustersByCity);
  const selectedCity = useSelector((state) => state.cluster.selectedCity);
  const selectedCluster = useSelector((state) => state.cluster.selectedCluster);
  const clusterStatus = useSelector((state) => state.cluster.clusterStatus);
  const clusterError = useSelector((state) => state.cluster.error);

  const [loading, setLoading] = useState(false);
  const [fieldTypes, setFieldTypes] = useState([]);
  const [fieldTypesLoading, setFieldTypesLoading] = useState(false);
  const [fieldTypesError, setFieldTypesError] = useState(null);
  const [availableClusters, setAvailableClusters] = useState([]);
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/api/project/${id}`);
        const data = response.data.project;
        setProject(data);
        console.log(data);
        form.setFieldsValue({
          ...data,
          fieldType: data.fieldType || null,
          contractor: data.contractor?._id || null,
          supervisor: data.supervisor?._id || null,
          date: data.date ? moment(data.date) : null,
        });
        dispatch(setSelectedCity(data.city));
        dispatch(setSelectedCluster(data.clusterId));
      } catch (error) {
        message.error('Proje bilgileri yüklenirken bir hata oluştu');
        navigate('/projects');
      }
    };

    fetchProject();
  }, [id, form, navigate, dispatch]);

  const loadFieldTypes = async () => {
    try {
      setFieldTypesLoading(true);
      setFieldTypesError(null);
      const response = await api.get('/api/definitions/field');
      setFieldTypes(response.data);
    } catch (error) {
      setFieldTypesError('Saha tipi bilgileri yüklenemedi.');
    } finally {
      setFieldTypesLoading(false);
    }
  };

  const reloadClusters = async () => {
    try {
      dispatch(clearClusterError());
      await dispatch(fetchAllClusters()).unwrap();
      message.success('Öbek bilgileri başarıyla yüklendi.');
    } catch (error) {
      message.error('Öbek bilgileri yüklenemedi.');
    }
  };

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        if (userStatus === 'idle') await dispatch(fetchAllUsers()).unwrap();
        if (clusterStatus === 'idle') await dispatch(fetchAllClusters()).unwrap();
        await loadFieldTypes();
      } catch (error) {
        message.error('Gerekli veriler yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [dispatch, userStatus, clusterStatus]);

  useEffect(() => {
    if (selectedCity && clustersByCity[selectedCity]) {
      setAvailableClusters(clustersByCity[selectedCity]);
    } else {
      setAvailableClusters([]);
    }
  }, [selectedCity, clustersByCity]);

  useEffect(() => {
    if (selectedCluster) {
      form.setFieldValue('clusterName', selectedCluster.name);
    }
  }, [selectedCluster, form]);

  const handleCityChange = (city) => {
    dispatch(setSelectedCity(city));
    form.setFieldsValue({ clusterId: undefined, clusterName: undefined });
  };

  const handleClusterChange = (clusterId) => {
    dispatch(setSelectedCluster(clusterId));
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.put(`/api/project/${id}`, {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
      });
      message.success('Proje başarıyla güncellendi');
      navigate(`/projects/${id}`);
    } catch (error) {
      message.error('Proje güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !project) {
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
            <Title level={2} className="m-0">Proje Düzenle</Title>
          </div>
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Geri Dön
          </Button>
        </div>

        {(clusterStatus === 'failed' || fieldTypesError) && (
          <>
            {clusterStatus === 'failed' && (
              <Alert
                message="Öbek Verileri Yüklenemedi"
                description={
                  <>
                    <p>{clusterError || 'API bağlantısı başarısız.'}</p>
                    <Button type="primary" icon={<ReloadOutlined />} onClick={reloadClusters}>
                      Yeniden Dene
                    </Button>
                  </>
                }
                type="error"
                showIcon
                className="mb-4"
              />
            )}
            {fieldTypesError && (
              <Alert
                message="Saha Tipi Verileri Yüklenemedi"
                description={
                  <>
                    <p>{fieldTypesError}</p>
                    <Button type="primary" icon={<ReloadOutlined />} onClick={loadFieldTypes}>
                      Yeniden Dene
                    </Button>
                  </>
                }
                type="error"
                showIcon
                className="mb-4"
              />
            )}
          </>
        )}

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            scrollToFirstError
            requiredMark={false}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Proje Adı" name="name" rules={[{ required: true }]}>
                  <Input placeholder="Proje adı" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Proje Tarihi" name="date">
                  <DatePicker
                    locale={locale}
                    format="YYYY-MM-DD"
                    style={{ width: '100%' }}
                    placeholder="Tarih seç"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Yüklenici" name="contractor">
                  <Select placeholder="Yüklenici seç" allowClear>
                    {contractors.map((c) => (
                      <Option key={c._id} value={c._id}>
                        {c.fullName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Saha Sorumlusu" name="supervisor">
                  <Select placeholder="Saha sorumlusu seç" allowClear>
                    {supervisors.map((s) => (
                      <Option key={s._id} value={s._id}>
                        {s.fullName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Saha Tipi" name="fieldType">
                  <Select placeholder="Saha sorumlusu seç" allowClear>
                    {fieldTypes.map((s) => (
                      <Option key={s._id} value={s.name}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="LOC" name="loc">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="SIR" name="sir">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="DDO" name="ddo">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="homePass" name="homePass" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="tellcordiaNo" name="tellcordiaNo" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="fieldName" name="fieldName" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="clusterName" name="clusterName" rules={[{ required: true }]}>
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>
            <Divider />

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Güncelle
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Card>
    </div>
  );
};

export default ProjectEdit;
