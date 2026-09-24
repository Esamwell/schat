#!/bin/bash

echo "============================================================"
echo "    AMBIENTE DE DESENVOLVIMENTO SChat - LOCALHOST"
echo "============================================================"
echo "Este script preparará o sistema para rodar na sua própria máquina (Linux/WSL)."
echo ""

# Gerar senhas seguras automaticamente
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Atualiza sistema localmente
echo "-> Instalando pacotes necessários..."
sudo apt update -y
sudo apt install -y git curl build-essential postgresql postgresql-contrib redis-server

# Instala Node 18 se não existir
if ! command -v node &> /dev/null; then
    echo "-> Instalando Node.js v18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "-> Node.js já instalado. Versão atual:"
    node -v
fi

# Configuração do banco de dados (PostgreSQL)
echo "-> Configurando PostgreSQL (banco: izing_local)..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '2000@23';"
sudo -u postgres psql -c "CREATE DATABASE izing_local;" || echo "Banco já existe!"

# Baixar o código caso não esteja clonado ainda (se rodar fora da pasta)
if [ ! -d "backend" ]; then
    echo "-> Clonando o código do GitHub..."
    git clone https://github.com/Esamwell/schat.git izing_local
    cd izing_local
fi

# Configurar Backend
echo "-> Configurando Backend..."
cd backend
cat <<EOT > .env
NODE_ENV=dev
BACKEND_URL=http://localhost:3100
FRONTEND_URL=http://localhost:8080
PROXY_PORT=80
PORT=3100
DB_DIALECT=postgres
DB_HOST=localhost
DB_USER=postgres
DB_PASS=2000@23
DB_NAME=izing_local
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

# Voltar para raiz
cd ..

# Configurar Frontend
echo "-> Configurando Frontend..."
cd frontend
cat <<EOT > .env
VUE_APP_BACKEND_URL=http://localhost:3100
EOT
npm install

echo "============================================================"
echo "    TUDO PRONTO PARA DESENVOLVIMENTO! 💻"
echo "============================================================"
echo "Para ligar o servidor da API, abra um terminal, entre na pasta 'backend' e rode:"
echo "npm run dev:server"
echo ""
echo "Para ligar a tela do sistema (Painel), abra OUTRO terminal, entre na pasta 'frontend' e rode:"
echo "npx quasar dev  (ou npm run serve)"
echo "============================================================"
echo "Acesse no navegador: http://localhost:8080"
echo "============================================================"
