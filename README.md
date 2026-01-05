# Koptup Documentación - Plataforma de Gestión Documental con IA

Sistema enterprise para centralizar, estandarizar, generar, validar y certificar documentación de proyectos con soporte de inteligencia artificial.

## 🌟 Características Principales

- 📝 **Generación de Documentación con IA**: Crea documentación técnica profesional usando OpenAI
- 📊 **Diagramas Mermaid Automáticos**: Generación inteligente de diagramas técnicos
- 🎨 **Editor WYSIWYG**: Editor rico con soporte para markdown y renderizado en tiempo real
- 📂 **Workspaces Organizacionales**: Sistema de organización por espacios de trabajo
- 🔄 **Control de Versiones**: Historial completo de cambios en documentos
- 🎯 **8 Tipos de Documentación**: Infraestructura, Administración, Despliegue, APIs, y más
- 👥 **Multi-usuario**: Sistema de autenticación JWT con roles y permisos
- 🌐 **Multi-idioma**: Sistema completamente en español

## 🏗️ Arquitectura del Sistema

### Backend
- **Framework**: Django 5.0 + Django REST Framework
- **Base de Datos**: PostgreSQL (producción) / SQLite (desarrollo local)
- **Autenticación**: JWT (JSON Web Tokens)
- **IA**: Integración con OpenAI GPT-4
- **Procesamiento Async**: Celery + Redis (opcional)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **UI Library**: Material-UI 5
- **Editor**: Draft.js (WYSIWYG)
- **Diagramas**: Mermaid.js
- **HTTP Client**: Axios
- **Routing**: React Router v6

## 📋 Requisitos Previos

### Opción 1: Desarrollo Local (Recomendado para desarrollo)
- **Python**: 3.10 o superior
- **Node.js**: 18 o superior
- **npm**: 9 o superior

### Opción 2: Con Docker
- **Docker**: 20.10 o superior
- **Docker Compose**: 2.0 o superior

## 🚀 Instalación y Configuración

### Opción 1: Desarrollo Local (Sin Docker)

#### Paso 1: Clonar el Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/ronalc90/koptupDocumentacion.git
cd "koptupDocumentacion"
```

#### Paso 2: Configurar el Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Crear entorno virtual de Python
python3 -m venv venv

# Activar el entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
# venv\Scripts\activate

# Instalar dependencias
pip install -r requirements/development.txt

# Configurar variables de entorno
# Copiar el archivo de ejemplo (si existe) o crear uno nuevo
cp .env.example .env  # Si existe
# O crear un nuevo .env con las siguientes variables:
cat > .env << EOF
DJANGO_SETTINGS_MODULE=config.settings.local
DEBUG=True
SECRET_KEY=tu-clave-secreta-super-segura-cambiar-en-produccion
OPENAI_API_KEY=tu-openai-api-key-opcional
EOF

# Ejecutar migraciones de la base de datos
DJANGO_SETTINGS_MODULE=config.settings.local python manage.py migrate

# Crear un superusuario (admin)
DJANGO_SETTINGS_MODULE=config.settings.local python manage.py createsuperuser
# Sigue las instrucciones en pantalla para crear usuario, email y contraseña

# Iniciar el servidor de desarrollo
DJANGO_SETTINGS_MODULE=config.settings.local python manage.py runserver
```

El backend estará disponible en: **http://localhost:8000**

#### Paso 3: Configurar el Frontend

Abre una nueva terminal (mantén el backend corriendo):

```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias de Node.js
npm install

# Configurar variables de entorno
# Copiar el archivo de ejemplo (si existe) o crear uno nuevo
cp .env.example .env  # Si existe
# O crear un nuevo .env con:
cat > .env << EOF
VITE_API_URL=http://localhost:8000/api/v1
EOF

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

#### Paso 4: Acceder a la Aplicación

1. Abre tu navegador en **http://localhost:3000**
2. Usa las credenciales del superusuario que creaste en el Paso 2
3. ¡Comienza a crear documentación!

### Opción 2: Con Docker

```bash
# Clonar el repositorio
git clone https://github.com/ronalc90/koptupDocumentacion.git
cd "koptupDocumentacion"

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Editar backend/.env y agregar tu OPENAI_API_KEY (opcional)

