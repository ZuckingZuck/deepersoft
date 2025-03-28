import React, { useState, useEffect } from "react";
import { Form, Input, Button, Alert, Typography, Spin, message } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined, SafetyOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userLogin, fetchAllUsers } from "../redux/userSlice";
import { fetchAllClusters } from "../redux/clusterSlice";
import api from "../utils/api";

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoVisible, setLogoVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Logo ve form animasyonu için
    setTimeout(() => setLogoVisible(true), 300);
    setTimeout(() => setFormVisible(true), 600);
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/auth/login", values);
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Redux'a kullanıcı bilgilerini ekle
      dispatch(userLogin(response.data.user));
      
      message.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      
      // Kullanıcı listesini ve öbek verilerini Redux'a yükle
      let dataLoadError = false;
      try {
        await dispatch(fetchAllUsers()).unwrap();
        await dispatch(fetchAllClusters()).unwrap();
      } catch (err) {
        dataLoadError = true;
        console.warn('Veri yüklenirken hata oluştu:', err);
        message.warning('Bazı API verileri yüklenemedi. Proje oluşturma ekranı için API bağlantısının aktif olduğundan emin olun.');
      }
      
      setTimeout(() => {
        navigate("/");
        if (dataLoadError) {
          setTimeout(() => {
            message.info('Veri yükleme hatası oluştu, lütfen API bağlantınızı kontrol edin.');
          }, 500);
        }
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message || "Giriş yapılırken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-800 to-blue-600 items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 overflow-hidden">
        <div className="absolute w-96 h-96 -top-12 -left-12 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute w-96 h-96 bottom-0 right-0 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-md z-10">
        {/* Logo ve Animasyon */}
        <div 
          className={`flex justify-center mb-8 transform ${logoVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'} transition-all duration-700 ease-out`}
        >
          <div className="bg-white p-5 rounded-full shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full">
              <SafetyOutlined className="text-white text-3xl" />
            </div>
          </div>
        </div>
        
        <div 
          className={`bg-white rounded-lg shadow-2xl overflow-hidden transform ${formVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} transition-all duration-700 ease-out`}
        >
          {/* Başlık */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 py-5 px-7 text-white">
            <Title level={3} className="text-white m-0 flex items-center">
              <LoginOutlined className="mr-3" /> Giriş Yap
            </Title>
            <p className="m-0 mt-2 text-blue-100">DeepSoft Yönetim Sistemine hoş geldiniz</p>
          </div>
          
          {/* Form */}
          <div className="p-8">
            {error && (
              <Alert
                message="Giriş Hatası"
                description={error}
                type="error"
                showIcon
                className="mb-6 animate__animated animate__headShake"
              />
            )}

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="login-form"
            >
              <Form.Item
                name="userName"
                rules={[{ required: true, message: "Lütfen kullanıcı adınızı girin!" }]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon text-gray-400" />}
                  placeholder="Kullanıcı Adı"
                  className="py-3 rounded-lg"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Lütfen şifrenizi girin!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon text-gray-400" />}
                  placeholder="Şifre"
                  className="py-3 rounded-lg"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item className="mb-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 border-none shadow-md hover:shadow-lg rounded-lg flex items-center justify-center text-lg"
                  loading={loading}
                >
                  {loading ? (
                    <Spin />
                  ) : (
                    <>
                      <LoginOutlined className="mr-2" /> Giriş Yap
                    </>
                  )}
                </Button>
              </Form.Item>
            </Form>
            
            <div className="text-gray-500 text-sm text-center mt-6 border-t border-gray-100 pt-4">
              <p>© 2023 DeepSoft Tüm Hakları Saklıdır</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 