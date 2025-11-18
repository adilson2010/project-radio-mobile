
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('educ.adilsonlima@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const sendEmailNotification = async (type: string, email: string, data?: any) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/send-email-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ type, email, data }),
        }
      );
      
      if (response.ok) {
        console.log('📧 Email de notificação enviado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Método 1: Tentar login direto com credenciais
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Se falhar, tentar criar/atualizar o usuário
        console.log('Login direto falhou, tentando criar usuário...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
            data: {
              full_name: 'Administrador'
            }
          }
        });

        if (signUpError && !signUpError.message.includes('already registered')) {
          throw signUpError;
        }

        // Tentar login novamente após criar
        const { data: retryAuthData, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (retryError) {
          throw new Error('Credenciais inválidas. Verifique seu email e senha.');
        }

        // Usar dados do retry
        if (retryAuthData.user) {
          await ensureAdminRecord(retryAuthData.user.id);
          setShowSuccess(true);
          
          // Enviar email de login bem-sucedido
          await sendEmailNotification('login_success', email, {
            panelUrl: window.location.origin + '/admin'
          });
          
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
          return;
        }
      }

      if (authData.user) {
        // Login bem-sucedido
        await ensureAdminRecord(authData.user.id);
        setShowSuccess(true);
        
        // Enviar email de login bem-sucedido
        await sendEmailNotification('login_success', email, {
          panelUrl: window.location.origin + '/admin'
        });
        
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }

    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const ensureAdminRecord = async (userId: string) => {
    try {
      // Verificar se já existe registro
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!existingAdmin) {
        // Criar registro de admin
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            user_id: userId,
            email: email,
            full_name: 'Administrador'
          });

        if (insertError) {
          console.error('Erro ao inserir admin:', insertError);
        }
      }
    } catch (error) {
      console.error('Erro ao garantir registro admin:', error);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-4xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Login Realizado!</h1>
            <p className="text-green-200 mb-6">
              Acesso autorizado. Redirecionando para o painel administrativo...
            </p>
            <div className="flex items-center justify-center gap-2 text-green-300">
              <i className="ri-loader-4-line animate-spin"></i>
              <span>Carregando painel...</span>
            </div>
            <div className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
              <p className="text-sm text-green-200">
                📧 Email de confirmação enviado para: {email}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <i className="ri-shield-user-line text-4xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-purple-200">Faça login para gerenciar a loja</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-mail-line text-purple-300"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="admin@exemplo.com"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-purple-300"></i>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300 hover:text-white transition-colors cursor-pointer"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <i className="ri-error-warning-line text-red-300 text-xl flex-shrink-0 mt-0.5"></i>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Entrando...
                </>
              ) : (
                <>
                  <i className="ri-login-box-line"></i>
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Dicas de Acesso */}
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
              <i className="ri-lightbulb-line"></i>
              Dicas de Acesso
            </h3>
            <ul className="text-xs text-blue-300 space-y-1">
              <li>• Use o email: exemplo@exemplo.com</li>
              <li>• Configure uma senha de pelo menos 6 caracteres</li>
              <li>• Se não conseguir entrar, use a página de configuração</li>
              <li>• Você receberá um email de confirmação após o login</li>
            </ul>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <a
              href="/admin/setup"
              className="block text-pink-300 hover:text-pink-200 font-medium"
            >
              🔧 Configurar/Redefinir Senha
            </a>
            <a
              href="/"
              className="block text-purple-300 hover:text-purple-200"
            >
              ← Voltar ao Site
            </a>
          </div>
        </div>

        {/* Informações de Segurança */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-purple-200 text-sm">
            <i className="ri-shield-check-line"></i>
            <span>Conexão segura e criptografada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
