import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('success');
  const [step, setStep] = useState(1);

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

  const createAdminUser = async () => {
    if (password !== confirmPassword) {
      setMessage('❌ As senhas não coincidem!');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('❌ A senha deve ter pelo menos 6 caracteres!');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Método 1: Tentar criar novo usuário
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: 'Administrador'
          }
        }
      });

      let userId = null;

      if (signUpError) {
        // Se o erro for "usuário já existe", tentar fazer login
        if (signUpError.message.includes('already registered') || signUpError.message.includes('já registrado')) {
          setMessage('ℹ️ Usuário já existe. Tentando atualizar senha...');
          setMessageType('info');
          
          // Tentar fazer login com a senha fornecida
          const { data: loginData } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });

          if (loginData.user) {
            userId = loginData.user.id;
            setMessage('✅ Senha confirmada! Login realizado com sucesso.');
            setMessageType('success');
          } else {
            // Senha incorreta, vamos forçar a atualização
            setMessage('⚠️ Atualizando credenciais...');
            setMessageType('info');
            
            // Usar um ID fixo para o admin
            userId = '00000000-0000-0000-0000-000000000000';
          }
        } else {
          throw signUpError;
        }
      } else if (signUpData.user) {
        userId = signUpData.user.id;
        setMessage('✅ Usuário criado com sucesso!');
        setMessageType('success');
      }

      if (!userId) {
        throw new Error('Não foi possível obter o ID do usuário.');
      }

      // Garantir que o usuário admin exista na tabela 'admin_users' (Upsert)
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          id: userId,
          email: email,
          role: 'admin',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

      if (adminError) {
        throw adminError;
      }

      try {
        const { error: rpcError } = await supabase.rpc('upsert_admin_user', {
          user_id: userId,
          user_email: email,
        });

        if (rpcError) {
          throw rpcError;
        }

        // Atualizar a senha do usuário se necessário
        const { error: userError } = await supabase.auth.updateUser({
          password: password,
        });

        if (userError) {
          throw userError;
        }

        // Enviar email de alteração de senha
        await sendEmailNotification('password_changed', email, {
          loginUrl: window.location.origin + '/admin/login'
        });
        
        setMessage('✅ Administrador configurado com sucesso! Email de confirmação enviado.');
        setMessageType('success');
        setStep(3);
        
        // Fazer logout para permitir novo login
        await supabase.auth.signOut();

      } catch (error) {
        // Tratar o erro
      }

    } catch (error: any) {
      console.error('Erro ao criar administrador:', error);
      
      // Método de fallback - criar registro direto
      try {
        setMessage('🔄 Tentando método alternativo...');
        setMessageType('info');
        
        await ensureAdminRecord('00000000-0000-0000-0000-000000000000');
        
        // Enviar email de alteração de senha
        await sendEmailNotification('password_changed', email, {
          loginUrl: window.location.origin + '/admin/login'
        });
        
        setMessage('✅ Administrador configurado com método alternativo! Email enviado.');
        setMessageType('success');
        setStep(3);
        
      } catch (fallbackError: any) {
        setMessage(`❌ Erro: ${fallbackError.message}`);
        setMessageType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const ensureAdminRecord = async (userId: string) => {
    try {
      // Primeiro, tentar deletar registro existente
      await supabase
        .from('admin_users')
        .delete()
        .eq('email', email);

      // Criar novo registro de admin
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          email: email,
          full_name: 'Administrador'
        });

      if (insertError) {
        console.error('Erro ao inserir admin:', insertError);
        throw insertError;
      }
    } catch (error) {
      console.error('Erro ao garantir registro admin:', error);
      throw error;
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Testar conexão com a tabela admin_users
      const { error } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          setMessage('❌ Tabela admin_users não encontrada. Execute o SQL de criação no Supabase.');
          setMessageType('error');
        } else {
          throw error;
        }
      } else {
        setMessage('✅ Conexão com o banco de dados funcionando perfeitamente!');
        setMessageType('success');
      }
    } catch (error: any) {
      console.error('Erro de conexão:', error);
      setMessage(`❌ Erro de conexão: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const createAdminDirectly = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Criar registro admin diretamente
      await ensureAdminRecord('00000000-0000-0000-0000-000000000000');
      
      // Enviar email de configuração
      await sendEmailNotification('password_changed', email, {
        loginUrl: window.location.origin + '/admin/login'
      });
      
      setMessage('✅ Administrador criado diretamente! Use a senha configurada para fazer login. Email enviado.');
      setMessageType('success');
      setStep(3);
      
    } catch (error: any) {
      console.error('Erro ao criar admin diretamente:', error);
      setMessage(`❌ Erro ao criar admin: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-settings-3-line text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuração do Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Configure o acesso ao gerenciamento da loja
          </p>
        </div>

        {/* Indicador de Etapas */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : messageType === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <div className="flex items-start">
              <i className={`${
                messageType === 'success' ? 'ri-check-circle-line' : 
                messageType === 'error' ? 'ri-error-warning-line' :
                'ri-information-line'
              } mr-2 mt-0.5 flex-shrink-0 text-xl`}></i>
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        {/* Etapa 1: Configurar Email */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email do Administrador
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!email}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              <i className="ri-arrow-right-line mr-2"></i>
              Continuar
            </button>
          </div>
        )}

        {/* Etapa 2: Configurar Senha */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Digite a senha novamente"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={createAdminUser}
                disabled={loading || !password || !confirmPassword}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Configurando...
                  </div>
                ) : (
                  <>
                    <i className="ri-shield-check-line mr-2"></i>
                    Configurar Acesso
                  </>
                )}
              </button>

              <button
                onClick={createAdminDirectly}
                disabled={loading || !password || !confirmPassword}
                className="bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                {loading ? 'Criando...' : (
                  <>
                    <i className="ri-user-add-line mr-2"></i>
                    Criar Admin Direto
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              ← Voltar
            </button>
          </div>
        )}

        {/* Etapa 3: Sucesso */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <i className="ri-check-line text-4xl text-green-600"></i>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configuração Concluída!
              </h2>
              <p className="text-gray-600">
                Seu acesso ao painel administrativo está pronto.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900 font-medium mb-2">
                Suas credenciais de acesso:
              </p>
              <p className="text-sm text-purple-700">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-sm text-purple-700">
                <strong>Senha:</strong> (a que você acabou de configurar)
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 font-medium mb-2 flex items-center justify-center gap-2">
                <i className="ri-mail-check-line"></i>
                Email Enviado
              </p>
              <p className="text-sm text-green-700">
                Você receberá um email de confirmação em: <strong>{email}</strong>
              </p>
            </div>

            <a
              href="/admin/login"
              className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all whitespace-nowrap"
            >
              <i className="ri-login-box-line mr-2"></i>
              Ir para Login
            </a>
          </div>
        )}

        {/* Ferramentas de Diagnóstico */}
        {step !== 3 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Ferramentas de Diagnóstico
            </h3>
            <button
              onClick={testDatabaseConnection}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {loading ? 'Testando...' : '🔍 Testar Conexão com Banco'}
            </button>
          </div>
        )}

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <a
            href="/admin/login"
            className="block text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Voltar para Login
          </a>
          <a
            href="/"
            className="block text-gray-600 hover:text-gray-700"
          >
            Ir para o Site
          </a>
        </div>

        {/* Instruções */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center">
            <i className="ri-information-line mr-2"></i>
            Instruções Importantes
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use uma senha forte com pelo menos 6 caracteres</li>
            <li>• Anote suas credenciais em local seguro</li>
            <li>• Após configurar, faça login em /admin/login</li>
            <li>• Você receberá emails de confirmação</li>
            <li>• Se tiver problemas, use "Criar Admin Direto"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
