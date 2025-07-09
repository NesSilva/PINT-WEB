import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  List, 
  Space, 
  Typography, 
  Button, 
  Tag, 
  Row, 
  Col, 
  Rate, 
  Popconfirm, 
  message,
  Avatar,
  Tooltip,
  Breadcrumb
} from 'antd';
import { 
  MessageOutlined, 
  FileOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  StarFilled,
  FolderOutlined,
  HomeOutlined
} from '@ant-design/icons';
import Layout from "../components/Layout"; 
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('pt');

const { Title, Text } = Typography;

const ForumPublicacoes = () => {
    const [publicacoes, setPublicacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
    const [totalTopicos, setTotalTopicos] = useState(0);
    const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 10,
      total: 0
    });
    const usuarioId = localStorage.getItem('usuarioId');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const navigate = useNavigate();

    useEffect(() => {
        carregarDados();
    }, [categoriaSelecionada, pagination.current]);

    const carregarDados = async () => {
    try {
        setLoading(true);
        const params = {
            pagina: pagination.current,
            limite: pagination.pageSize,
            id_categoria: categoriaSelecionada || undefined
        };

        const [responsePublicacoes, responseCategorias] = await Promise.all([
            axios.get('/api/forum/topico/todos/validos', { params }),
            axios.get('/api/categorias')
        ]);
        
        // Buscar contagem de comentários para cada tópico
        const publicacoesComContagem = await Promise.all(
    responsePublicacoes.data.topicos.map(async (topico) => {
        try {
            const response = await axios.get(`/api/forum/comentario/contar/${topico.id_topico}`);
            return {
                ...topico,
                total_respostas: response.data.total_respostas || 0
            };
        } catch (error) {
            return {
                ...topico,
                total_respostas: 0
            };
        }
    })
);
        
        setPublicacoes(publicacoesComContagem);
        setTotalTopicos(responsePublicacoes.data.total || 0);
        setCategorias(responseCategorias.data.categorias);
        setPagination(prev => ({
            ...prev,
            total: responsePublicacoes.data.total || 0
        }));
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        message.error("Erro ao carregar publicações");
    } finally {
        setLoading(false);
    }
};

    const filtrarPorCategoria = (idCategoria) => {
        setCategoriaSelecionada(idCategoria);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const removerTopico = async (id_topico) => {
        try {
            await axios.delete(`/api/forum/topico/remover/${id_topico}`);
            message.success("Tópico removido com sucesso!");
            carregarDados(); // Recarrega a lista
        } catch (error) {
            console.error("Erro ao remover tópico:", error);
            message.error(error.response?.data?.message || "Erro ao remover tópico");
        }
    };

    const editarTopico = (id_topico) => {
        navigate(`/forum/publicacao/${id_topico}/editar`);
    };

    const handleTableChange = (pagination) => {
      setPagination(pagination);
    };

    const getCategoriaNome = (idCategoria) => {
      const categoria = categorias.find(c => c.id_categoria === idCategoria);
      return categoria ? categoria.nome : 'Sem categoria';
    };

    return (
        <Layout>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Breadcrumb
                items={[
                  { title: <Link to="/"><HomeOutlined /></Link> },
                  { title: <><FolderOutlined /> Fórum</> }
                ]}
              />

              <Row gutter={[16, 16]}>
                  <Col span={24}>
                      <Title level={2} style={{ marginBottom: 0 }}>Fórum de Discussão</Title>
                      <Text type="secondary">{totalTopicos} {totalTopicos === 1 ? 'tópico' : 'tópicos'}</Text>
                      
                      <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => navigate('/forum/nova-publicacao')}
                          style={{ marginTop: 16, float: 'right' }}
                      >
                          Pedido de criação de tópico
                      </Button>
                  </Col>

                  <Col xs={24} md={6}>
                      <Card 
                        title="Categorias" 
                        bordered={false}
                        bodyStyle={{ padding: 0 }}
                      >
                          <List
                              size="small"
                              dataSource={[{id_categoria: null, nome: 'Todas'}, ...categorias]}
                              renderItem={categoria => (
                                  <List.Item 
                                      onClick={() => filtrarPorCategoria(categoria.id_categoria)}
                                      style={{
                                          cursor: 'pointer',
                                          backgroundColor: categoriaSelecionada === categoria.id_categoria ? '#f0f0f0' : 'transparent',
                                          padding: '8px 16px',
                                          borderBottom: '1px solid #f0f0f0'
                                      }}
                                  >
                                      <Space>
                                        <FolderOutlined style={{ color: categoria.id_categoria ? '#1890ff' : '#999' }} />
                                        <Text>{categoria.nome}</Text>
                                        {categoria.id_categoria && (
                                          <Tag style={{ marginLeft: 'auto' }}>
                                            {publicacoes.filter(p => p.id_categoria === categoria.id_categoria).length}
                                          </Tag>
                                        )}
                                      </Space>
                                  </List.Item>
                              )}
                          />
                      </Card>
                  </Col>

                  <Col xs={24} md={18}>
                      <List
                          itemLayout="vertical"
                          size="large"
                          loading={loading}
                          dataSource={publicacoes}
                          pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} itens`,
                            onChange: (page, pageSize) => handleTableChange({ ...pagination, current: page, pageSize })
                          }}
                          locale={{ emptyText: "Nenhuma publicação encontrada." }}
                          renderItem={publicacao => {
                              const isOwner = String(usuarioId) === String(publicacao.id_utilizador) || isAdmin;
                              const hasAnexos = publicacao.anexos && publicacao.anexos.length > 0;
                              const hasImagem = publicacao.imagem_url;
                              
                              return (
                                  <List.Item key={publicacao.id_topico}>
                                      <Card
                                          title={<Link to={`/forum/publicacao/${publicacao.id_topico}`}>{publicacao.titulo}</Link>}
                                          style={{ marginBottom: '20px' }}
                                          extra={
                                              <Space>
                                                  {publicacao.media_avaliacoes && (
                                                      <Tooltip title={`${publicacao.total_avaliacoes} avaliações`}>
                                                        <Rate
                                                            disabled
                                                            allowHalf
                                                            value={Number(publicacao.media_avaliacoes)}
                                                            style={{ fontSize: 16, color: "#faad14" }}
                                                        />
                                                        <span style={{ marginLeft: 4, fontWeight: 500 }}>
                                                          {parseFloat(publicacao.media_avaliacoes).toFixed(1)}
                                                        </span>
                                                      </Tooltip>
                                                  )}
                                                 
                                              </Space>
                                          }
                                      >
                                          <Row gutter={16}>
                                            {hasImagem && (
                                              <Col xs={24} sm={6}>
                                                <div 
                                                  style={{
                                                    backgroundImage: `url(${publicacao.imagem_url})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    height: 120,
                                                    borderRadius: 4,
                                                    marginBottom: 8
                                                  }}
                                                />
                                              </Col>
                                            )}
                                            <Col xs={24} sm={hasImagem ? 18 : 24}>
                                              <div style={{ marginBottom: 12 }}>
                                                {publicacao.conteudo?.substring(0, 250)}...
                                              </div>
                                              
                                              {hasAnexos && (
                                                <Space size="small" style={{ marginBottom: 12 }}>
                                                  <FileOutlined />
                                                  <Text type="secondary">
                                                    {publicacao.anexos.length} {publicacao.anexos.length === 1 ? 'anexo' : 'anexos'}
                                                  </Text>
                                                </Space>
                                              )}
                                              
                                              <Space size="middle" wrap>
                                                <Space size="small">
                                                  <Avatar 
                                                    size="small" 
                                                    src={publicacao.autor?.avatar_url}
                                                    style={{ backgroundColor: '#1890ff' }}
                                                  >
                                                    {publicacao.autor?.nome?.charAt(0)}
                                                  </Avatar>
                                                  <Text type="secondary">{publicacao.autor?.nome}</Text>
                                                </Space>
                                                
                                                <Tag icon={<FolderOutlined />}>
                                                  {getCategoriaNome(publicacao.id_categoria)}
                                                </Tag>
                                                
                                                
                                                
                                                <Space size="small">
                                                    <MessageOutlined />
                                                    <Text type="secondary">
                                                        {publicacao.total_respostas || 0} {publicacao.total_respostas === 1 ? 'resposta' : 'respostas'}
                                                    </Text>
                                                </Space>
                                              </Space>
                                            </Col>
                                          </Row>
                                      </Card>
                                  </List.Item>
                              );
                          }}
                      />
                  </Col>
              </Row>
            </Space>
        </Layout>
    );
};

export default ForumPublicacoes;