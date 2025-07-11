import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  message, 
  Upload, 
  Card, 
  Typography,
  Space,
  Popconfirm
} from 'antd';
import { 
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import Sidebar from "../components/Sidebar";
import '../css/AdminEditarTopico.css';


const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminEditarTopico = () => {
    const { id_topico } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const navigate = useNavigate();
    const [topico, setTopico] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
     

        const carregarDados = async () => {
            try {
                setLoading(true);
                const [responseTopico, responseCategorias] = await Promise.all([
                    axios.get(`/api/forum/topico/${id_topico}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    axios.get('/api/categorias', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                ]);
                
                setTopico(responseTopico.data.topico);
                form.setFieldsValue({
                    titulo: responseTopico.data.topico.titulo,
                    id_categoria: responseTopico.data.topico.id_categoria,
                    conteudo: responseTopico.data.topico.conteudo
                });
                
                if (responseTopico.data.topico.imagem_url) {
                    setFileList([{
                        uid: '-1',
                        name: 'imagem_atual.jpg',
                        status: 'done',
                        url: responseTopico.data.topico.imagem_url
                    }]);
                }
                
                setCategorias(responseCategorias.data.categorias);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar tópico:', error);
                message.error('Erro ao carregar tópico');
                navigate('/admin/forum');
            }
        };
        
        carregarDados();
    }, [id_topico, form, navigate]);

    const beforeUpload = (file) => {
        const newFileList = [{
            uid: file.uid,
            name: file.name,
            status: 'done',
            originFileObj: file
        }];
        setFileList(newFileList);
        return false;
    };

    const onFinish = async (values) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/forum/topico/editar/${id_topico}`, values, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const formData = new FormData();
                formData.append('file', fileList[0].originFileObj);
                formData.append('id_topico', id_topico);
                await axios.post('/api/forum/anexo/topico/anexo', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            message.success('Tópico atualizado com sucesso!');
            navigate('/admin/forum');
        } catch (error) {
            console.error('Erro ao atualizar tópico:', error);
            message.error('Erro ao atualizar tópico');
        }
    };

    const removerTopico = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/forum/topico/remover/${id_topico}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            message.success('Tópico removido com sucesso!');
            navigate('/admin/forum');
        } catch (error) {
            console.error('Erro ao remover tópico:', error);
            message.error('Erro ao remover tópico');
        }
    };

    if (loading && !topico) {
        return (
            <Sidebar>
                <Card loading={true} />
            </Sidebar>
        );
    }

    return (
         <div className="admin-forum-editar-container">
        <Sidebar />
        <div className="main-content">
            <Card loading={loading}>
                <div className="header-section">
                    <Title level={2}>Editar Tópico</Title>
                </div>
                
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="titulo"
                        label="Título"
                        rules={[{ required: true, message: 'Por favor, insira um título!' }]}
                    >
                        <Input placeholder="Título do tópico" />
                    </Form.Item>
                    
                    <Form.Item
                        name="id_categoria"
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
                        <TextArea rows={8} placeholder="Conteúdo do tópico..." />
                    </Form.Item>
                    
                    <Form.Item label="Imagem Principal">
                        <Upload
                            fileList={fileList}
                            beforeUpload={beforeUpload}
                            onRemove={() => setFileList([])}
                            multiple={false}
                            accept="image/*"
                        >
                            <Button icon={<UploadOutlined />}>Selecionar Imagem</Button>
                        </Upload>
                    </Form.Item>
                    
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Salvar Alterações
                        </Button>
                        
                        <Popconfirm
                            title="Tem certeza que deseja remover este tópico?"
                            onConfirm={removerTopico}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Remover Tópico
                            </Button>
                        </Popconfirm>
                    </Space>
                </Form>
            </Card>
            </div>
        </div>
    );
};

export default AdminEditarTopico;