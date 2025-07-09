import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import { Upload, Avatar } from 'antd';
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
    Modal
} from 'antd';
import {
    HomeOutlined,
    FolderOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import Layout from "../components/Layout";
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PublicacaoDetalhes = () => {
    const { id_publicacao } = useParams();
    const id_topico = id_publicacao;
    const usuarioId = localStorage.getItem('usuarioId');

    const [topico, setTopico] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comentario, setComentario] = useState('');
    const [comentarios, setComentarios] = useState([]);
    const [avaliacao, setAvaliacao] = useState(0);
    const [fileList, setFileList] = useState([]);

    // Modal denúncia
    const [denunciaModal, setDenunciaModal] = useState(false);
    const [motivoDenuncia, setMotivoDenuncia] = useState('');
    const [anexosTopico, setAnexosTopico] = useState([]);

    useEffect(() => {
        const carregarTopico = async () => {
            try {
                const response = await axios.get(`/api/forum/topico/${id_topico}`);
                setTopico(response.data.topico);
                setLoading(false);
            } catch (error) {
                setTopico(null);
                setLoading(false);
            }
        };
        carregarTopico();
    }, [id_topico]);

    useEffect(() => {
    const carregarAnexosTopico = async () => {
        try {
            const response = await axios.get(`/api/forum/anexo/${id_topico}/anexos`);
            console.log('Anexos recebidos (frontend):', response.data.anexos); // <-- AQUI
            setAnexosTopico(response.data.anexos);
        } catch (error) {
            console.error('Erro ao carregar anexos:', error);
            setAnexosTopico([]);
        }
    };
    if (topico) carregarAnexosTopico();
}, [topico, id_topico]);

    useEffect(() => {
        const carregarComentarios = async () => {
            try {
                const response = await axios.get(`/api/forum/comentario/${id_topico}`);
                setComentarios(response.data.comentarios);
            } catch (error) {
                setComentarios([]);
            }
        };
        if (topico) carregarComentarios();
    }, [topico, id_topico]);

    // Envio de comentário
    const handleComentarioSubmit = async () => {
        if (!comentario.trim()) {
            message.error('Digite um comentário!');
            return;
        }
        
        try {
            // 1. Primeiro cria o comentário (sem anexo)
            const responseComentario = await axios.post('/api/forum/comentario/criar', {
                id_topico,
                conteudo: comentario,
                id_utilizador: usuarioId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const id_comentario = responseComentario.data.comentario.id_comentario;

            // 2. Se houver anexo, enviar em requisição separada
            if (fileList.length > 0) {
                const formData = new FormData();
                formData.append('file', fileList[0].originFileObj);
                formData.append('id_comentario', id_comentario);
                
                await axios.post('/api/forum/anexo/comentario/anexo', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }
            
            message.success('Comentário adicionado com sucesso!');
            setComentario('');
            setFileList([]);
            
            // Recarrega os comentários
            const response = await axios.get(`/api/forum/comentario/${id_topico}`);
            setComentarios(response.data.comentarios);
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            message.error('Erro ao adicionar comentário');
        }
    };

    // Handler de avaliação
    const handleAvaliacao = async (value) => {
        try {
            setAvaliacao(value);
            await axios.post('/api/forum/topico/avaliar', {
                id_topico,
                id_utilizador: usuarioId,
                nota: value
            });
            message.success('Avaliação registrada!');
        } catch {
            message.error('Erro ao avaliar tópico');
        }
    };

    // Handler de denúncia
    const abrirModalDenuncia = () => setDenunciaModal(true);
    const enviarDenuncia = async () => {
        if (!motivoDenuncia.trim()) {
            message.error('Digite o motivo da denúncia');
            return;
        }
        try {
            await axios.post('/api/forum/topico/denunciar', {
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

    
    const editarComentario = (comentario) => {
        message.info("Função de editar comentário pode abrir um modal/form.");
    };

    const removerComentario = async (id_comentario) => {
        try {
            await axios.delete(`/api/forum/comentario/remover/${id_comentario}`);
            message.success("Comentário removido!");
            setComentarios(c => c.filter(cm => cm.id_comentario !== id_comentario));
        } catch {
            message.error("Erro ao remover comentário.");
        }
    };

    const denunciarComentario = (id_comentario) => {
        Modal.confirm({
            title: "Denunciar comentário",
            content: (
                <Input.TextArea
                    rows={4}
                    placeholder="Explique o motivo da denúncia..."
                    onChange={e => setMotivoDenuncia(e.target.value)}
                />
            ),
            onOk: async () => {
                try {
                    await axios.post('/api/forum/comentario/denunciar', {
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

    if (loading) return <Layout>Carregando...</Layout>;
    if (!topico) return <Layout>Publicação não encontrada</Layout>;

    return (
        <Layout>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>
                    <Link to="/"><HomeOutlined /></Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Link to="/forum"><FolderOutlined /> Fórum</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{topico.titulo}</Breadcrumb.Item>
            </Breadcrumb>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card 
                        title={<Title level={3}>{topico.titulo}</Title>}
                        extra={
                            <Space>
                                <Rate allowClear value={avaliacao} onChange={handleAvaliacao} />
                                <Button
                                    type="link"
                                    icon={<ExclamationCircleOutlined />}
                                    danger
                                    onClick={abrirModalDenuncia}
                                >
                                    Denunciar
                                </Button>
                               
                            </Space>
                        }
                    >
                       <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Paragraph>{topico.conteudo}</Paragraph>
                    
                    {/* Seção de anexos do tópico */}
                    {anexosTopico.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <Text strong>Anexos:</Text>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                {anexosTopico.map(anexo => (
                                    <div key={anexo.id_anexo} style={{ maxWidth: 200 }}>
                                        {anexo.tipo_arquivo.startsWith('image/') ? (
                                            <img
                                                src={anexo.url}
                                                alt={anexo.nome_arquivo}
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    maxHeight: 150,
                                                    borderRadius: 4,
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
                                                    padding: 8,
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 4,
                                                    background: '#fafafa'
                                                }}
                                            >
                                                <FileOutlined style={{ marginRight: 8 }} />
                                                {anexo.nome_arquivo}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <Space>
                        <Text type="secondary">Autor: {topico.autor?.nome || topico.id_utilizador}</Text>
                        <Text type="secondary">Categoria: {topico.categoria?.nome || topico.id_categoria}</Text>
                        <Text type="secondary">Data: {new Date(topico.data_criacao).toLocaleDateString()}</Text>
                    </Space>
                </Space>
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title={`Comentários (${comentarios.length})`} style={{ marginTop: '20px' }}>
                        <Form onFinish={handleComentarioSubmit}>
                            <Form.Item>
                                <TextArea
                                    rows={4}
                                    value={comentario}
                                    onChange={e => setComentario(e.target.value)}
                                    placeholder="Adicione um comentário..."
                                />
                            </Form.Item>
                            <Form.Item>
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
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Enviar Comentário
                                </Button>
                            </Form.Item>
                        </Form>
                        <Divider />
                        <List
                            dataSource={comentarios}
                            locale={{ emptyText: 'Nenhum comentário ainda.' }}
                            renderItem={comentario => (
                                <List.Item
                                    actions={String(usuarioId) === String(comentario.id_utilizador) ? [
                                        <Button
                                            type="link"
                                            onClick={() => editarComentario(comentario)}
                                        >
                                            Editar
                                        </Button>,
                                        <Button
                                            type="link"
                                            danger
                                            onClick={() => removerComentario(comentario.id_comentario)}
                                        >
                                            Remover
                                        </Button>,
                                        <Button
                                            type="link"
                                            onClick={() => denunciarComentario(comentario.id_comentario)}
                                        >
                                            Denunciar
                                        </Button>
                                    ] : [
                                        <Button
                                            type="link"
                                            onClick={() => denunciarComentario(comentario.id_comentario)}
                                        >
                                            Denunciar
                                        </Button>
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
                                        title={<Text strong>{comentario.autor?.nome || comentario.id_utilizador}</Text>}
                                        description={dayjs(comentario.data_criacao).format('DD/MM/YYYY HH:mm')}
                                    />
                                    <Paragraph style={{ marginTop: 8 }}>{comentario.conteudo}</Paragraph>
                                    
                                    {/* Seção de anexos */}
                                    {comentario.anexos?.length > 0 && (
                                        <div style={{ marginTop: 16 }}>
                                            <Text strong>Anexos:</Text>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                                {comentario.anexos.map(anexo => (
                                                    <div key={anexo.id_anexo} style={{ maxWidth: 200 }}>
                                                        {anexo.tipo_arquivo.startsWith('image/') ? (
                                                            <img
                                                                src={anexo.url}
                                                                alt={anexo.nome_arquivo}
                                                                style={{ 
                                                                    maxWidth: '100%', 
                                                                    maxHeight: 150,
                                                                    borderRadius: 4,
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
                                                                    padding: 8,
                                                                    border: '1px solid #d9d9d9',
                                                                    borderRadius: 4,
                                                                    background: '#fafafa'
                                                                }}
                                                            >
                                                                <FileOutlined style={{ marginRight: 8 }} />
                                                                {anexo.nome_arquivo}
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
                title="Denunciar tópico"
                open={denunciaModal}
                onOk={enviarDenuncia}
                onCancel={() => setDenunciaModal(false)}
                okText="Enviar denúncia"
                cancelText="Cancelar"
            >
                <Input.TextArea
                    rows={4}
                    placeholder="Explique o motivo da denúncia..."
                    value={motivoDenuncia}
                    onChange={e => setMotivoDenuncia(e.target.value)}
                />
            </Modal>
        </Layout>
    );
};

export default PublicacaoDetalhes;