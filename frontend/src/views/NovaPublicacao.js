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
            message.error('Utilizador não autenticado! Faça login novamente.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('id_autor', usuarioId);
        formData.append('id_categoria', values.categoria);
        formData.append('titulo', values.titulo);
        formData.append('conteudo', values.conteudo);

        // Verifique os arquivos antes de enviar
        console.log('Arquivos a serem enviados:', fileList);
        
        fileList.forEach((file, index) => {
            if (file.originFileObj) {
                formData.append(`anexos`, file.originFileObj);
            } else {
                console.warn(`Arquivo na posição ${index} não tem originFileObj`);
            }
        });

        const response = await axios.post('http://localhost:3000/api/forum/publicacao/criar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        message.success('Publicação criada com sucesso!');
        navigate(`/forum/publicacao/${response.data.publicacao.id_publicacao}`);
    } catch (error) {
        console.error('Erro detalhado:', error.response?.data || error.message);
        message.error(error.response?.data?.message || 'Erro ao criar publicação');
        setLoading(false);
    }
};
    // Configuração do upload antes de enviar
    const beforeUpload = (file) => {
        // Adiciona o arquivo à lista sem fazer upload automático
        setFileList(prev => [...prev, file]);
        return false; // Impede o upload automático
    };

    const onRemove = (file) => {
        setFileList(prev => prev.filter(f => f.uid !== file.uid));
    };

    return (
        <Layout>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>
                    <Link to="/"><HomeOutlined /></Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Link to="/forum"><FolderOutlined /> Fórum</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Nova Publicação</Breadcrumb.Item>
            </Breadcrumb>

            <Row justify="center">
                <Col xs={24} md={18} lg={14}>
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
                            
                            <Form.Item label="Anexos">
                                <Upload
                                    fileList={fileList}
                                    beforeUpload={beforeUpload}
                                    onRemove={onRemove}
                                    multiple
                                >
                                    <Button icon={<UploadOutlined />}>Selecionar Arquivos</Button>
                                </Upload>
                            </Form.Item>
                            
                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading}
                                    block
                                >
                                    Publicar
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Layout>
    );
};

export default NovaPublicacao;