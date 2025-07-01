import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const GerirAreasFormacao = () => {
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
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        carregarDados();
    }, []);

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
            setMessage("Erro ao carregar dados");
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
            if (areaAtual) {
                await axios.put(`https://backend-8pyn.onrender.com/api/areas-formacao/${areaAtual.id_area}`, formData);
                setMessage("Área atualizada com sucesso!");
            } else {
                await axios.post('https://backend-8pyn.onrender.com/api/areas-formacao', formData);
                setMessage("Área criada com sucesso!");
            }
            setMessageType("success");
            setShowModal(false);
            carregarDados();
        } catch (error) {
            console.error("Erro ao salvar área:", error);
            setMessage(error.response?.data?.message || "Erro ao salvar área");
            setMessageType("error");
        }
    };

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
            await axios.delete(`https://backend-8pyn.onrender.com/api/areas-formacao/${areaAtual.id_area}`);
            setMessage("Área deletada com sucesso!");
            setMessageType("success");
            setShowDeleteModal(false);
            carregarDados();
        } catch (error) {
            console.error("Erro ao deletar área:", error);
            setMessage(error.response?.data?.message || "Erro ao deletar área");
            setMessageType("error");
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
        <div className="d-flex">
            <Sidebar />
            
            <div className="container-fluid mt-4" style={{ marginLeft: '220px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Gerenciar Áreas de Formação</h2>
                    <button className="btn btn-primary" onClick={handleNewArea}>
                        Nova Área
                    </button>
                </div>

                {message && (
                    <Alert variant={messageType === 'success' ? 'success' : 'danger'}>
                        {message}
                    </Alert>
                )}

                {loading ? (
                    <p>Carregando áreas de formação...</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped">
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
                                        <td>
                                            {area.Categoria?.nome || 'N/A'}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => handleEdit(area)}
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger"
                                                onClick={() => {
                                                    setAreaAtual(area);
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

                {/* Modal para adicionar/editar área */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {areaAtual ? 'Editar Área' : 'Nova Área de Formação'}
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
                            <Form.Group className="mb-3">
                                <Form.Label>Categoria*</Form.Label>
                                <Form.Select
                                    name="id_categoria"
                                    value={formData.id_categoria}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                            {categoria.nome}
                                        </option>
                                    ))}
                                </Form.Select>
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
                        Tem certeza que deseja excluir a área "{areaAtual?.nome}"?
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

export default GerirAreasFormacao;