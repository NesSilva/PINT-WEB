import React, { useState, useEffect } from 'react';
import { 
  Button, 
  message, 
  Popconfirm, 
  Typography, 
  Card, 
  Input, 
  Modal,
  Form,
  Select,
  Upload,
  Divider,
  Tag,
  Alert,
  Space,
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import Sidebar from "../components/Sidebar";
import { useNavigate } from 'react-router-dom';
import '../css/AdminForum.css';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

// Configuração do axios com URL base
const API_BASE_URL = 'https://backend-8pyn.onrender.com/';
const api = axios.create({
  baseURL: API_BASE_URL
});

const AdminForum = () => {
    const [topicos, setTopicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [isImage, setIsImage] = useState(true);
    const [messageApi, setMessageApi] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [responseTopicos, responseCategorias] = await Promise.all([
                api.get('/api/forum/topico/todos'),
                api.get('/api/categorias')
            ]);
            setTopicos(responseTopicos.data.topicos);
            setCategorias(responseCategorias.data.categorias);
            setLoading(false);
        } catch (error) {
            mostrarMensagem('Erro ao carregar dados', 'error');
            setLoading(false);
        }
    };

    const mostrarMensagem = (text, type) => {
        setMessageApi({ text, type });
        setTimeout(() => setMessageApi({ text: '', type: '' }), 5000);
    };

    const validarTopico = async (id_topico, validar) => {
        try {
            await api.patch(`/api/forum/topico/${id_topico}/validar`, { valido: validar });
            mostrarMensagem(`Tópico ${validar ? 'validado' : 'invalidado'} com sucesso!`, 'success');
            carregarDados();
        } catch (error) {
            mostrarMensagem('Erro ao atualizar estado do tópico', 'error');
        }
    };

    const criarTopico = async (values) => {
        try {
            const usuarioId = localStorage.getItem('usuarioId');
            const response = await api.post('/api/forum/topico/criar', {
                ...values,
                id_autor: usuarioId,
                valido: true
            });

            if (fileList.length > 0) {
                const formData = new FormData();
                formData.append('file', fileList[0].originFileObj);
                formData.append('id_topico', response.data.topico.id_topico);
                formData.append('isImage', isImage.toString());
                
                await api.post('/api/forum/anexo/topico/anexo', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            mostrarMensagem('Tópico criado com sucesso!', 'success');
            setModalVisible(false);
            form.resetFields();
            setFileList([]);
            carregarDados();
        } catch (error) {
            mostrarMensagem('Erro ao criar tópico', 'error');
        }
    };

    const editarTopico = (id_topico) => {
        navigate(`/admin/forum/editar/${id_topico}`);
    };

    const removerTopico = async (id_topico) => {
        try {
            await api.delete(`/api/forum/topico/remover/${id_topico}`);
            mostrarMensagem('Tópico removido com sucesso!', 'success');
            carregarDados();
        } catch (error) {
            mostrarMensagem('Erro ao remover tópico', 'error');
        }
    };

    const beforeUpload = (file) => {
        const isImageFile = file.type.startsWith('image/');
        setIsImage(isImageFile);
        
        const newFileList = [{
            uid: file.uid,
            name: file.name,
            status: 'done',
            originFileObj: file,
            type: file.type
        }];
        setFileList(newFileList);
        return false;
    };

    const filteredTopicos = topicos.filter(topico => 
        topico.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
        (topico.autor?.nome && topico.autor.nome.toLowerCase().includes(searchText.toLowerCase()))
    );

    return (
        <div className="admin-forum-container">
            <Sidebar />
            <div className="admin-forum-content">
                <Card className="admin-forum-card">
                    <div className="admin-forum-header">
                        <Title level={2} className="admin-forum-title">Moderação do Fórum</Title>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => setModalVisible(true)}
                            className="create-topic-button"
                        >
                            Criar Tópico
                        </Button>
                    </div>
                    
                    <Divider className="admin-forum-divider" />
                    
                    {messageApi.text && (
                        <Alert 
                            type={messageApi.type} 
                            message={messageApi.text}
                            showIcon
                            closable
                            className="status-message"
                        />
                    )}
                    
                    <div className="search-container">
                        <Search
                            placeholder="Pesquisar tópicos..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onChange={(e) => setSearchText(e.target.value)}
                            className="forum-search-input"
                        />
                    </div>

                    {loading ? (
                        <div className="loading-message">
                            Carregando tópicos...
                        </div>
                    ) : (
                        <div className="forum-table-container">
                            <table className="forum-table">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Autor</th>
                                        <th>Categoria</th>
                                        <th>Data</th>
                                        <th>Estado</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTopicos.map(topico => (
                                        <tr key={topico.id_topico}>
                                            <td>
                                                <a href={`/forum/publicacao/${topico.id_topico}`} target="_blank" rel="noopener noreferrer">
                                                    {topico.titulo}
                                                </a>
                                            </td>
                                            <td>{topico.autor?.nome || 'N/A'}</td>
                                            <td>{topico.categoria?.nome || 'N/A'}</td>
                                            <td>{new Date(topico.data_criacao).toLocaleDateString('pt-PT')}</td>
                                            <td>
                                                <span className={`status-badge ${topico.valido ? 'valid' : 'pending'}`}>
                                                    {topico.valido ? 'Validado' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                {!topico.valido && (
                                                    <Popconfirm
                                                        title="Validar este tópico?"
                                                        onConfirm={() => validarTopico(topico.id_topico, true)}
                                                        okText="Sim"
                                                        cancelText="Não"
                                                    >
                                                        <Button 
                                                            type="primary" 
                                                            className="action-btn validate-btn"
                                                            icon={<CheckOutlined />}
                                                        />
                                                    </Popconfirm>
                                                )}
                                                {topico.valido && (
                                                    <Popconfirm
                                                        title="Invalidar este tópico?"
                                                        onConfirm={() => validarTopico(topico.id_topico, false)}
                                                        okText="Sim"
                                                        cancelText="Não"
                                                    >
                                                        <Button 
                                                            danger 
                                                            className="action-btn invalidate-btn"
                                                            icon={<CloseOutlined />}
                                                        />
                                                    </Popconfirm>
                                                )}
                                                <Button 
                                                    className="action-btn edit-btn"
                                                    icon={<EditOutlined />}
                                                    onClick={() => editarTopico(topico.id_topico)}
                                                />
                                                <Popconfirm
                                                    title="Remover este tópico?"
                                                    onConfirm={() => removerTopico(topico.id_topico)}
                                                    okText="Sim"
                                                    cancelText="Não"
                                                >
                                                    <Button 
                                                        danger 
                                                        className="action-btn delete-btn"
                                                        icon={<DeleteOutlined />}
                                                    />
                                                </Popconfirm>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <Modal
                        title="Criar Novo Tópico"
                        visible={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        footer={null}
                        width={800}
                        className="forum-modal"
                        destroyOnClose
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={criarTopico}
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
                                <TextArea rows={6} placeholder="Conteúdo do tópico..." />
                            </Form.Item>
                            
                            <Form.Item label="Anexo (Imagem ou Documento)">
                                <Upload
                                    fileList={fileList}
                                    beforeUpload={beforeUpload}
                                    onRemove={() => setFileList([])}
                                    multiple={false}
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                >
                                    <Button icon={<UploadOutlined />}>Selecionar Arquivo</Button>
                                </Upload>
                                <div style={{ marginTop: 8, fontSize: 12 }}>
                                    Formatos suportados: imagens, PDF, Word, Excel, PowerPoint, TXT
                                </div>
                            </Form.Item>
                            
                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        Criar Tópico
                                    </Button>
                                    <Button onClick={() => setModalVisible(false)}>
                                        Cancelar
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Card>
            </div>
        </div>
    );
};

export default AdminForum;