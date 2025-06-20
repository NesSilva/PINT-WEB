import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
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

    // Modal denúncia
    const [denunciaModal, setDenunciaModal] = useState(false);
    const [motivoDenuncia, setMotivoDenuncia] = useState('');

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
    const [fileList, setFileList] = useState(null); // no topo

    const handleComentarioSubmit = async () => {
        if (!comentario.trim()) {
            message.error('Digite um comentário!');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('id_topico', id_topico);
            formData.append('conteudo', comentario);
            formData.append('id_utilizador', usuarioId);
            if (fileList && fileList[0]) {
                formData.append('imagem', fileList[0]);
            }
            await axios.post('/api/forum/comentario/criar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Comentário adicionado com sucesso!');
            setComentario('');
            setFileList(null);
            const response = await axios.get(`/api/forum/comentario/${id_topico}`);
            setComentarios(response.data.comentarios);
        } catch {
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

    const curtirComentario = async (id_comentario) => {
    try {
        await axios.post(`/api/forum/comentario/${id_comentario}/like`, { id_utilizador: usuarioId });

        // Atualiza comentários para refletir novo número de likes:
        const response = await axios.get(`/api/forum/comentario/${id_topico}`);
        setComentarios(response.data.comentarios);
    } catch {
        message.error("Erro ao curtir comentário!");
        }
    };

    // Editar tópico (implemente navegação ou modal conforme seu fluxo)
const editarTopico = () => {
    message.info("Função de edição pode abrir um modal ou redirecionar para um formulário.");
    // Exemplo: window.location.href = `/forum/publicacao/${id_topico}?editar=1`;
};

const removerTopico = async () => {
    try {
        await axios.delete(`/api/forum/topico/remover/${id_topico}`);
        message.success("Tópico removido!");
        window.location.href = '/forum';
    } catch {
        message.error("Erro ao remover tópico.");
    }
};

const editarComentario = (comentario) => {
    message.info("Função de editar comentário pode abrir um modal/form.");
    // Exemplo: abrir modal de edição rápida aqui
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
                   <Card title={<Title level={3}>{topico.titulo}</Title>}
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
                                {String(usuarioId) === String(topico.id_utilizador) && (
                                    <>
                                        <Button
                                            type="default"
                                            onClick={() => editarTopico()}
                                            style={{ marginLeft: 8 }}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            danger
                                            onClick={() => removerTopico()}
                                        >
                                            Remover
                                        </Button>
                                    </>
                                )}
                            </Space>
                        }>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {topico.imagem_url && (
                                <img
                                    src={topico.imagem_url}
                                    alt="Anexo"
                                    style={{ maxWidth: '300px', maxHeight: '200px', marginBottom: 16 }}
                                />
                            )}
                            <Paragraph>{topico.conteudo}</Paragraph>
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
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setFileList(e.target.files)}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Enviar Comentário
                                </Button>
                            </Form.Item>
                        </Form>
                        <Divider /> 
                        <List
                        dataSource={[...comentarios].sort((a, b) => (b.likes || 0) - (a.likes || 0))} // Ordena por likes!
                        locale={{ emptyText: 'Nenhum comentário ainda.' }}
                        renderItem={comentario => (
                            <List.Item
                                actions={[
                                    <Button 
                                    type="link" 
                                    onClick={() => curtirComentario(comentario.id_comentario)}
                                    >
                                    Curtir ({comentario.likes})
                                    </Button>,
                                    ...(String(usuarioId) === String(comentario.id_utilizador)
                                        ? [
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
                                            </Button>
                                        ]
                                        : []),
                                    <Button
                                        type="link"
                                        onClick={() => denunciarComentario(comentario.id_comentario)}
                                    >
                                        Denunciar
                                    </Button>
                                ]}
            >
            <List.Item.Meta
                title={<Text strong>{comentario.autor?.nome || comentario.id_utilizador}</Text>}
                description={new Date(comentario.data_criacao).toLocaleString()}
            />
            <Paragraph>{comentario.conteudo}</Paragraph>
            {comentario.imagem_url && (
                <img
                    src={comentario.imagem_url}
                    alt="Comentário Anexo"
                    style={{ maxWidth: '200px', maxHeight: '120px' }}
                />
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