# Levantar todos los servicios
docker-compose up -d

# Esperar a que los servicios inicien (30-60 segundos)

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Ver logs (opcional)
docker-compose logs -f

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Django: http://localhost:8000/admin
```

## 📝 Configuración de OpenAI (Opcional)

Para habilitar la generación de documentación con IA:

1. Obtén una API Key de OpenAI: https://platform.openai.com/api-keys
2. Agrega la clave en `backend/.env`:
   ```
   OPENAI_API_KEY=sk-proj-tu-clave-aqui
   ```
3. Reinicia el servidor backend

**Nota**: Sin la API Key de OpenAI, el sistema seguirá funcionando pero usará plantillas genéricas en lugar de generar contenido con IA.

## 🎯 Uso del Sistema

### Crear un Workspace (Espacio de Trabajo)

1. Click en "Espacios" en el menú lateral
2. Click en el botón "+" para crear un nuevo workspace
3. Ingresa nombre, descripción y selecciona un tipo
4. El workspace aparecerá en tu lista

### Generar Documentación con IA

1. Click en "Generar con IA" en el menú lateral
2. Selecciona el tipo de documentación estándar
3. Describe lo que necesitas documentar
4. Click en "Generar Documentación"
5. Revisa el contenido generado y el diagrama
6. Guarda el documento en un workspace

### Editar Documentos

1. Accede a un documento desde "Documentos" o desde un Workspace
2. Click en cualquier parte del contenido para activar el modo edición
3. Usa la barra de herramientas para dar formato
4. Los diagramas Mermaid se renderizan automáticamente
5. Click en "Guardar" para guardar los cambios

### Gestionar Tipos de Workspace

1. Ve a "Administración" → "Tipos de Workspace"
2. Crea, edita o elimina tipos personalizados
3. Configura colores e íconos para cada tipo
4. Los cambios se reflejan inmediatamente en los workspaces

## 📡 API Endpoints Principales

### Autenticación
```
POST   /api/v1/auth/token/              - Login (obtener token)
POST   /api/v1/auth/token/refresh/      - Refresh token
POST   /api/v1/auth/register/           - Registro de usuario
GET    /api/v1/auth/users/me/           - Usuario actual
```

### Workspaces
```
GET    /api/v1/documents/workspaces/    - Listar workspaces
POST   /api/v1/documents/workspaces/    - Crear workspace
GET    /api/v1/documents/workspaces/:id/ - Detalle workspace
PUT    /api/v1/documents/workspaces/:id/ - Actualizar workspace
DELETE /api/v1/documents/workspaces/:id/ - Eliminar workspace
```

### Documentos
```
GET    /api/v1/documents/documents/     - Listar documentos
POST   /api/v1/documents/documents/     - Crear documento
GET    /api/v1/documents/documents/:id/ - Detalle documento
PUT    /api/v1/documents/documents/:id/ - Actualizar documento
DELETE /api/v1/documents/documents/:id/ - Eliminar documento
```

### Estándares y Generación IA
```
GET    /api/v1/standards/standards/     - Listar estándares de documentación
POST   /api/v1/standards/generate/      - Generar documentación con IA
POST   /api/v1/standards/generate-diagram/ - Generar diagrama con IA
```

### Tipos de Workspace
```
GET    /api/v1/documents/workspace-types/ - Listar tipos
POST   /api/v1/documents/workspace-types/ - Crear tipo
PUT    /api/v1/documents/workspace-types/:id/ - Actualizar tipo
DELETE /api/v1/documents/workspace-types/:id/ - Eliminar tipo
```

## 🛠️ Comandos Útiles

### Backend

```bash
# Activar entorno virtual
source backend/venv/bin/activate

# Ejecutar servidor
DJANGO_SETTINGS_MODULE=config.settings.local python backend/manage.py runserver

# Crear migraciones
DJANGO_SETTINGS_MODULE=config.settings.local python backend/manage.py makemigrations

# Aplicar migraciones
DJANGO_SETTINGS_MODULE=config.settings.local python backend/manage.py migrate

# Crear superusuario
DJANGO_SETTINGS_MODULE=config.settings.local python backend/manage.py createsuperuser

# Abrir shell de Django
DJANGO_SETTINGS_MODULE=config.settings.local python backend/manage.py shell

