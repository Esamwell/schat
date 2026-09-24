#!/bin/bash

echo "============================================================"
echo "    INSTALADOR AUTOMÁTICO SChat - 100% PRONTO PARA USO"
echo "============================================================"
echo ""

# Pergunta os domínios para o usuário
read -p "Digite o domínio do painel (ex: painel.empresa.com.br): " FRONTEND_URL
read -p "Digite o domínio da API (ex: api.empresa.com.br): " BACKEND_URL
read -p "Digite seu e-mail (para o certificado SSL/HTTPS): " USER_EMAIL

echo ""
echo "Iniciando a instalação automática..."
echo ""

# Gerar senhas seguras automaticamente
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Atualiza sistema
echo "-> Atualizando pacotes do servidor..."
sudo apt update -y && sudo apt upgrade -y

# Instala dependências básicas
echo "-> Instalando Git, Curl, Nginx, Certbot, PostgreSQL, Redis..."
sudo apt install -y git curl build-essential postgresql postgresql-contrib redis-server nginx certbot python3-certbot-nginx

# Instala Node 18
echo "-> Instalando Node.js v18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instala PM2
echo "-> Instalando PM2..."
sudo npm install -g pm2
pm2 startup

# Configuração do banco de dados (PostgreSQL)
echo "-> Configurando PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '2000@23';"
sudo -u postgres psql -c "CREATE DATABASE izing;" || echo "Banco já existe!"

# Clonar o repositório
echo "-> Clonando o sistema do GitHub..."
cd /home
mkdir -p deploywhaticketplus
cd deploywhaticketplus
rm -rf izing
git clone https://github.com/Esamwell/schat.git izing
cd izing

# Backend Setup
echo "-> Configurando Backend (.env Automático)..."
cd backend
cat <<EOT > .env
NODE_ENV=production
BACKEND_URL=https://${BACKEND_URL}
FRONTEND_URL=https://${FRONTEND_URL}
PROXY_PORT=443
PORT=3100
DB_DIALECT=postgres
DB_HOST=localhost
DB_USER=postgres
DB_PASS=2000@23
DB_NAME=izing
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
REDIS_URI=redis://127.0.0.1:6379
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000
USER_LIMIT=100
CONNECTIONS_LIMIT=100
EOT

npm install
npm run build
npx sequelize db:migrate
npx sequelize db:seed:all

# Inicia Backend no PM2
pm2 start dist/server.js --name izing-backend
pm2 save

# Frontend Setup
echo "-> Configurando Frontend (.env Automático)..."
cd ../frontend
cat <<EOT > .env
VUE_APP_BACKEND_URL=https://${BACKEND_URL}
EOT

npm install
env NODE_OPTIONS=--openssl-legacy-provider npm run build || npm run build

# NGINX Setup
echo "-> Configurando NGINX..."

# Configuração do Frontend
cat <<EOT > /etc/nginx/sites-available/izing-frontend
server {
  server_name ${FRONTEND_URL};
  root /home/deploywhaticketplus/izing/frontend/dist/spa;
  index index.html index.htm;
  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOT

# Configuração do Backend
cat <<EOT > /etc/nginx/sites-available/izing-backend
server {
  server_name ${BACKEND_URL};
  location / {
    proxy_pass http://127.0.0.1:3100;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_cache_bypass \$http_upgrade;
  }
}
EOT

# Ativar Nginx
ln -s /etc/nginx/sites-available/izing-frontend /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/izing-backend /etc/nginx/sites-enabled/
systemctl restart nginx

# Certbot (SSL)
echo "-> Instalando Certificado SSL (HTTPS)..."
certbot --nginx --non-interactive --agree-tos -m ${USER_EMAIL} -d ${FRONTEND_URL} -d ${BACKEND_URL}

echo "============================================================"
echo "    INSTALAÇÃO CONCLUÍDA COM SUCESSO! 🚀"
echo "============================================================"
echo "Seu sistema já está no ar, seguro e pronto para uso."
echo "Painel: https://${FRONTEND_URL}"
echo "API:    https://${BACKEND_URL}"
echo "============================================================"
