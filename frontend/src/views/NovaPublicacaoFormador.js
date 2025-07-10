import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Upload, 
  Typography, 
  Row, 
  Col,
  Space,
  Tag,
  message,
  Breadcrumb
} from 'antd';
import { 
  UploadOutlined, 
  HomeOutlined, 
  FolderOutlined,
  ArrowLeftOutlined,
  FileOutlined
} from '@ant-design/icons';
import axios from 'axios';
import SidebarFormador from "../components/SidebarFormador";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const NovaPublicacao = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [fileList, setFileList] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const carregarCategorias = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/categorias');
                setCategorias(response.data.categorias);
            } catch (error) {
                console.error('Erro ao carregar categorias:', error);
                message.error('Erro ao carregar categorias');
            }
        };
        carregarCategorias();
    }, []);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const usuarioId = localStorage.getItem('usuarioId');

            if (!usuarioId) {
                message.error('Usuário não autenticado!');
                setLoading(false);
                return;
            }

            // 1. Create the topic first (without file)
            const response = await axios.post('http://localhost:3000/api/forum/topico/criar', {
                id_autor: usuarioId,
                id_categoria: values.categoria,
                titulo: values.titulo,
                conteudo: values.conteudo
            });

            // 2. If there's a file, upload it separately
            if (fileList.length > 0 && fileList[0].originFileObj) {
                try {
                    const formData = new FormData();
                    formData.append('file', fileList[0].originFileObj);
                    formData.append('id_topico', response.data.topico.id_topico);
                    
                    const config = {
                        headers: { 
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}` 
                        }
                    };
                    
                    await axios.post(
                        'http://localhost:3000/api/forum/anexo/topico/anexo', 
                        formData, 
                        config
                    );
                    message.success('Ficheiro carregado com sucesso!');
                } catch (uploadError) {
                    console.error('Erro ao carregar ficheiro:', uploadError);
                    message.warning('Publicação criada mas houve um erro ao carregar o ficheiro');
                }
            }

            message.success('Publicação criada com sucesso!');
            navigate(`/forumFormador/publicacao/${response.data.topico.id_topico}`);
        } catch (error) {
            console.error('Erro ao criar publicação:', error);
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Erro ao criar publicação';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload = (file) => {
        // Validate file size (e.g., 10MB limit)
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('O ficheiro deve ser menor que 10MB!');
            return false;
        }

        const newFileList = [{
            uid: file.uid,
            name: file.name,
            status: 'done',
            originFileObj: file
        }];
        setFileList(newFileList);
        return false;
    };

    const onRemove = () => {
        setFileList([]);
    };

    return (
        <div style={{ 
            display: 'flex', 
            backgroundColor: "#f0f2f5",
            position: 'relative',
            minHeight: '100vh'
        }}>
            <SidebarFormador />
            <div style={{ 
                flex: 1, 
                padding: "24px", 
                maxWidth: "1000px", 
                marginRight: "205px"
            }}>
                <Breadcrumb style={{ marginBottom: '24px' }}>
                   
                    <Breadcrumb.Item>
                        <Link to="/forumFormador"><FolderOutlined /> Fórum</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Pedir tópico</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <div>
                        <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>Pedir tópico</Title>
                        <Text type="secondary" style={{ fontSize: '14px', color: '#7f8c8d' }}>
                            Preencha os campos abaixo para Pedir tópico
                        </Text>
                    </div>
                    <Button 
                        type="default" 
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/forumFormador')}
                        style={{ 
                            fontWeight: 500,
                            height: '40px'
                        }}
                    >
                        Voltar
                    </Button>
                </div>

                <Card
                    bordered={false}
                    style={{ 
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        backgroundColor: '#fff'
                    }}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            name="titulo"
                            label={<Text strong style={{ color: '#2c3e50' }}>Título</Text>}
                            rules={[{ required: true, message: 'Por favor, insira um título!' }]}
                        >
                            <Input 
                                placeholder="Título da publicação" 
                                style={{ padding: '10px' }}
                            />
                        </Form.Item>
                        
                        <Form.Item
                            name="categoria"
                            label={<Text strong style={{ color: '#2c3e50' }}>Categoria</Text>}
                            rules={[{ required: true, message: 'Por favor, selecione uma categoria!' }]}
                        >
                            <Select 
                                placeholder="Selecione uma categoria"
                                style={{ width: '100%' }}
                                dropdownStyle={{ borderRadius: '8px' }}
                            >
                                {categorias.map(categoria => (
                                    <Option key={categoria.id_categoria} value={categoria.id_categoria}>
                                        <Space>
                                            <FolderOutlined style={{ color: '#1890ff' }} />
                                            {categoria.nome}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        
                        <Form.Item
                            name="conteudo"
                            label={<Text strong style={{ color: '#2c3e50' }}>Conteúdo</Text>}
                            rules={[{ required: true, message: 'Por favor, insira o conteúdo!' }]}
                        >
                            <TextArea 
                                rows={8} 
                                placeholder="Escreva seu conteúdo aqui..." 
                                style={{ padding: '10px' }}
                            />
                        </Form.Item>
                        
                        <Form.Item label={<Text strong style={{ color: '#2c3e50' }}>Anexar Arquivo</Text>}>
                            <Upload
                                fileList={fileList}
                                beforeUpload={beforeUpload}
                                onRemove={onRemove}
                                multiple={false}
                                accept="*" // Accept all file types
                            >
                                <Button 
                                    icon={<UploadOutlined />}
                                    style={{
                                        backgroundColor: '#f0f2f5',
                                        borderColor: '#d9d9d9',
                                        color: '#2c3e50'
                                    }}
                                >
                                    Selecionar Arquivo
                                </Button>
                            </Upload>
                            {fileList.length > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    <Tag 
                                        icon={<FileOutlined />}
                                        color="blue"
                                        style={{ 
                                            margin: 0,
                                            borderRadius: '4px',
                                            padding: '4px 8px'
                                        }}
                                    >
                                        {fileList[0].name}
                                    </Tag>
                                </div>
                            )}
                            <Text type="secondary" style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
                                Tipos permitidos: qualquer tipo de arquivo (máx. 10MB)
                            </Text>
                        </Form.Item>
                        
                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                size="large"
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    fontWeight: '500',
                                    fontSize: '16px'
                                }}
                            >
                                Publicar
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default NovaPublicacao;