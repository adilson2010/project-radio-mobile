import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, email, data } = await req.json()

    // Configuração do email (você pode usar Resend, SendGrid, etc.)
    const emailTemplates = {
      'password_changed': {
        subject: '🔐 Senha Alterada - Painel Administrativo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Senha Alterada</h1>
              <p style="color: #e2e8f0; margin: 10px 0 0 0;">Sua senha foi alterada com sucesso</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1a202c; margin-top: 0;">Olá, Administrador!</h2>
              <p style="color: #4a5568; line-height: 1.6;">
                Sua senha do painel administrativo foi alterada com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.
              </p>
              <p style="color: #4a5568; line-height: 1.6;">
                Se você não fez esta alteração, entre em contato conosco imediatamente.
              </p>
            </div>
            
            <div style="background: #e6fffa; border-left: 4px solid #38b2ac; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #234e52;">
                <strong>💡 Dica de Segurança:</strong> Mantenha sua senha segura e não a compartilhe com ninguém.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data?.loginUrl || '#'}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Acessar Painel
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096; font-size: 14px;">
              <p>Este é um email automático, não responda.</p>
              <p>© ${new Date().getFullYear()} Painel Administrativo</p>
            </div>
          </div>
        `
      },
      'login_success': {
        subject: '✅ Login Realizado - Painel Administrativo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">✅ Login Realizado</h1>
              <p style="color: #c6f6d5; margin: 10px 0 0 0;">Acesso ao painel administrativo</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1a202c; margin-top: 0;">Olá, Administrador!</h2>
              <p style="color: #4a5568; line-height: 1.6;">
                Você fez login no painel administrativo em <strong>${new Date().toLocaleString('pt-BR')}</strong>.
              </p>
              <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 0; color: #2d3748;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0 0 0; color: #2d3748;"><strong>Horário:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>
            </div>
            
            <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #742a2a;">
                <strong>🔒 Segurança:</strong> Se você não fez este login, altere sua senha imediatamente.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data?.panelUrl || '#'}" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Ir para Painel
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096; font-size: 14px;">
              <p>Este é um email automático, não responda.</p>
              <p>© ${new Date().getFullYear()} Painel Administrativo</p>
            </div>
          </div>
        `
      }
    }

    const template = emailTemplates[type as keyof typeof emailTemplates]
    if (!template) {
      throw new Error('Tipo de email inválido')
    }

    // Simular envio de email (você pode integrar com um serviço real)
    console.log(`📧 Email enviado para: ${email}`)
    console.log(`📋 Assunto: ${template.subject}`)
    console.log(`📄 Conteúdo: ${template.html.substring(0, 100)}...`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        emailSent: true,
        recipient: email,
        subject: template.subject
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        emailSent: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})