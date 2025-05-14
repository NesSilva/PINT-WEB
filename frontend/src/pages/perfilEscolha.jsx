export default function perfilEscolha() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-white text-center" style={{ backdropFilter: 'blur(3px)' }}>
      <h2>Bem-vindo Jose</h2>
      <p>Selecione o perfil que deseja entrar</p>
      <div className="d-flex gap-3">
        <button className="btn btn-outline-light">Formando</button>
        <button className="btn btn-outline-light">Formador</button>
        <button className="btn btn-outline-light">Gestor</button>
      </div>
    </div>
  );
}
