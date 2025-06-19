import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, List, Space, Typography, Button, Tag, Row, Col, Rate, Popconfirm, message } from 'antd';
import { MessageOutlined, FileOutlined, PlusOutlined, EditOutlined, DeleteOutlined, StarFilled } from '@ant-design/icons';
import Layout from "../components/Layout"; 

const { Title, Text } = Typography;

const ForumPublicacoes = () => {
    const [publicacoes, setPublicacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
    const usuarioId = localStorage.getItem('usuarioId');
    const navigate = useNavigate();

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const [responsePublicacoes, responseCategorias] = await Promise.all([
                    axios.get('/api/forum/topico/todos'),
                    axios.get('/api/categorias')
                ]);
                
                setPublicacoes(responsePublicacoes.data.topicos);
                setCategorias(responseCategorias.data.categorias);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };

        carregarDados();
    }, []);

    const filtrarPorCategoria = (idCategoria) => {
        setCategoriaSelecionada(idCategoria);
    };

    const removerTopico = async (id_topico) => {
        try {
            await axios.delete(`/api/forum/topico/remover/${id_topico}`);
            message.success("Tópico removido!");
            setPublicacoes(prev => prev.filter(t => t.id_topico !== id_topico));
        } catch {
            message.error("Erro ao remover tópico");
        }
    };

    const editarTopico = (id_topico) => {
        navigate(`/forum/publicacao/${id_topico}?editar=1`);
    };

    const publicacoesFiltradas = categoriaSelecionada 
        ? publicacoes.filter(p => p.id_categoria === categoriaSelecionada)
        : publicacoes;

    return (
        <Layout>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Title level={2}>Fórum de Discussão</Title>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        href="/forum/nova-publicacao"
                        style={{ marginBottom: 20 }}
                    >
                        Nova Publicação
                    </Button>
                </Col>

                <Col span={6}>
                    <Card title="Categorias" bordered={false}>
                        <List
                            size="small"
                            dataSource={[{id_categoria: null, nome: 'Todas'}, ...categorias]}
                            renderItem={categoria => (
                                <List.Item 
                                    onClick={() => filtrarPorCategoria(categoria.id_categoria)}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: categoriaSelecionada === categoria.id_categoria ? '#f0f0f0' : 'transparent',
                                        padding: '8px 16px'
                                    }}
                                >
                                    {categoria.nome}
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col span={18}>
                    <List
                        itemLayout="vertical"
                        size="large"
                        loading={loading}
                        dataSource={publicacoesFiltradas}
                        locale={{ emptyText: "Nenhuma publicação encontrada." }}
                        renderItem={publicacao => {
                            // Mostra botões só para autor ou admin (coloque o id do admin se quiser liberar geral)
                            const isOwner = String(usuarioId) === String(publicacao.id_utilizador) || usuarioId === "1";
                            return (
                                <List.Item key={publicacao.id_topico}>
                                    <Card
                                        title={<Link to={`/forum/publicacao/${publicacao.id_topico}`}>{publicacao.titulo}</Link>}
                                        style={{ marginBottom: '20px' }}
                                        extra={
                                            <Space>
                                                {/* Média de avaliação, se disponível */}
                                                {publicacao.media_avaliacoes &&
                                                    <span>
                                                        <Rate
                                                            disabled
                                                            allowHalf
                                                            value={Number(publicacao.media_avaliacoes)}
                                                            style={{ fontSize: 16, color: "#faad14" }}
                                                        />
                                                        <span style={{ marginLeft: 4, fontWeight: 500 }}>{parseFloat(publicacao.media_avaliacoes).toFixed(1)}</span>
                                                    </span>
                                                }
                                                {isOwner && (
                                                    <>
                                                        <Button icon={<EditOutlined />} onClick={() => editarTopico(publicacao.id_topico)} />
                                                        <Popconfirm
                                                            title="Remover tópico?"
                                                            onConfirm={() => removerTopico(publicacao.id_topico)}
                                                            okText="Sim"
                                                            cancelText="Não"
                                                        >
                                                            <Button icon={<DeleteOutlined />} danger />
                                                        </Popconfirm>
                                                    </>
                                                )}
                                            </Space>
                                        }
                                    >
                                        <div>
                                            {publicacao.conteudo?.substring(0, 200)}...
                                        </div>
                                        <Space style={{ marginTop: '16px' }} size="middle">
                                            <Text type="secondary">Postado por: {publicacao.autor?.nome}</Text>
                                            <Text type="secondary">Categoria: {publicacao.categoria?.nome}</Text>
                                        </Space>
                                    </Card>
                                </List.Item>
                            );
                        }}
                    />
                </Col>
            </Row>
        </Layout>
    );
};

export default ForumPublicacoes;