# Ejecutar tests
DJANGO_SETTINGS_MODULE=config.settings.local pytest backend/
```

### Frontend

```bash
# Instalar dependencias
cd frontend && npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### Docker

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra la base de datos)
docker-compose down -v

# Rebuild de imágenes
docker-compose build

# Ejecutar comando en contenedor
docker-compose exec backend python manage.py migrate
```

## 🐛 Solución de Problemas

### El backend no inicia

**Error**: `ModuleNotFoundError` o paquetes faltantes
```bash
# Reinstalar dependencias
cd backend
source venv/bin/activate
pip install -r requirements/development.txt
```

**Error**: `connection refused` a PostgreSQL
```bash
# Asegúrate de usar la configuración local con SQLite
export DJANGO_SETTINGS_MODULE=config.settings.local
python manage.py runserver
```

### El frontend no carga

**Error**: `ECONNREFUSED` al hacer peticiones
```bash
# Verifica que el backend esté corriendo en el puerto 8000
curl http://localhost:8000/api/v1/auth/token/

# Verifica la variable de entorno en frontend/.env
cat frontend/.env
# Debe contener: VITE_API_URL=http://localhost:8000/api/v1
```

**Error**: Dependencias faltantes
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Los diagramas Mermaid no se renderizan

- Verifica que el documento tenga diagramas con formato correcto
- Los diagramas deben estar dentro de `<div class="mermaid">...</div>`
- Abre la consola del navegador para ver errores específicos

### La generación con IA no funciona

- Verifica que `OPENAI_API_KEY` esté configurada en `backend/.env`
- Verifica que tengas créditos disponibles en tu cuenta de OpenAI
- Revisa los logs del backend: `docker-compose logs -f backend`

## 📚 Documentación Adicional

- **API Docs (Swagger)**: http://localhost:8000/swagger/
- **API Docs (ReDoc)**: http://localhost:8000/redoc/
- **Admin Django**: http://localhost:8000/admin/

## 🔒 Seguridad

- **Autenticación**: JWT con tokens de acceso y refresh
- **CORS**: Configurado para desarrollo local
- **CSRF**: Protección habilitada en producción
- **Rate Limiting**: Implementado en producción
- **Sanitización**: XSS y SQL injection protegidos por Django

## 📦 Estructura del Proyecto

```
koptupDocumentacion/
├── backend/                    # Django Backend
│   ├── apps/                   # Aplicaciones Django
│   │   ├── auth_app/          # Autenticación y usuarios
│   │   ├── documents/         # Gestión de documentos
│   │   ├── standards/         # Estándares y generación IA
│   │   └── workspaces/        # Espacios de trabajo
│   ├── config/                # Configuración Django
│   │   ├── settings/          # Settings por ambiente
│   │   ├── urls.py            # URLs principales
│   │   └── wsgi.py            # WSGI config
│   ├── requirements/          # Dependencias Python
│   ├── manage.py              # Django CLI
│   └── db.sqlite3             # Base de datos SQLite (local)
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # API clients
│   │   ├── store/             # Redux store
│   │   ├── utils/             # Utilidades
│   │   ├── App.jsx            # Componente raíz
│   │   └── main.jsx           # Entry point
│   ├── public/                # Archivos estáticos
│   ├── package.json           # Dependencias Node
│   └── vite.config.js         # Configuración Vite
│
├── docker-compose.yml         # Configuración Docker
├── .gitignore                 # Archivos ignorados por Git
└── README.md                  # Este archivo
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

**SOFTWARE COMERCIAL PROPIETARIO**

Este es un software comercial de uso exclusivo mediante suscripción pagada.

⚠️ **USO NO AUTORIZADO ESTÁ PROHIBIDO**

- ❌ No se permite uso sin suscripción comercial activa
- ❌ No se permite distribución, modificación o ingeniería inversa
- ❌ Todos los derechos reservados por Koptup

Para adquirir una licencia comercial válida, visite: https://koptup.com

## 👥 Equipo

Desarrollado por el equipo de Koptup.

**Repositorio**: https://github.com/ronalc90/koptupDocumentacion

---

**Estado**: 🟢 En Desarrollo Activo
**Versión**: 1.0.0
**Última Actualización**: Enero 2026
