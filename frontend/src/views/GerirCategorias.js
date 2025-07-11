import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Modal, Button, Form , Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import '../css/GerirCategorias.css';

const GerenciarCategorias = () => {
    // Estados
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoriaAtual, setCategoriaAtual] = useState(null);
    const [formData, setFormData] = useState({ nome: '', descricao: '' });
    const [message, setMessage] = useState({ text: '', type: '' });

    // Carregar categorias ao montar o componente
    useEffect(() => {
        carregarCategorias();
    }, []);

    // Função para carregar categorias
    const carregarCategorias = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://backend-8pyn.onrender.com/api/categorias');
            setCategorias(response.data.categorias);
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
            mostrarMensagem("Erro ao carregar categorias", "error");
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
            if (categoriaAtual) {
                await axios.put(
                    `https://backend-8pyn.onrender.com/api/categorias/${categoriaAtual.id_categoria}`, 
                    formData
                );
                mostrarMensagem("Categoria atualizada com sucesso!", "success");
            } else {
                await axios.post('https://backend-8pyn.onrender.com/api/categorias', formData);
                mostrarMensagem("Categoria criada com sucesso!", "success");
            }
            setShowModal(false);
            carregarCategorias();
        } catch (error) {
            console.error("Erro ao salvar categoria:", error);
            mostrarMensagem(
                error.response?.data?.message || "Erro ao salvar categoria", 
                "error"
            );
        }
    };

    // Manipuladores de ações
    const handleEdit = (categoria) => {
        setCategoriaAtual(categoria);
        setFormData({
            nome: categoria.nome,
            descricao: categoria.descricao || ''
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(
                `https://backend-8pyn.onrender.com/api/categorias/${categoriaAtual.id_categoria}`
            );
            mostrarMensagem("Categoria deletada com sucesso!", "success");
            setShowDeleteModal(false);
            carregarCategorias();
        } catch (error) {
            console.error("Erro ao deletar categoria:", error);
            mostrarMensagem(
                error.response?.data?.message || "Erro ao deletar categoria", 
                "error"
            );
        }
    };

    const handleNewCategory = () => {
        setCategoriaAtual(null);
        setFormData({ nome: '', descricao: '' });
        setShowModal(true);
    };

    return (
        <div className="gerenciar-categorias-container">
            <Sidebar />
            
            <main className="main-content">
                <div className="page-header">
                    <h2>Gerenciar Categorias</h2>
                    <Button 
                        variant="primary" 
                        onClick={handleNewCategory}
                        className="new-category-btn"
                    >
                        Nova Categoria
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
                        Carregando categorias...
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="categorias-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Descrição</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorias.map((categoria) => (
                                    <tr key={categoria.id_categoria}>
                                        <td>{categoria.id_categoria}</td>
                                        <td>{categoria.nome}</td>
                                        <td>{categoria.descricao || '-'}</td>
                                        <td className="actions-cell">
                                            <Button 
                                                variant="warning" 
                                                size="sm"
                                                onClick={() => handleEdit(categoria)}
                                                className="action-btn edit-btn"
                                                title="Editar"
                                            >
                                                <FaEdit /> 
                                            </Button>
                                            
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => {
                                                setCategoriaAtual(categoria);
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
                    className="category-modal"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {categoriaAtual ? 'Editar Categoria' : 'Nova Categoria'}
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
                                    as="textarea"
                                    rows={3}
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                />
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
                        Tem certeza que deseja excluir a categoria "{categoriaAtual?.nome}"?
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

export default GerenciarCategorias;