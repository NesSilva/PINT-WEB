import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Form, 
    Input, 
    Button, 
    Select, 
    message, 
    Upload, 
    Typography, 
    Row, 
    Col,
    Card,
    Breadcrumb
} from 'antd';
import { 
    UploadOutlined, 
    HomeOutlined, 
    FolderOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import axios from 'axios';
import Layout from "../components/Layout"; 
import { Link } from 'react-router-dom';
import { Space } from 'antd';

const { Title } = Typography;
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
                const response = await axios.get('https://backend-8pyn.onrender.com/api/categorias');
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
            const response = await axios.post('https://backend-8pyn.onrender.com/api/forum/topico/criar', {
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
                        'https://backend-8pyn.onrender.com/api/forum/anexo/topico/anexo', 
                        formData, 
                        config
                    );
                    message.success('File uploaded successfully!');
                } catch (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    message.warning('Post created but there was an error uploading the file');
                }
            }

            message.success('Post created successfully!');
            navigate(`/forum/publicacao/${response.data.topico.id_topico}`);
        } catch (error) {
            console.error('Error creating post:', error);
            const errorMsg = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Error creating post';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload = (file) => {
        // Validate file size (e.g., 10MB limit)
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('File must be smaller than 10MB!');
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
        <div style={{background: '#f8f9fa'}}>
        <Layout style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ 
                marginLeft: 100, 
                minHeight: 'calc(100vh - 50px)',
                marginLeft: -100,
                background: '#f8f9fa',
            }}>
                <div style={{ 
                    maxWidth: 3000,
                    margin: '0 auto',
                    paddingTop: 10 
                }}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <Link to="/"><HomeOutlined /></Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Link to="/forum"><FolderOutlined /> Fórum</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Nova Publicação</Breadcrumb.Item>
                    </Breadcrumb>

                    <Row justify="center" style={{ marginTop: 24 }}>
                        <Col xs={24} md={24} lg={24} xl={22}>
                            <Card
                                title={
                                    <Space>
                                        <Button 
                                            type="text" 
                                            icon={<ArrowLeftOutlined />} 
                                            onClick={() => navigate('/forum')}
                                        />
                                        <Title level={4} style={{ margin: 0 }}>Nova Publicação</Title>
                                    </Space>
                                }
                                style={{ borderRadius: 8, width: '100%' }}
                            >
                                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                                    <Form.Item
                                        name="titulo"
                                        label="Título"
                                        rules={[{ required: true, message: 'Por favor, insira um título!' }]}
                                    >
                                        <Input placeholder="Título da publicação" />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="categoria"
                                        label="Categoria"
                                        rules={[{ required: true, message: 'Por favor, selecione uma categoria!' }]}
                                    >
                                        <Select placeholder="Selecione uma categoria">
                                            {categorias.map(categoria => (
                                                <Option key={categoria.id_categoria} value={categoria.id_categoria}>
                                                    {categoria.nome}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="conteudo"
                                        label="Conteúdo"
                                        rules={[{ required: true, message: 'Por favor, insira o conteúdo!' }]}
                                    >
                                        <TextArea rows={8} placeholder="Escreva seu conteúdo aqui..." />
                                    </Form.Item>
                                    
                                    <Form.Item label="Anexar Arquivo">
                                        <Upload
                                            fileList={fileList}
                                            beforeUpload={beforeUpload}
                                            onRemove={onRemove}
                                            multiple={false}
                                            accept="*" // Accept all file types
                                        >
                                            <Button icon={<UploadOutlined />}>Selecionar Arquivo</Button>
                                        </Upload>
                                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                                            Tipos permitidos: qualquer tipo de arquivo (máx. 10MB)
                                        </div>
                                    </Form.Item>
                                    
                                    <Form.Item>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            loading={loading}
                                            block
                                            size="large"
                                        >
                                            Publicar
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </Layout>
        </div>
    );
};

export default NovaPublicacao;