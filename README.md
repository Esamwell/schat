# SChat - Plataforma Multi-Atendimento Inteligente 🚀

O **SChat** é um sistema completo e independente de gestão de atendimentos para WhatsApp, Instagram e Telegram. Desenvolvido para oferecer estabilidade e performance, possui melhorias exclusivas como o encerramento automático por inatividade no Chatbot e painel de configurações otimizado.

## 🌟 Principais Funcionalidades

- **Multi-Canais:** Gerencie múltiplos números de WhatsApp, Instagram e Telegram em uma única tela.
- **Chatbot Inteligente:** Construtor visual de fluxos com auto-encerramento por inatividade (tempo e mensagens 100% configuráveis via painel).
- **Gestão de Equipes:** Divisão de atendimentos por Setores e Usuários (Admins e Agentes).
- **Campanhas de Marketing:** Disparo em massa de mensagens com arquivos e imagens.
- **Integração:** Webhooks via API para conectar com seus sistemas externos.

---

## 🚀 Como Instalar (Script 100% Automático)

Para facilitar a instalação em novas VPS (Servidores Linux Ubuntu), criamos um **script mágico** que automatiza TODO o processo. 
**Quando o script terminar de rodar, o seu sistema já estará com HTTPS configurado, Nginx pronto e 100% funcional!**

### Pré-requisitos
1. Um servidor Ubuntu limpo (recomendado 20.04 ou 22.04).
2. Dois subdomínios apontados para o IP da sua VPS (ex: `painel.seudominio.com` e `api.seudominio.com`).

### Passo a Passo da Instalação

1. Acesse o terminal da sua VPS via SSH e execute os comandos abaixo:

```bash
# Baixe o repositório do github
git clone https://github.com/Esamwell/schat.git izing
cd izing

# Dê permissão de execução ao script
chmod +x install_schat.sh

# Execute o instalador
sudo ./install_schat.sh
```

### O que o script de instalação faz sozinho?
O script é interativo. Ele vai perguntar quais são os seus domínios e o seu e-mail. A partir daí, ele fará TUDO de forma invisível:
- Atualiza os pacotes do Linux.
- Instala Node.js v18, Git, PM2, Nginx, Certbot, PostgreSQL e Redis.
- Configura o banco de dados e as tabelas (Migrations/Seeds).
- **Gera senhas seguras automaticamente** (JWT) e configura os arquivos `.env` do Front e do Backend.
- Compila o código.
- **Configura o Nginx** para os dois domínios que você digitou.
- **Roda o Certbot** instalando o certificado de segurança SSL (Cadeado/HTTPS) sem você precisar digitar nada.
- Inicia a API com PM2.

**Ao final do script, você já poderá acessar `https://painel.seudominio.com` e usar o SChat imediatamente!**

### Instalação em Computador Local (Desenvolvimento)
Se você for um desenvolvedor e quiser rodar o SChat na sua própria máquina (Localhost/WSL), não precisa de Nginx ou Certbot. Para isso, criamos um script simplificado:
```bash
git clone https://github.com/Esamwell/schat.git izing
cd izing
chmod +x install_local.sh
./install_local.sh
```
O script fará a instalação e no final instruirá como iniciar os servidores de desenvolvimento.

---

## 💻 Manual do Usuário
Dentro do próprio sistema, o menu lateral possui o **Manual do Sistema**, com passo a passo sobre como utilizar o atendimento, criar setores, conectar canais e configurar as regras do Chatbot.

---
*Feito para otimizar operações e encantar clientes.*
