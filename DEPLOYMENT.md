# Guia de Configuração para Implantação

Este documento contém as instruções para configurar corretamente o domínio, o DNS e o Cloudflare para a aplicação White Dash.

## 1. Configuração de DNS

Para migrar de `white-dash.pages.dev` para `systemwhite.com.br`, siga estas etapas:

### 1.1. Configurações de DNS para o domínio `systemwhite.com.br`

Adicione os seguintes registros DNS na zona do domínio `systemwhite.com.br`:

| Tipo  | Nome | Conteúdo                                  | TTL  | Proxy  |
| ----- | ---- | ----------------------------------------- | ---- | ------ |
| A     | @    | 76.76.21.21                               | Auto | ✅ Sim |
| A     | www  | 76.76.21.21                               | Auto | ✅ Sim |
| A     | dash | 76.76.21.21                               | Auto | ✅ Sim |
| CNAME | api  | api.systemwhite.com.br.cdn.cloudflare.net | Auto | ✅ Sim |

### 1.2. Configuração do subdomínio para a aplicação dashboard

O subdomínio `dash.systemwhite.com.br` será usado para a interface do usuário. É necessário configurar o projeto no provedor de hospedagem para apontar para este domínio personalizado.

### 1.3. Configuração do subdomínio para a API

O subdomínio `api.systemwhite.com.br` será usado para o backend da API. Seu servidor backend deve ser configurado para responder neste domínio.

## 2. Configuração do Cloudflare

O Cloudflare é usado para gerenciar o DNS, fornecer HTTPS, e aplicar regras de transformação para CORS.

### 2.1. Regras de transformação para CORS (Headers HTTP)

Crie uma regra de transformação de resposta no Cloudflare com as seguintes configurações:

1. Acesse o Cloudflare e selecione o domínio `systemwhite.com.br`
2. Navegue até **Rules** > **Transform Rules** > **HTTP Response Headers**
3. Clique em **Create a rule**
4. Configure a regra:

   - **Rule name**: `CORS Headers for API`
   - **When incoming requests match**: `(http.host eq "api.systemwhite.com.br")`
   - **Execute**: `Set static\*\*

5. Adicione os seguintes cabeçalhos:

   | Header Name                      | Value                                       |
   | -------------------------------- | ------------------------------------------- |
   | Access-Control-Allow-Origin      | \*                                          |
   | Access-Control-Allow-Methods     | GET, POST, PUT, DELETE, OPTIONS             |
   | Access-Control-Allow-Headers     | Content-Type, Authorization, Accept, Origin |
   | Access-Control-Allow-Credentials | true                                        |

6. Salve e publique a regra

### 2.2. Página Rules (opcional)

Para garantir que todo o tráfego use HTTPS, crie uma Page Rule:

1. Navegue até **Rules** > **Page Rules**
2. Clique em **Create Page Rule**
3. Configure:
   - URL: `*systemwhite.com.br/*`
   - **Setting**: Always Use HTTPS

## 3. Verificando a Configuração

Para verificar se tudo está funcionando corretamente:

1. Acesse o dashboard em `dash.systemwhite.com.br`
2. Use o componente de teste de API inclusos na aplicação para verificar a conectividade
3. Verifique se os cabeçalhos CORS estão sendo corretamente aplicados nos requests para `api.systemwhite.com.br`

## 4. Solução de Problemas

### 4.1. Problemas de CORS

Se você continuar enfrentando problemas de CORS após configurar as regras do Cloudflare:

1. Verifique se a regra de transformação está ativa e aplicada ao domínio correto
2. Teste fazendo uma solicitação `OPTIONS` direta para a API para verificar os cabeçalhos retornados:
   ```
   curl -X OPTIONS -H "Origin: https://dash.systemwhite.com.br" \
   -H "Access-Control-Request-Method: GET" \
   -H "Access-Control-Request-Headers: Content-Type" \
   -I https://api.systemwhite.com.br/bots
   ```
3. Use o componente de teste incluído no dashboard para diagnosticar problemas

### 4.2. Propagação de DNS

Lembre-se que alterações de DNS podem levar até 48 horas para se propagar completamente, embora geralmente sejam mais rápidas com o Cloudflare. Se os domínios não estiverem funcionando imediatamente, aguarde algumas horas e tente novamente.

## 5. Importante: Configuração HTTPS e Certificado SSL

### 5.1. Problema Atual com Conteúdo Misto (Mixed Content)

Atualmente, a API está configurada para usar HTTP em vez de HTTPS devido à ausência de um certificado SSL válido. Isso causa problemas quando a aplicação frontend está servida via HTTPS (como acontece com o serviço Pages do Cloudflare), pois os navegadores modernos bloqueiam requisições HTTP a partir de contextos HTTPS (conhecido como "Mixed Content").

**Solução temporária:** A aplicação atualmente contorna o problema usando URLs HTTP para a API, mas isto:

1. Não é seguro, pois as requisições trafegam sem criptografia
2. Pode ser bloqueado por navegadores em contextos de segurança mais rigorosos
3. Não é uma solução viável a longo prazo

### 5.2. Configuração do Certificado SSL para a API

Para resolver este problema permanentemente, siga estas etapas para configurar um certificado SSL gratuito Let's Encrypt no servidor da API:

1. Acesse o servidor onde a API está hospedada
2. Instale o Certbot (cliente Let's Encrypt):

   ```bash
   # Para servidores Debian/Ubuntu
   apt update
   apt install certbot python3-certbot-nginx  # Para servidores Nginx
   # OU
   apt install certbot python3-certbot-apache  # Para servidores Apache
   ```

3. Execute o Certbot e siga as instruções:

   ```bash
   certbot --nginx -d api.systemwhite.com.br  # Para Nginx
   # OU
   certbot --apache -d api.systemwhite.com.br  # Para Apache
   ```

4. Configure a renovação automática:

   ```bash
   echo "0 0,12 * * * root certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
   ```

5. Após configurar o SSL no servidor da API, modifique o arquivo `src/utils/apiUtils.ts` para usar HTTPS ao invés de HTTP.

**Alternativa com Cloudflare:** Se a API usa o Cloudflare, você também pode habilitar o certificado SSL fornecido pelo Cloudflare:

1. No painel do Cloudflare, vá para a seção "SSL/TLS"
2. Escolha o modo "Flexível" ou "Completo" (Preferível "Completo")
3. Certifique-se de que o proxy (ícone de nuvem laranja) está ativado para o registro DNS da API
