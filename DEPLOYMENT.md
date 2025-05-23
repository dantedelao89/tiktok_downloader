# Guía de Despliegue

## 🚀 Opciones de Despliegue

### 1. Replit (Recomendado para desarrollo)
- ✅ Ya configurado y funcionando
- ✅ Dominio automático `.replit.app`
- ✅ Base de datos PostgreSQL incluida
- ✅ SSL/TLS automático

### 2. Vercel + Railway
**Frontend (Vercel):**
```bash
npm run build
vercel --prod
```

**Backend (Railway):**
- Conecta tu repositorio
- Configura variables de entorno
- Despliega automáticamente

### 3. Netlify + Heroku
**Frontend (Netlify):**
```bash
npm run build
# Sube la carpeta dist/public
```

**Backend (Heroku):**
```bash
heroku create tu-app-name
git push heroku main
```

### 4. VPS/Servidor Propio
```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/tiktok-downloader.git
cd tiktok-downloader

# Instala dependencias
npm install

# Construye la aplicación
npm run build

# Inicia con PM2
npm install -g pm2
pm2 start dist/index.js --name "tiktok-downloader"
```

## 🔧 Variables de Entorno

Asegúrate de configurar estas variables en tu servicio de hosting:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
```

## 📦 Scripts Disponibles

- `npm run dev` - Desarrollo
- `npm run build` - Construcción para producción
- `npm start` - Inicia la aplicación en producción
- `npm run db:push` - Sincroniza la base de datos

## 🔒 Consideraciones de Seguridad

- ✅ API key de RapidAPI configurada
- ✅ Validación de URLs implementada
- ✅ Límites de descarga por sesión
- ✅ Limpieza automática de archivos temporales

## 📊 Monitoreo

Para producción, considera agregar:
- Logs estructurados
- Métricas de rendimiento
- Alertas de errores
- Backup de base de datos