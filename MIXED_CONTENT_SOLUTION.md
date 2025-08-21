# Atualizações de Configuração - Solução para Erros de Mixed Content

### Problema:

Foi identificado que o sistema está enfrentando problemas de "Mixed Content" em produção. Isso ocorre porque o frontend está sendo servido via HTTPS, mas tenta acessar a API via HTTP, o que é bloqueado pelos navegadores modernos por questões de segurança.

### Soluções implementadas:

1. **Solução temporária para os usuários:**

   - Adicionado um sistema que permite alternar entre HTTP e HTTPS para acessar a API
   - O componente de teste de API agora mostra diagnósticos detalhados
   - Incluído aviso explicativo sobre o problema e as opções disponíveis

2. **Opções disponíveis para os usuários finais:**

   - Alternar para HTTPS ao acessar a API (pode falhar se o certificado não estiver configurado corretamente)
   - Acessar o dashboard por HTTP em vez de HTTPS (menos seguro, mas funcional)

3. **Documentação atualizada:**
   - Adicionadas instruções detalhadas no arquivo DEPLOYMENT.md sobre como configurar corretamente o certificado SSL para a API

### Solução permanente recomendada:

A melhor solução é configurar um certificado SSL válido para `api.systemwhite.com.br`. Isso pode ser feito facilmente usando:

- Let's Encrypt (gratuito)
- Certificado SSL pelo Cloudflare (se estiver usando o Cloudflare como proxy)

### Como proceder:

1. **Para suporte técnico:** Seguir as instruções em DEPLOYMENT.md para instalar o certificado SSL
2. **Para usuários finais:** Utilizar o botão "Tentar HTTPS" no componente de teste ou acessar via HTTP temporariamente

Após a instalação do certificado SSL no servidor da API, remova o código temporário e configure a aplicação para usar exclusivamente HTTPS.
