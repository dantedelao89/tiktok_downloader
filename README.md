# TikTok Video Downloader

Una aplicación web moderna para descargar videos de TikTok en formatos MP4 (video) y MP3 (audio) con una interfaz elegante y progreso en tiempo real.

## 🚀 Características

- ✅ Descarga videos de TikTok en formato MP4 y MP3
- ✅ Interfaz moderna con tema oscuro y gradientes
- ✅ Barra de progreso detallada con fases de descarga
- ✅ Validación de URLs en tiempo real
- ✅ API backend robusta usando RapidAPI
- ✅ Diseño responsive y accesible
- ✅ Sin marcas de agua

## 🛠️ Tecnologías

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **shadcn/ui** componentes
- **TanStack React Query** para manejo de estado
- **Wouter** para routing
- **Vite** para desarrollo y build

### Backend
- **Node.js** con Express.js
- **TypeScript** con ES modules
- **Drizzle ORM** para base de datos
- **RapidAPI** para descarga de videos

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/tiktok-downloader.git
cd tiktok-downloader
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 🌐 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 📱 Uso

1. Pega la URL del video de TikTok
2. Selecciona el formato (MP4 para video, MP3 para audio)
3. Haz clic en "Download MP4/MP3"
4. Observa el progreso en tiempo real
5. Descarga tu archivo cuando esté listo

## 🔧 API

La aplicación usa RapidAPI Social Media Video Downloader para obtener los enlaces de descarga de videos de TikTok.

### Endpoints

- `POST /api/download` - Inicia una descarga
- `GET /api/download/:id/status` - Verifica el estado de descarga
- `GET /api/download/:id/file` - Descarga el archivo completado

## 🎨 Diseño

- **Tema**: Oscuro con acentos rosa y cian
- **Tipografía**: Sistema de fuentes moderno
- **Componentes**: shadcn/ui con Radix UI
- **Animaciones**: Transiciones suaves y loading states

## 📄 Licencia

MIT License - Ve el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en GitHub.

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!