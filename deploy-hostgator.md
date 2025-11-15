
# Deploy para Hostgator

## Passos para deploy no Hostgator:

### 1. Build do projeto
```bash
npm run build:hostgator
```

### 2. Upload dos arquivos
- Acesse o cPanel do Hostgator
- Vá para "Gerenciador de Arquivos"
- Navegue até a pasta `public_html`
- Faça upload de todos os arquivos da pasta `dist/`

### 3. Configuração do .htaccess
Crie um arquivo `.htaccess` na pasta `public_html` com o seguinte conteúdo:

```apache
RewriteEngine On
RewriteBase /

# Handle Angular and React Router
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### 4. Verificação
- Acesse seu domínio para verificar se o site está funcionando
- Teste a navegação e o player de rádio
- Verifique se todos os recursos estão carregando corretamente

## Troubleshooting

### Se o site não carregar:
1. Verifique se todos os arquivos foram enviados
2. Confirme se o arquivo `.htaccess` está configurado corretamente
3. Verifique os logs de erro no cPanel

### Se o player não funcionar:
1. Verifique se o SSL está ativo (HTTPS)
2. Confirme se não há bloqueios de CORS
3. Teste em diferentes navegadores
