# Clone o repositório
# git clone https://github.com/gabySilva87/tcc-api.git
# git clone -b <branch-name> <repository-url>
# Acesse a pasta do projeto
# cd tcc-api

# Vá para a branch desejada
git checkout <branch>
npm install npm audit fix npm run dev Para usar npm start sem erros: npm run build npm start 
# fazer uma .env.local
DB_HOST=localhost
DB_PORT=3307
DB_DATABASE=db_transportadora
DB_USER=root
DB_PASSWORD=root
DB_SSL=false

# pegar do laravel 
ENCRYPTION_KEY=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
ENCRYPTION_IV=a1b2c3d4e5f6a1b2


# DB_HOST="localhost"
# DB_PORT="3307" 
# DB_DATABASE="db_transportadora"
# DB_USER="root"
# DB_PASSWORD="root"
# DB_SSL="false"
# APP_KEY="RYBKItlDbXBezxxITrLZOjFxd/HDCr8H9c"4c5WnH9lI"




# --- CHAVES DE CRIPTOGRAFIA PARA O WEBHOOK (RASTREAMENTO) ---
# ⚠️ Estas chaves DEVEM SER IDÊNTICAS às que estão no .env do seu projeto Laravel.

# ENCRYPTION_KEY="A3F9C7D2B8E4F1A6C0D5E7B9A2F4C8D1"  # Exatamente 32 caracteres
# ENCRYPTION_IV="F3A9C7D2E8B4A1F0"                 # Exatamente 16 caracteres

# --- URL DO WEBHOOK DO LARAVEL ---
# A URL para onde a localização criptografada será enviada.
# Substitua pelo endereço real do seu servidor Laravel.

# LARAVEL_WEBHOOK_URL="http://127.0.0.1:8000/api/location-webhook"