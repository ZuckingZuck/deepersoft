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
    setTimeout(() => setLogoVisible(true), 300);
    setTimeout(() => setFormVisible(true), 600);
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/auth/login", values);
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      dispatch(userLogin(response.data.user));
      
      message.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      
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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      {/* Arka plan desenleri */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div 
          className={`flex justify-center mb-8 transform ${logoVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'} transition-all duration-700 ease-out`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50"></div>
            <div className="relative bg-white p-6 rounded-full shadow-2xl">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <SafetyOutlined className="text-white text-4xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div 
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform ${formVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} transition-all duration-700 ease-out`}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <Title level={3} className="text-white m-0 flex items-center">
              <LoginOutlined className="mr-3 text-2xl" /> Giriş Yap
            </Title>
            <p className="m-0 mt-2 text-blue-100 text-lg">DeepSoft Yönetim Sistemine hoş geldiniz</p>
          </div>

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
                  className="py-3 rounded-xl border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors"
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
                  className="py-3 rounded-xl border-gray-300 hover:border-blue-500 focus:border-blue-500 transition-colors"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item className="mb-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-lg hover:shadow-xl rounded-xl flex items-center justify-center text-lg font-medium transition-all duration-300 hover:scale-[1.02]"
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

            <div className="text-gray-500 text-sm text-center mt-8 border-t border-gray-100 pt-6">
              <p className="font-medium">© 2023 DeepSoft</p>
              <p className="text-gray-400">Tüm Hakları Saklıdır</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 