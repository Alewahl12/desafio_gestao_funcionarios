import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import shared from './Departamento.module.css';
import styles from './Login.module.css';
import { login as autenticar, registrar } from '../services/auth';
import { IconCheck } from '../components/icons';

function LoginPage() {
  const [modo, setModo] = useState('login'); // 'login' | 'registrar'
  const [loginValue, setLoginValue] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const limparCamposSenha = () => {
    setSenha('');
    setConfirmarSenha('');
  };

  const alternarModo = () => {
    setErro('');
    limparCamposSenha();
    setModo(modo === 'login' ? 'registrar' : 'login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (modo === 'registrar') {
      if (senha.length < 6) {
        setErro('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (senha !== confirmarSenha) {
        setErro('As senhas não coincidem.');
        return;
      }
    }

    setCarregando(true);
    try {
      if (modo === 'registrar') {
        await registrar(loginValue, senha);
        alert('Conta criada com sucesso! Agora faça login.');
        setModo('login');
        limparCamposSenha();
      } else {
        await autenticar(loginValue, senha);
        navigate('/', { replace: true });
      }
    } catch (error) {
      setErro(error.response?.data || 'Não foi possível concluir. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>X</div>

        <div className={styles.headerText}>
          <h1 className={styles.title}>{modo === 'login' ? 'Entrar' : 'Criar Conta'}</h1>
          <p className={styles.subtitle}>
            {modo === 'login'
              ? 'Acesse o Sistema de Gestão'
              : 'Preencha os dados para criar sua conta'}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={shared.fieldBox}>
            <legend className={shared.fieldLegend}>Login</legend>
            <input
              className={shared.fieldInput}
              placeholder="Insira seu login"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              autoComplete="username"
              required
            />
          </fieldset>

          <fieldset className={shared.fieldBox}>
            <legend className={shared.fieldLegend}>Senha</legend>
            <input
              className={shared.fieldInput}
              type="password"
              placeholder="Insira sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </fieldset>

          {modo === 'registrar' && (
            <fieldset className={shared.fieldBox}>
              <legend className={shared.fieldLegend}>Confirmar Senha</legend>
              <input
                className={shared.fieldInput}
                type="password"
                placeholder="Repita sua senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                autoComplete="new-password"
                required
              />
            </fieldset>
          )}

          {erro && <p className={styles.errorText}>{erro}</p>}

          <button
            type="submit"
            className={`${shared.btnPrimary} ${styles.submitBtn}`}
            disabled={carregando}
          >
            <IconCheck /> {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Confirmar'}
          </button>
        </form>

        <p className={styles.toggleRow}>
          {modo === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
          <button type="button" className={styles.toggleLink} onClick={alternarModo}>
            {modo === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;