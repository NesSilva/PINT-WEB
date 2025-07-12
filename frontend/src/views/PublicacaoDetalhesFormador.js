import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { UploadOutlined, FileOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Upload, Avatar, Modal, Spin } from 'antd';
import {
    Card,
    List,
    Space,
    Typography,
    Button,
    Row,
    Col,
    Breadcrumb,
    Divider,
    Form,
    Input,
    message,
    Rate,
    Tag
} from 'antd';
import {
    HomeOutlined,
    FolderOutlined,
    MessageOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import SidebarFormador from "../components/SidebarFormador";
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import relativeTime from 'dayjs/plugin/relativeTime';

// Configuração do axios com URL base
const API_BASE_URL = 'https://backend-8pyn.onrender.com/';
const api = axios.create({
  baseURL: API_BASE_URL
});

dayjs.extend(relativeTime);
dayjs.locale('pt');

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PublicacaoDetalhes = () => {
    const { id_publicacao } = useParams();
    const id_topico = id_publicacao;
    const usuarioId = localStorage.getItem('usuarioId');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const [topico, setTopico] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comentario, setComentario] = useState('');
    const [comentarios, setComentarios] = useState([]);
    const [avaliacao, setAvaliacao] = useState(0);
    const [fileList, setFileList] = useState([]);
    const [denunciaModal, setDenunciaModal] = useState(false);
    const [motivoDenuncia, setMotivoDenuncia] = useState('');
    const [anexosTopico, setAnexosTopico] = useState([]);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                setLoading(true);
                const [responseTopico, responseComentarios] = await Promise.all([
                    api.get(`/api/forum/topico/${id_topico}`),
                    api.get(`/api/forum/comentario/${id_topico}`)
                ]);

                setTopico(responseTopico.data.topico);
                setComentarios(responseComentarios.data.comentarios);

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                message.error("Erro ao carregar publicação");
            } finally {
                setLoading(false);
            }
        };
        carregarDados();
    }, [id_topico, usuarioId]);

    useEffect(() => {
        const carregarAnexosTopico = async () => {
            try {
                const response = await api.get(`/api/forum/anexo/${id_topico}/anexos`);
                setAnexosTopico(response.data.anexos);
            } catch (error) {
                console.error('Erro ao carregar anexos:', error);
                setAnexosTopico([]);
            }
        };
        if (topico) carregarAnexosTopico();
    }, [topico, id_topico]);

    const handleComentarioSubmit = async () => {
        if (!comentario.trim()) {
            message.error('Digite um comentário!');
            return;
        }
        
        try {
            const responseComentario = await api.post('/api/forum/comentario/criar', {
                id_topico,
                conteudo: comentario,
                id_utilizador: usuarioId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const id_comentario = responseComentario.data.comentario.id_comentario;

            if (fileList.length > 0) {
                const formData = new FormData();
                formData.append('file', fileList[0].originFileObj);
                formData.append('id_comentario', id_comentario);
                
                await api.post('/api/forum/anexo/comentario/anexo', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }
            
            message.success('Comentário adicionado com sucesso!');
            setComentario('');
            setFileList([]);
            
            const response = await api.get(`/api/forum/comentario/${id_topico}`);
            setComentarios(response.data.comentarios);
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            message.error('Erro ao adicionar comentário');
        }
    };

    const handleAvaliacao = async (value) => {
        try {
            setAvaliacao(value);
            await api.post('/api/forum/topico/avaliar', {
                id_topico,
                id_utilizador: usuarioId,
                nota: value
            });
            message.success('Avaliação registrada!');
        } catch {
            message.error('Erro ao avaliar tópico');
        }
    };

    const abrirModalDenuncia = () => setDenunciaModal(true);
    const enviarDenuncia = async () => {
        if (!motivoDenuncia.trim()) {
            message.error('Digite o motivo da denúncia');
            return;
        }
        try {
            await api.post('/api/forum/topico/denunciar', {
                id_topico,
                id_utilizador: usuarioId,
                motivo: motivoDenuncia
            });
            setDenunciaModal(false);
            setMotivoDenuncia('');
            message.success('Denúncia registrada!');
        } catch {
            message.error('Erro ao registrar denúncia');
        }
    };

    const removerComentario = async (id_comentario) => {
        try {
            await api.delete(`/api/forum/comentario/remover/${id_comentario}`);
            message.success("Comentário removido!");
            setComentarios(c => c.filter(cm => cm.id_comentario !== id_comentario));
        } catch {
            message.error("Erro ao remover comentário.");
        }
    };

    const denunciarComentario = (id_comentario) => {
        Modal.confirm({
            title: "Denunciar comentário",
            icon: <ExclamationCircleOutlined />,
            content: (
                <TextArea
                    rows={4}
                    placeholder="Explique o motivo da denúncia..."
                    onChange={e => setMotivoDenuncia(e.target.value)}
                />
            ),
            onOk: async () => {
                try {
                    await api.post('/api/forum/comentario/denunciar', {
                        id_comentario,
                        id_utilizador: usuarioId,
                        motivo: motivoDenuncia
                    });
                    setMotivoDenuncia('');
                    message.success('Denúncia registrada!');
                } catch {
                    message.error('Erro ao registrar denúncia!');
                }
            }
        });
    };

    if (loading || !topico) {
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
                    marginLeft: "405px",
                    width: "100%",
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

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
                marginRight: "205px",
                width: "100%"
            }}>
                <Breadcrumb
                    items={[
                        { title: <Link to="/forumFormador"><FolderOutlined /> Fórum</Link> },
                        { title: topico?.titulo || 'Publicação' }
                    ]}
                    style={{ marginBottom: '24px' }}
                />

                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card 
                            style={{ 
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                backgroundColor: '#fff'
                            }}
                        >
                            <div style={{ marginBottom: '16px' }}>
                                <Title level={3} style={{ marginBottom: '8px' }}>{topico?.titulo || 'Título não disponível'}</Title>
                                
                                <Space size="middle" style={{ marginBottom: '16px' }}>
                                    <Space size="small">
                                        <Avatar 
                                            size="small" 
                                            src={topico?.autor?.avatar_url}
                                            style={{ backgroundColor: '#1890ff' }}
                                        >
                                            {topico?.autor?.nome?.charAt(0) || '?'}
                                        </Avatar>
                                        <Text>{topico?.autor?.nome || topico?.id_utilizador || 'Autor desconhecido'}</Text>
                                    </Space>
                                    
                                    <Tag icon={<FolderOutlined />} color="blue">
                                        {topico?.categoria?.nome || topico?.id_categoria || 'Sem categoria'}
                                    </Tag>
                                    
                                    <Text type="secondary">
                                        {topico?.data_criacao ? dayjs(topico.data_criacao).format('DD/MM/YYYY HH:mm') : 'Data desconhecida'}
                                    </Text>
                                </Space>
                                
                                <Rate 
                                    allowClear 
                                    value={avaliacao} 
                                    onChange={handleAvaliacao} 
                                    style={{ 
                                        color: '#faad14',
                                        marginBottom: '16px'
                                    }} 
                                />
                                
                                <Paragraph style={{ 
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    color: '#595959'
                                }}>
                                    {topico?.conteudo || 'Conteúdo não disponível'}
                                </Paragraph>
                                
                                {anexosTopico.length > 0 && (
                                    <div style={{ marginTop: '24px' }}>
                                        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Anexos:</Text>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                            {anexosTopico.map(anexo => (
                                                <div key={anexo.id_anexo} style={{ maxWidth: '200px' }}>
                                                    {anexo.tipo_arquivo.startsWith('image/') ? (
                                                        <img
                                                            src={anexo.url}
                                                            alt={anexo.nome_arquivo}
                                                            style={{ 
                                                                maxWidth: '100%', 
                                                                maxHeight: '120px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #f0f0f0'
                                                            }}
                                                        />
                                                    ) : (
                                                        <a 
                                                            href={anexo.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                padding: '8px',
                                                                border: '1px solid #d9d9d9',
                                                                borderRadius: '4px',
                                                                background: '#fafafa',
                                                                color: '#595959'
                                                            }}
                                                        >
                                                            <FileOutlined style={{ marginRight: '8px' }} />
                                                            <Text ellipsis style={{ maxWidth: '150px' }}>
                                                                {anexo.nome_arquivo}
                                                            </Text>
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'flex-end',
                                    marginTop: '16px'
                                }}>
                                    <Button
                                        type="link"
                                        icon={<ExclamationCircleOutlined />}
                                        danger
                                        onClick={abrirModalDenuncia}
                                    >
                                        Denunciar publicação
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    
                    <Col span={24}>
                        <Card
                            title={`Comentários (${comentarios.length})`}
                            style={{ 
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                backgroundColor: '#fff'
                            }}
                        >
                            <Form onFinish={handleComentarioSubmit}>
                                <Form.Item>
                                    <TextArea
                                        rows={4}
                                        value={comentario}
                                        onChange={e => setComentario(e.target.value)}
                                        placeholder="Adicione um comentário..."
                                        style={{ borderRadius: '6px' }}
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Space>
                                        <Upload
                                            fileList={fileList}
                                            beforeUpload={(file) => {
                                                const newFileList = [{
                                                    uid: file.uid,
                                                    name: file.name,
                                                    status: 'done',
                                                    originFileObj: file
                                                }];
                                                setFileList(newFileList);
                                                return false;
                                            }}
                                            onRemove={() => setFileList([])}
                                            multiple={false}
                                            accept="image/*,.pdf,.doc,.docx"
                                        >
                                            <Button icon={<UploadOutlined />}>Anexar Arquivo</Button>
                                        </Upload>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit"
                                            style={{ borderRadius: '6px' }}
                                        >
                                            Enviar Comentário
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                            
                            <Divider style={{ margin: '16px 0' }} />
                            
                            <List
                                dataSource={comentarios}
                                locale={{ emptyText: 'Nenhum comentário ainda.' }}
                                renderItem={comentario => (
                                    <List.Item
                                        style={{ 
                                            padding: '16px 0',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                        actions={[
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<ExclamationCircleOutlined />}
                                                onClick={() => denunciarComentario(comentario.id_comentario)}
                                            >
                                                Denunciar
                                            </Button>,
                                            ...(String(usuarioId) === String(comentario.id_utilizador) || isAdmin ? [
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => message.info("Edição de comentário")}
                                                >
                                                    Editar
                                                </Button>,
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removerComentario(comentario.id_comentario)}
                                                >
                                                    Remover
                                                </Button>
                                            ] : [])
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    src={comentario.autor?.avatar_url}
                                                    style={{ backgroundColor: '#1890ff' }}
                                                >
                                                    {comentario.autor?.nome?.charAt(0)}
                                                </Avatar>
                                            }
                                            title={
                                                <Space>
                                                    <Text strong>{comentario.autor?.nome || comentario.id_utilizador}</Text>
                                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                                        {dayjs(comentario.data_criacao).fromNow()}
                                                    </Text>
                                                </Space>
                                            }
                                            description={
                                                <Paragraph style={{ 
                                                    margin: '8px 0 0',
                                                    color: '#595959'
                                                }}>
                                                    {comentario.conteudo}
                                                </Paragraph>
                                            }
                                        />
                                        
                                        {comentario.anexos?.length > 0 && (
                                            <div style={{ marginTop: '12px' }}>
                                                <Text strong style={{ fontSize: '14px' }}>Anexos:</Text>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                                    {comentario.anexos.map(anexo => (
                                                        <div key={anexo.id_anexo} style={{ maxWidth: '180px' }}>
                                                            {anexo.tipo_arquivo.startsWith('image/') ? (
                                                                <img
                                                                    src={anexo.url}
                                                                    alt={anexo.nome_arquivo}
                                                                    style={{ 
                                                                        maxWidth: '100%', 
                                                                        maxHeight: '100px',
                                                                        borderRadius: '4px',
                                                                        border: '1px solid #f0f0f0'
                                                                    }}
                                                                />
                                                            ) : (
                                                                <a 
                                                                    href={anexo.url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        padding: '6px',
                                                                        border: '1px solid #d9d9d9',
                                                                        borderRadius: '4px',
                                                                        background: '#fafafa',
                                                                        color: '#595959',
                                                                        fontSize: '13px'
                                                                    }}
                                                                >
                                                                    <FileOutlined style={{ marginRight: '6px' }} />
                                                                    <Text ellipsis style={{ maxWidth: '120px' }}>
                                                                        {anexo.nome_arquivo}
                                                                    </Text>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>

                <Modal
                    title={<><ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} /> Denunciar tópico</>}
                    open={denunciaModal}
                    onOk={enviarDenuncia}
                    onCancel={() => setDenunciaModal(false)}
                    okText="Enviar denúncia"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                >
                    <TextArea
                        rows={4}
                        placeholder="Explique o motivo da denúncia..."
                        value={motivoDenuncia}
                        onChange={e => setMotivoDenuncia(e.target.value)}
                        style={{ marginTop: '16px' }}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default PublicacaoDetalhes;