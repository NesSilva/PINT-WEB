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

const { Title, Text } = Typography;

const ForumPublicacoes = () => {
    const [publicacoes, setPublicacoes] = useState([]);
    const [todasPublicacoes, setTodasPublicacoes] = useState([]);
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
                api.get('/api/forum/topico/todos/validos', { params }),
                api.get('/api/categorias')
            ]);
            
            const publicacoesComContagem = await Promise.all(
                responsePublicacoes.data.topicos.map(async (topico) => {
                    try {
                        const response = await api.get(`/api/forum/comentario/contar/${topico.id_topico}`);
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
            
            if (!categoriaSelecionada) {
                setTodasPublicacoes(publicacoesComContagem);
            }
            
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

    const getContagemPorCategoria = (idCategoria) => {
        if (!idCategoria) return todasPublicacoes.length;
        return todasPublicacoes.filter(p => p.id_categoria === idCategoria).length;
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    const getCategoriaNome = (idCategoria) => {
        const categoria = categorias.find(c => c.id_categoria === idCategoria);
        return categoria ? categoria.nome : 'Sem categoria';
    };

    const publicacoesFiltradas = categoriaSelecionada 
        ? publicacoes.filter(p => p.id_categoria === categoriaSelecionada)
        : publicacoes;

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
                marginRight: "205px"
            }}>
                
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <div>
                        <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>Fórum de Discussão</Title>
                        <Text type="secondary" style={{ fontSize: '14px', color: '#7f8c8d' }}>
                            {totalTopicos} {totalTopicos === 1 ? 'tópico' : 'tópicos'} disponíveis
                        </Text>
                    </div>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/forumFormador/nova-publicacao')}
                        style={{ 
                            backgroundColor: '#1890ff',
                            borderColor: '#1890ff',
                            fontWeight: 500,
                            height: '40px'
                        }}
                    >
                        Pedir Tópico
                    </Button>
                </div>

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={6}>
                        <Card 
                            title={<span style={{ fontWeight: 500, color: '#2c3e50' }}>Categorias</span>} 
                            bordered={false}
                            headStyle={{ 
                                borderBottom: '1px solid #e8e8e8',
                                padding: '12px 16px'
                            }}
                            bodyStyle={{ padding: 0 }}
                            style={{ 
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                backgroundColor: '#fff'
                            }}
                        >
                            <List
                                size="small"
                                dataSource={[{id_categoria: null, nome: 'Todas'}, ...categorias]}
                                renderItem={categoria => (
                                    <List.Item 
                                        onClick={() => filtrarPorCategoria(categoria.id_categoria)}
                                        style={{
                                            cursor: 'pointer',
                                            background: categoriaSelecionada === categoria.id_categoria ? '#e6f7ff' : 'transparent',
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #f0f0f0',
                                            transition: 'all 0.3s',
                                            margin: '0'
                                        }}
                                    >
                                        <Space>
                                          <FolderOutlined style={{ 
                                              color: categoria.id_categoria ? '#1890ff' : '#7f8c8d',
                                              fontSize: '16px'
                                          }} />
                                          <Text style={{ 
                                              fontWeight: categoriaSelecionada === categoria.id_categoria ? 500 : 'normal',
                                              color: '#2c3e50'
                                          }}>
                                              {categoria.nome}
                                          </Text>
                                          {categoria.id_categoria && (
                                            <Tag 
                                                color={categoriaSelecionada === categoria.id_categoria ? 'blue' : 'default'}
                                                style={{ 
                                                    marginLeft: 'auto',
                                                    borderRadius: '10px'
                                                }}
                                            >
                                              {getContagemPorCategoria(categoria.id_categoria)}
                                            </Tag>
                                          )}
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} md={18}>
                        <Card
                            bordered={false}
                            style={{ 
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                backgroundColor: '#fff'
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <List
                                itemLayout="vertical"
                                size="large"
                                loading={loading}
                                dataSource={publicacoesFiltradas}
                                pagination={{
                                  ...pagination,
                                  showSizeChanger: true,
                                  pageSizeOptions: ['10', '20', '50'],
                                  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} itens`,
                                  onChange: (page, pageSize) => handleTableChange({ ...pagination, current: page, pageSize }),
                                  style: {
                                      padding: '16px 24px',
                                      borderRadius: '0 0 8px 8px',
                                      backgroundColor: '#fff'
                                  }
                                }}
                                locale={{ emptyText: "Nenhuma publicação encontrada." }}
                                renderItem={publicacao => {
                                    const isOwner = String(usuarioId) === String(publicacao.id_utilizador) || isAdmin;
                                    const hasAnexos = publicacao.anexos && publicacao.anexos.length > 0;
                                    const hasImagem = publicacao.imagem_url;
                                    
                                    return (
                                        <List.Item 
                                            key={publicacao.id_topico}
                                            style={{ 
                                                padding: '20px 24px',
                                                borderBottom: '1px solid #f0f0f5'
                                            }}
                                        >
                                            <div>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    marginBottom: '12px',
                                                    alignItems: 'center'
                                                }}>
                                                    <Link 
                                                        to={`/forumFormador/publicacao/${publicacao.id_topico}`}
                                                        style={{ 
                                                            fontSize: '18px',
                                                            fontWeight: 500,
                                                            color: '#1890ff'
                                                        }}
                                                    >
                                                        {publicacao.titulo}
                                                    </Link>
                                                    {publicacao.media_avaliacoes && (
                                                        <Tooltip title={`${publicacao.total_avaliacoes} avaliações`}>
                                                          <Rate
                                                              disabled
                                                              allowHalf
                                                              value={Number(publicacao.media_avaliacoes)}
                                                              style={{ 
                                                                  fontSize: 16, 
                                                                  color: "#faad14",
                                                                  marginLeft: '8px'
                                                              }}
                                                          />
                                                          <span style={{ 
                                                              marginLeft: 4, 
                                                              fontWeight: 500,
                                                              color: '#faad14'
                                                          }}>
                                                            {parseFloat(publicacao.media_avaliacoes).toFixed(1)}
                                                          </span>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                
                                                <Row gutter={16}>
                                                  {hasImagem && (
                                                    <Col xs={24} sm={6}>
                                                      <div 
                                                        style={{
                                                          backgroundImage: `url(${publicacao.imagem_url})`,
                                                          backgroundSize: 'cover',
                                                          backgroundPosition: 'center',
                                                          height: '120px',
                                                          borderRadius: '6px',
                                                          marginBottom: '12px',
                                                          border: '1px solid #f0f0f0'
                                                        }}
                                                      />
                                                    </Col>
                                                  )}
                                                  <Col xs={24} sm={hasImagem ? 18 : 24}>
                                                    <div style={{ 
                                                        marginBottom: '12px',
                                                        color: '#595959',
                                                        lineHeight: '1.6',
                                                        fontSize: '15px'
                                                    }}>
                                                      {publicacao.conteudo?.substring(0, 250)}...
                                                    </div>
                                                    
                                                    {hasAnexos && (
                                                      <Space size="small" style={{ marginBottom: '12px' }}>
                                                        <FileOutlined style={{ color: '#7f8c8d' }} />
                                                        <Text type="secondary" style={{ color: '#7f8c8d' }}>
                                                          {publicacao.anexos.length} {publicacao.anexos.length === 1 ? 'anexo' : 'anexos'}
                                                        </Text>
                                                      </Space>
                                                    )}
                                                    
                                                    <div style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '16px',
                                                        alignItems: 'center',
                                                        marginTop: '16px'
                                                    }}>
                                                      <Space size="small">
                                                        <Avatar 
                                                          size="small" 
                                                          src={publicacao.autor?.avatar_url}
                                                          style={{ 
                                                              backgroundColor: '#1890ff',
                                                              color: '#fff'
                                                          }}
                                                        >
                                                          {publicacao.autor?.nome?.charAt(0)}
                                                        </Avatar>
                                                        <Text type="secondary" style={{ color: '#7f8c8d' }}>{publicacao.autor?.nome}</Text>
                                                      </Space>
                                                      
                                                      <Tag 
                                                          icon={<FolderOutlined />}
                                                          color="blue"
                                                          style={{ 
                                                              margin: 0,
                                                              borderRadius: '4px'
                                                          }}
                                                      >
                                                        {getCategoriaNome(publicacao.id_categoria)}
                                                      </Tag>
                                                      
                                                      <Space size="small">
                                                          <MessageOutlined style={{ color: '#7f8c8d' }} />
                                                          <Text type="secondary" style={{ color: '#7f8c8d' }}>
                                                              {publicacao.total_respostas || 0} {publicacao.total_respostas === 1 ? 'resposta' : 'respostas'}
                                                          </Text>
                                                      </Space>
                                                      
                                                      <Text type="secondary" style={{ color: '#7f8c8d' }}>
                                                          {dayjs(publicacao.data_criacao).fromNow()}
                                                      </Text>
                                                    </div>
                                                  </Col>
                                                </Row>
                                            </div>
                                        </List.Item>
                                    );
                                }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ForumPublicacoes;