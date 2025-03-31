import React, { useState, useEffect } from 'react';
import { 
  List, 
  Card, 
  Typography, 
  Space, 
  Button, 
  Tag, 
  Popconfirm, 
  Empty, 
  Spin,
  Tooltip
} from 'antd';
import {
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileZipOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import cdnAdapter from '../utils/cdnAdapter';

const { Title, Text } = Typography;

const FileList = ({ projectId, onDelete, onRefresh, refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dosyaları getir
  const fetchFiles = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const response = await cdnAdapter.getProjectFiles(projectId);
      setFiles(response.files || []);
    } catch (error) {
      console.error('Dosyaları getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh tetikleyicisi veya projectId değiştiğinde dosyaları yeniden getir
  useEffect(() => {
    fetchFiles();
  }, [projectId, refreshTrigger]);

  // Dosya silme
  const handleDeleteFile = async (fileId) => {
    try {
      await cdnAdapter.deleteFile(fileId, projectId);
      // Dosya listesini güncelle
      setFiles(prevFiles => prevFiles.filter(file => file.fileId !== fileId));
      
      if (onDelete && typeof onDelete === 'function') {
        onDelete(fileId);
      }
    } catch (error) {
      console.error('Dosya silme hatası:', error);
    }
  };

  // Dosya türüne göre ikon seçimi
  const getFileIcon = (type) => {
    if (type.includes('image')) return <FileImageOutlined />;
    if (type.includes('pdf')) return <FilePdfOutlined />;
    if (type.includes('zip') || type.includes('rar')) return <FileZipOutlined />;
    return <FileOutlined />;
  };
  
  // Dosya türüne göre tag rengi
  const getFileTypeColor = (type) => {
    if (type.includes('image')) return 'blue';
    if (type.includes('pdf')) return 'red';
    if (type.includes('zip') || type.includes('rar')) return 'purple';
    return 'default';
  };
  
  // Dosya türüne göre kısa isim
  const getFileTypeName = (type) => {
    if (type.includes('image/jpeg')) return 'JPEG';
    if (type.includes('image/png')) return 'PNG';
    if (type.includes('image/gif')) return 'GIF';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('zip')) return 'ZIP';
    if (type.includes('rar')) return 'RAR';
    return type.split('/')[1]?.toUpperCase() || 'DOSYA';
  };
  
  // Dosya boyutunu formatla
  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  // Dosyayı görüntüle veya indir
  const handleViewFile = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
        <div className="mt-3">Dosyalar yükleniyor...</div>
      </div>
    );
  }

  return (
    <Card className="file-list-container">
      <div className="flex justify-between items-center mb-3">
        <Title level={5} className="m-0">Proje Dosyaları</Title>
        {onRefresh && (
          <Button type="link" onClick={onRefresh}>Yenile</Button>
        )}
      </div>

      {files.length === 0 ? (
        <Empty description="Henüz dosya yüklenmemiş" />
      ) : (
        <List
          dataSource={files}
          renderItem={(file) => (
            <List.Item
              key={file.fileId}
              actions={[
                <Tooltip title="Görüntüle">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => handleViewFile(file.fileUrl)}
                  />
                </Tooltip>,
                <Tooltip title="İndir">
                  <Button 
                    icon={<DownloadOutlined />} 
                    size="small"
                    onClick={() => handleViewFile(file.fileUrl)}
                  />
                </Tooltip>,
                <Popconfirm
                  title="Bu dosyayı silmek istediğinizden emin misiniz?"
                  onConfirm={() => handleDeleteFile(file.fileId)}
                  okText="Evet"
                  cancelText="Hayır"
                >
                  <Button 
                    icon={<DeleteOutlined />} 
                    size="small" 
                    danger
                  />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={getFileIcon(file.fileType)}
                title={
                  <Space>
                    <Text>{file.fileName}</Text>
                    <Tag color={getFileTypeColor(file.fileType)}>
                      {getFileTypeName(file.fileType)}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">Boyut: {formatFileSize(file.fileSize)}</Text>
                    <Text type="secondary">
                      Yüklenme: {new Date(file.createdAt).toLocaleString('tr-TR')}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default FileList; 