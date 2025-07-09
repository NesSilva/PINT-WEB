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
      message.error('Usuário não autenticado!');
      setLoading(false);
      return;
    }

    // 1. Criar o tópico primeiro (sem imagem)
    const response = await axios.post('http://localhost:3000/api/forum/topico/criar', {
      id_autor: usuarioId,
      id_categoria: values.categoria,
      titulo: values.titulo,
      conteudo: values.conteudo
    });

    console.log('Tamanho :--------------', fileList.length);
    console.log('Ficheiros::-------------', fileList[0].originFileObj);
    console.log('FileList atualizado:', fileList);
    
    // 2. Se houver imagem, enviar em requisição separada
    if (fileList.length > 0 && fileList[0].originFileObj) {
      try {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        formData.append('id_topico', response.data.topico.id_topico);
        
        // Adicione headers para autenticação se necessário
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
        console.log('Imagem enviada com sucesso');
        message.success('Imagem adicionada com sucesso!');
      } catch (uploadError) {
        console.log('Erro ao enviar imagem:', uploadError);
        console.error('Erro no upload da imagem:', uploadError);
        message.warning('Publicação criada, mas houve um erro ao enviar a imagem');
      }
    }

    message.success('Publicação criada com sucesso!');
    console.log('Publicação criada:', response.data.topico.id_topico);
    navigate(`/forum/publicacao/${response.data.topico.id_topico}`);
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
    console.log('Arquivo recebido no beforeUpload:', file); // <-- LOG AQUI
    // Mantém a estrutura esperada pelo Ant Design
    const newFileList = [{
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file
    }];
    console.log('Novo fileList definido:', newFileList); // <-- LOG AQUI
    setFileList(newFileList);
    return false;
};

    const onRemove = () => {
        setFileList([]);
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
                            
                            <Form.Item label="Imagem Principal">
                                <Upload
                                    fileList={fileList}
                                    beforeUpload={beforeUpload}
                                    onRemove={onRemove}
                                    multiple={false}
                                    accept="image/*"
                                >
                                    <Button icon={<UploadOutlined />}>Selecionar Imagem</Button>
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