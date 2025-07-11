import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import '../css/GerirAreasFormacao.css';

const GerirAreasFormacao = () => {
    // Estados
    const [areas, setAreas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [areaAtual, setAreaAtual] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        id_categoria: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    // Carregar dados ao montar o componente
    useEffect(() => {
        carregarDados();
    }, []);

    // Função para carregar áreas e categorias
    const carregarDados = async () => {
        try {
            setLoading(true);
            const [areasRes, categoriasRes] = await Promise.all([
                axios.get('https://backend-8pyn.onrender.com/api/areas-formacao'),
                axios.get('https://backend-8pyn.onrender.com/api/categorias')
            ]);
            
            setAreas(areasRes.data.areas);
            setCategorias(categoriasRes.data.categorias);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            mostrarMensagem("Erro ao carregar dados", "error");
        } finally {
            setLoading(false);
        }
    };

    // Manipulador de mensagens
    const mostrarMensagem = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    // Manipuladores de formulário
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (areaAtual) {
                await axios.put(
                    `https://backend-8pyn.onrender.com/api/areas-formacao/${areaAtual.id_area}`, 
                    formData
                );
                mostrarMensagem("Área atualizada com sucesso!", "success");
            } else {
                await axios.post(
                    'https://backend-8pyn.onrender.com/api/areas-formacao', 
                    formData
                );
                mostrarMensagem("Área criada com sucesso!", "success");
            }
            setShowModal(false);
            carregarDados();
        } catch (error) {
            console.error("Erro ao salvar área:", error);
            mostrarMensagem(
                error.response?.data?.message || "Erro ao salvar área", 
                "error"
            );
        }
    };

    // Manipuladores de ações
    const handleEdit = (area) => {
        setAreaAtual(area);
        setFormData({
            nome: area.nome,
            descricao: area.descricao || '',
            id_categoria: area.id_categoria
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(
                `https://backend-8pyn.onrender.com/api/areas-formacao/${areaAtual.id_area}`
            );
            mostrarMensagem("Área deletada com sucesso!", "success");
            setShowDeleteModal(false);
            carregarDados();
        } catch (error) {
            console.error("Erro ao deletar área:", error);
            mostrarMensagem(
                error.response?.data?.message || "Erro ao deletar área", 
                "error"
            );
        }
    };

    const handleNewArea = () => {
        setAreaAtual(null);
        setFormData({
            nome: '',
            descricao: '',
            id_categoria: ''
        });
        setShowModal(true);
    };

    return (
        <div className="gerenciar-areas-container">
            <Sidebar />
            
            <main className="main-content">
                <div className="page-header">
                    <h2>Gerenciar Áreas de Formação</h2>
                    <Button 
                        variant="primary" 
                        onClick={handleNewArea}
                        className="new-area-btn"
                    >
                        Nova Área
                    </Button>
                </div>

                {message.text && (
                    <Alert 
                        variant={message.type === 'success' ? 'success' : 'danger'}
                        className="status-message"
                    >
                        {message.text}
                    </Alert>
                )}

                {loading ? (
                    <div className="loading-message">
                        Carregando áreas de formação...
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="areas-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {areas.map((area) => (
                                    <tr key={area.id_area}>
                                        <td>{area.id_area}</td>
                                        <td>{area.nome}</td>
                                        <td>{area.descricao || '-'}</td>
                                        <td>{area.Categoria?.nome || 'N/A'}</td>
                                        <td className="actions-cell">
                                            <Button 
                                                variant="warning" 
                                                size="sm"
                                                onClick={() => handleEdit(area)}
                                                className="action-btn edit-btn"
                                                title="Editar"
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => {
                                                setAreaAtual(area);
                                                setShowDeleteModal(true);
                                                }}
                                                className="action-btn delete-btn"
                                                title="Excluir"
                                            >
                                                <FaTrash />
                                            </Button>
                                            </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal de edição/criação */}
                <Modal 
                    show={showModal} 
                    onHide={() => setShowModal(false)}
                    className="area-modal"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {areaAtual ? 'Editar Área' : 'Nova Área de Formação'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="form-group">
                                <Form.Label>Nome*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control
                                    rows={3}
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Label>Categoria*</Form.Label>
                                <Form.Select
                                    name="id_categoria"
                                    value={formData.id_categoria}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categorias.map((categoria) => (
                                        <option 
                                            key={categoria.id_categoria} 
                                            value={categoria.id_categoria}
                                        >
                                            {categoria.nome}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <div className="modal-footer-buttons">
                                <Button 
                                    variant="primary" 
                                    type="submit"
                                    className="submit-btn"
                                >
                                    Salvar
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Modal de confirmação de exclusão */}
                <Modal 
                    show={showDeleteModal} 
                    onHide={() => setShowDeleteModal(false)}
                    className="delete-modal"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar Exclusão</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Tem certeza que deseja excluir a área "{areaAtual?.nome}"?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowDeleteModal(false)}
                            className="cancel-btn"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={handleDelete}
                            className="confirm-delete-btn"
                        >
                            Confirmar Exclusão
                        </Button>
                    </Modal.Footer>
                </Modal>
            </main>
        </div>
    );
};

export default GerirAreasFormacao;