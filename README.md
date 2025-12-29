# Koptup Documentación - Plataforma de Gestión Documental

Sistema enterprise para centralizar, estandarizar, generar, validar y certificar documentación de proyectos con soporte de IA.

## 🏗️ Arquitectura

### Backend: Django + Django REST Framework
- Django 5.x
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Celery + Redis

### Frontend: React + Vite
- React 18
- Redux Toolkit
- Material-UI
- Axios
- TipTap Editor

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker y Docker Compose
- Python 3.11+ (desarrollo local)
- Node.js 18+ (desarrollo local)

### Usando Docker (Recomendado)

```bash
# Clonar el repositorio
cd "Proyecto Documentacion"

# Copiar archivos de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Levantar servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# El sistema estará disponible en:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Django: http://localhost:8000/admin
# API Docs: http://localhost:8000/swagger
```

### Desarrollo Local

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements/development.txt

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar servidor de desarrollo
npm run dev
```

## 📦 Módulos del Sistema

### 1. Users & Auth
- Gestión de usuarios y organizaciones
- Autenticación JWT
- Roles: Admin, PO, Dev, QA, Cliente

### 2. Standards
- Tipos de documentación
- Plantillas oficiales
- Reglas de validación
- Versionado de plantillas

### 3. Projects
- Gestión de proyectos
- Clientes y metodologías
- Fases y equipos
- Estados del proyecto

### 4. Agile
- Épicas
- Historias de usuario
- Tareas técnicas
- Sprints

### 5. Documents
- Gestión documental
- Editor rico
- Versionado
- Comentarios y adjuntos

### 6. AI Engine
- RAG (Retrieval-Augmented Generation)
- Generación asistida por IA
- Embeddings de plantillas
- Logs y feedback

### 7. Validation
- Validación automática
- Revisiones QA
- Issues y checkpoints

### 8. Checklist
- Checklist de entrega
- Certificación de proyectos
- Bloqueos e issues

### 9. Audit
- Logs de auditoría
- Historial de aprobaciones
- Cumplimiento (ISO, SOC2, GDPR)
- Eventos de seguridad

## 📡 Endpoints API Principales

### Autenticación
- `POST /api/v1/auth/token/` - Login
- `POST /api/v1/auth/token/refresh/` - Refresh token
- `GET /api/v1/auth/users/me/` - Usuario actual

### Proyectos
- `GET /api/v1/projects/projects/` - Listar proyectos
- `POST /api/v1/projects/projects/` - Crear proyecto
- `GET /api/v1/projects/projects/{id}/` - Detalle proyecto

### Documentos
- `GET /api/v1/documents/documents/` - Listar documentos
- `POST /api/v1/documents/documents/` - Crear documento
- `PUT /api/v1/documents/documents/{id}/` - Actualizar documento

### Ágil
- `GET /api/v1/agile/epics/` - Listar épicas
- `GET /api/v1/agile/user-stories/` - Listar historias
- `GET /api/v1/agile/tasks/` - Listar tareas

## 🔒 Seguridad

- Autenticación JWT
- RBAC (Role-Based Access Control)
- Multi-tenant
- Logs inmutables
- CORS configurado
- Rate limiting (producción)

## 📝 Variables de Entorno

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DB_NAME=doc_platform
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=your-openai-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api/v1
```

## 🧪 Testing

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📚 Documentación

- API Docs (Swagger): http://localhost:8000/swagger/
- API Docs (ReDoc): http://localhost:8000/redoc/
- Estado del Proyecto: [PROJECT_STATUS.md](PROJECT_STATUS.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

**SOFTWARE COMERCIAL PROPIETARIO**

Este es un software comercial de uso exclusivo mediante suscripción pagada.

⚠️ **USO NO AUTORIZADO ESTÁ PROHIBIDO**

- ❌ No se permite uso sin suscripción comercial activa
- ❌ No se permite distribución, modificación o ingeniería inversa
- ❌ Todos los derechos reservados por Koptup

Para adquirir una licencia comercial válida, visite: https://koptup.com/pricing

Ver [LICENSE](./LICENSE) para términos completos de la licencia.
Ver [TERMS_AND_CONDITIONS.md](./TERMS_AND_CONDITIONS.md) para términos de uso del servicio.

## 👥 Equipo

Desarrollado por el equipo de documentación corporativa.

---

**Estado**: 🟢 En Desarrollo
**Versión**: 1.0.0-alpha
