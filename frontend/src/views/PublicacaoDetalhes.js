import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Card, 
    List, 
    Rate, 
    Space, 
    Typography, 
    Button, 
    Tag, 
    Form, 
    Input, 
    message, 
    Upload, 
    Row, 
    Col,
    Breadcrumb,
    Divider
} from 'antd';
import { 
    MessageOutlined, 
    FileOutlined, 
    StarOutlined, 
    UploadOutlined,
    HomeOutlined,
    FolderOutlined
} from '@ant-design/icons';
import Layout from "../components/Layout"; 

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PublicacaoDetalhes = () => {
    const { id_publicacao } = useParams();
    const usuarioId = localStorage.getItem('usuarioId'); 
    const [publicacao, setPublicacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comentario, setComentario] = useState('');
    const [avaliacao, setAvaliacao] = useState(0);
    const [usuarioAvaliou, setUsuarioAvaliou] = useState(false);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        const carregarPublicacao = async () => {
            try {
                const response = await axios.get(`/api/forum/publicacao/${id_publicacao}`);
                setPublicacao(response.data.publicacao);
                
                // Verificar se o usuário já avaliou
                const usuarioId = 0; // Obter ID do usuário logado
                // const avaliacaoUsuario = await axios.get(`/api/forum/avaliacao/usuario/${id_publicacao}/${usuarioId}`);
                // setUsuarioAvaliou(avaliacaoUsuario.data.avaliou);
                
                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar publicação:', error);
                setLoading(false);
            }
        };

        carregarPublicacao();
    }, [id_publicacao]);

    const handleComentarioSubmit = async () => {
        try {
            // const usuarioId = ...; // Obter ID do usuário logado
            await axios.post('/api/forum/comentario/adicionar', {
                id_publicacao,
                id_autor: usuarioId,
                conteudo: comentario
            });
            
            message.success('Comentário adicionado com sucesso!');
            setComentario('');
            // Recarregar os comentários
            const response = await axios.get(`/api/forum/publicacao/${id_publicacao}`);
            setPublicacao(response.data.publicacao);
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            message.error('Erro ao adicionar comentário');
        }
    };

    const handleAvaliacaoChange = async (value) => {
        try {
            // const usuarioId = ...; // Obter ID do usuário logado
            await axios.post('/api/forum/avaliacao/adicionar', {
                id_publicacao,
                id_utilizador: usuarioId,
                avaliacao: value
            });
            
            setAvaliacao(value);
            setUsuarioAvaliou(true);
            message.success('Avaliação registrada com sucesso!');
            
            // Recarregar a publicação para atualizar a média
            const response = await axios.get(`/api/forum/publicacao/${id_publicacao}`);
            setPublicacao(response.data.publicacao);
        } catch (error) {
            console.error('Erro ao avaliar publicação:', error);
            message.error('Erro ao avaliar publicação');
        }
    };

    const handleUpload = async (options) => {
        const { file } = options;
        
        try {
            const formData = new FormData();
            formData.append('arquivo', file);
            formData.append('id_publicacao', id_publicacao);
            
            await axios.post('/api/forum/anexo/adicionar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            message.success('Arquivo anexado com sucesso!');
            setFileList([]);
            
            // Recarregar a publicação para mostrar o novo anexo
            const response = await axios.get(`/api/forum/publicacao/${id_publicacao}`);
            setPublicacao(response.data.publicacao);
        } catch (error) {
            console.error('Erro ao anexar arquivo:', error);
            message.error('Erro ao anexar arquivo');
        }
    };

    const handleDenuncia = async (tipo, id) => {
        try {
            // const usuarioId = ...; // Obter ID do usuário logado
            const motivo = prompt('Por favor, informe o motivo da denúncia:');
            
            if (motivo) {
                await axios.post('/api/forum/denuncia/registrar', {
                    [`id_${tipo}`]: id,
                    id_denunciante: usuarioId,
                    motivo
                });
                
                message.success('Denúncia registrada com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao registrar denúncia:', error);
            message.error('Erro ao registrar denúncia');
        }
    };

    if (loading) {
        return <Layout>Carregando...</Layout>;
    }

    if (!publicacao) {
        return <Layout>Publicação não encontrada</Layout>;
    }

    return (
        <Layout>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>
                    <Link to="/"><HomeOutlined /></Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Link to="/forum"><FolderOutlined /> Fórum</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{publicacao.titulo}</Breadcrumb.Item>
            </Breadcrumb>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card
                        title={<Title level={3}>{publicacao.titulo}</Title>}
                        extra={
                            <Space>
                                <Rate 
                                    disabled={usuarioAvaliou}
                                    value={parseFloat(publicacao.media_avaliacoes)} 
                                    onChange={handleAvaliacaoChange}
                                    allowHalf 
                                />
                                <Text>({publicacao.total_avaliacoes} avaliações)</Text>
                            </Space>
                        }
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <Paragraph>
                                <div dangerouslySetInnerHTML={{ __html: publicacao.conteudo }} />
                            </Paragraph>
                            
                            <Space>
                                <Text type="secondary">Autor: {publicacao.autor.nome}</Text>
                                <Text type="secondary">Categoria: {publicacao.Categoria.nome}</Text>
                                <Text type="secondary">Data: {new Date(publicacao.data_publicacao).toLocaleDateString()}</Text>
                                <Button 
                                    type="link" 
                                    danger 
                                    onClick={() => handleDenuncia('publicacao', publicacao.id_publicacao)}
                                >
                                    Denunciar
                                </Button>
                            </Space>
                            
                            {publicacao.ForumAnexos?.length > 0 && (
                                <div>
                                    <Title level={5}>Anexos</Title>
                                    <List
                                        dataSource={publicacao.ForumAnexos}
                                        renderItem={anexo => (
                                            <List.Item>
                                                <a href={anexo.caminho_arquivo} target="_blank" rel="noopener noreferrer">
                                                    <FileOutlined /> {anexo.nome_arquivo}
                                                </a>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            )}
                            
                            <Upload
                                fileList={fileList}
                                customRequest={handleUpload}
                                onChange={({ fileList }) => setFileList(fileList)}
                                beforeUpload={() => false}
                            >
                                <Button icon={<UploadOutlined />}>Anexar Arquivo</Button>
                            </Upload>
                        </Space>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card 
                        title={`Comentários (${publicacao.ForumComentarios?.length || 0})`} 
                        style={{ marginTop: '20px' }}
                    >
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
                                <Button type="primary" htmlType="submit">
                                    Enviar Comentário
                                </Button>
                            </Form.Item>
                        </Form>
                        
                        <Divider />
                        
                        <List
                            dataSource={publicacao.ForumComentarios}
                            renderItem={comentario => (
                                <List.Item
                                    actions={[
                                        <Button 
                                            type="link" 
                                            danger 
                                            onClick={() => handleDenuncia('comentario', comentario.id_comentario)}
                                        >
                                            Denunciar
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<img src={comentario.autor.foto_perfil} alt={comentario.autor.nome} style={{ width: '40px', borderRadius: '50%' }} />}
                                        title={<Text strong>{comentario.autor.nome}</Text>}
                                        description={new Date(comentario.data_comentario).toLocaleString()}
                                    />
                                    <Paragraph>{comentario.conteudo}</Paragraph>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </Layout>
    );
};

export default PublicacaoDetalhes;