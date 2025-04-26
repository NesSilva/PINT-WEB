const Curso = require("../models/Curso");

const criarCurso = async (req, res) => {
    try {
        const {
            titulo,
            descricao,
            id_categoria,
            id_area,
            id_formador,
            data_inicio,
            data_fim,
            vagas,
            tipo
        } = req.body;

        if (!titulo || !id_categoria || !id_area || !id_formador || !data_inicio || !data_fim || !tipo) {
            return res.status(400).json({ success: false, message: "Todos os campos obrigatórios devem ser preenchidos." });
        }

        const novoCurso = await Curso.create({
            titulo,
            descricao,
            id_categoria,
            id_area,
            id_formador,
            data_inicio,
            data_fim,
            vagas,
            tipo
        });

        res.status(201).json({ success: true, message: "Curso criado com sucesso!", curso: novoCurso });
    } catch (error) {
        console.error("Erro ao criar curso:", error);
        res.status(500).json({ success: false, message: "Erro no servidor ao criar curso." });
    }
};

const listarCursos = async (req, res) => {
    try {
      const cursos = await Curso.findAll(); 
      res.status(200).json(cursos);
    } catch (error) {
      console.error('Erro ao listar cursos:', error);
      res.status(500).json({ error: 'Erro ao listar cursos' });
    }
  };
  
module.exports = { criarCurso , listarCursos };
