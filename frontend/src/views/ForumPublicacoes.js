import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, List, Rate, Space, Typography, Button, Tag, Row, Col } from 'antd';
import { MessageOutlined, FileOutlined, StarOutlined, PlusOutlined } from '@ant-design/icons';
import Layout from "../components/Layout"; 

const { Title, Text } = Typography;

const ForumPublicacoes = () => {
    const [publicacoes, setPublicacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const [responsePublicacoes, responseCategorias] = await Promise.all([
                    axios.get('/api/forum/publicacoes'),
                    axios.get('http://localhost:3000/api/categorias')
                ]);
                
                setPublicacoes(responsePublicacoes.data.publicacoes);
                setCategorias(responseCategorias.data.categorias);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setLoading(false);
            }
        };

        carregarDados();
    }, []);

    const filtrarPorCategoria = (idCategoria) => {
        setCategoriaSelecionada(idCategoria);
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
                        renderItem={publicacao => (
                            <List.Item
                                key={publicacao.id_publicacao}
                                extra={
                                    <Space direction="vertical" align="center">
                                        <Rate 
                                            disabled 
                                            value={parseFloat(publicacao.media_avaliacoes)} 
                                            allowHalf 
                                        />
                                        <Text>{publicacao.media_avaliacoes} ({publicacao.total_avaliacoes})</Text>
                                    </Space>
                                }
                            >
                                <Card
                                    title={<Link to={`/forum/publicacao/${publicacao.id_publicacao}`}>{publicacao.titulo}</Link>}
                                    style={{ marginBottom: '20px' }}
                                >
                                    <div dangerouslySetInnerHTML={{ __html: publicacao.conteudo.substring(0, 200) + '...' }} />
                                    
                                    <Space style={{ marginTop: '16px' }} size="middle">
                                        <Tag icon={<MessageOutlined />}>{publicacao.ForumComentarios?.length || 0} Comentários</Tag>
                                        <Tag icon={<FileOutlined />}>{publicacao.ForumAnexos?.length || 0} Anexos</Tag>
                                        <Text type="secondary">Postado por: {publicacao.autor.nome}</Text>
                                        <Text type="secondary">Categoria: {publicacao.Categoria.nome}</Text>
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
        </Layout>
    );
};

export default ForumPublicacoes;