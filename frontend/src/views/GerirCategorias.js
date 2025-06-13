import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Modal, Button, Form } from 'react-bootstrap';

const GerenciarCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoriaAtual, setCategoriaAtual] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/categorias');
            setCategorias(response.data.categorias);
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
            setMessage("Erro ao carregar categorias");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (categoriaAtual) {
                // Atualizar categoria existente
                await axios.put(`http://localhost:3000/api/categorias/${categoriaAtual.id_categoria}`, formData);
                setMessage("Categoria atualizada com sucesso!");
            } else {
                // Criar nova categoria
                await axios.post('http://localhost:3000/api/categorias', formData);
                setMessage("Categoria criada com sucesso!");
            }
            setMessageType("success");
            setShowModal(false);
            carregarCategorias();
        } catch (error) {
            console.error("Erro ao salvar categoria:", error);
            setMessage(error.response?.data?.message || "Erro ao salvar categoria");
            setMessageType("error");
        }
    };

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
            await axios.delete(`http://localhost:3000/api/categorias/${categoriaAtual.id_categoria}`);
            setMessage("Categoria deletada com sucesso!");
            setMessageType("success");
            setShowDeleteModal(false);
            carregarCategorias();
        } catch (error) {
            console.error("Erro ao deletar categoria:", error);
            setMessage(error.response?.data?.message || "Erro ao deletar categoria");
            setMessageType("error");
        }
    };

    const handleNewCategory = () => {
        setCategoriaAtual(null);
        setFormData({
            nome: '',
            descricao: ''
        });
        setShowModal(true);
    };

    return (
        <div className="d-flex">
            <Sidebar />
            
            <div className="container-fluid mt-4" style={{ marginLeft: '220px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Gerenciar Categorias</h2>
                    <button className="btn btn-primary" onClick={handleNewCategory}>
                        Nova Categoria
                    </button>
                </div>

                {message && (
                    <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'}`}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <p>Carregando categorias...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped">
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
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => handleEdit(categoria)}
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger"
                                                onClick={() => {
                                                    setCategoriaAtual(categoria);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal para adicionar/editar categoria */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {categoriaAtual ? 'Editar Categoria' : 'Nova Categoria'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Salvar
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Modal de confirmação para exclusão */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar Exclusão</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Tem certeza que deseja excluir a categoria "{categoriaAtual?.nome}"?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Confirmar Exclusão
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default GerenciarCategorias;