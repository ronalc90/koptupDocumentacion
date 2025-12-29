# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

**SOFTWARE COMERCIAL PROPIETARIO** - Copyright © 2025 Koptup. Todos los derechos reservados.

---

## [1.0.0] - 2025-12-28

### ✨ Características Añadidas

#### Generación con IA
- **Generador de documentación técnica** usando OpenAI GPT-4
- **8 tipos de documentación empresarial** predefinidos:
  - 🏗️ Documentación de Infraestructura
  - 🔒 Documentación de Seguridad
  - ⚙️ Guía de Administración
  - 🚢 Guía de Despliegue
  - 🚀 Guía de Inicio Rápido
  - 🔌 Guía de Integración
  - 📦 Guía de Migración
  - 🔧 Guía de Solución de Problemas

#### Diagramas
- **Generación automática de diagramas Mermaid** integrada en documentos
- **Renderizado en tiempo real** de diagramas en el editor
- **Múltiples patrones de extracción** para máxima robustez
- Soporte para diferentes tipos: flowchart, sequence, class, ER, gantt

#### Editor de Documentos
- **Editor WYSIWYG** con Draft.js
- **Preview en tiempo real** del contenido generado
- **Renderizado automático** de diagramas Mermaid
- Conversión Markdown ↔ HTML

#### Organización
- **Sistema de Workspaces** con 4 tipos predefinidos:
  - Documentación Técnica
  - Guías y Manuales
  - Procesos
  - Base de Conocimiento
- **Sugerencia automática** de workspace según tipo de documento
- Estados de documento: DRAFT, AI_GENERATED, IN_REVIEW, APPROVED, REJECTED

### 🔧 Mejoras Técnicas

#### Backend
- Django 5.0 con Python 3.10+
- SQLite para desarrollo local (fácil setup)
- PostgreSQL listo para producción
- API REST completa con DRF
- Servicio `AIDocumentationGenerator` robusto
- Sistema de ejemplos few-shot learning
- Prompt engineering optimizado para documentación empresarial

#### Frontend
- React 18 con hooks modernos
- Material-UI 5 para UI/UX profesional
- Vite optimizado para Mermaid
- Redux Toolkit para gestión de estado
- Axios con interceptores configurados
- Manejo robusto de HTML entities

### 🐛 Correcciones

- ✅ Fixed: Select de tipo de documento con label superpuesto
- ✅ Fixed: Error 400 al guardar documentos (validación de campos)
- ✅ Fixed: Enlaces vacíos generados por IA
- ✅ Fixed: Diagramas Mermaid no renderizados (imports dinámicos de Vite)
- ✅ Fixed: HTML entities en código de diagramas
- ✅ Fixed: Diagrama separado del contenido al guardar

### 📝 Documentación

- Mensaje de commit detallado con todas las características
- Tag v1.0.0 con descripción completa
- README con instrucciones de setup
- Este CHANGELOG

### 🔒 Seguridad

- Autenticación JWT implementada
- Roles de usuario: DEV, QA, PO, ADMIN, CLIENT
- Permisos por rol configurados
- Variables de entorno para secretos

### 🚀 Despliegue

- Docker Compose configurado para desarrollo
- Scripts de inicio automatizados
- Migraciones de base de datos completas
- Script de creación de datos de prueba

---

## Próximas Versiones Planificadas

### [1.1.0] - Futuro
- [ ] Soporte para PlantUML además de Mermaid
- [ ] Generación de documentación desde código fuente
- [ ] Templates personalizables por usuario
- [ ] Exportación a PDF/DOCX
- [ ] Colaboración en tiempo real
- [ ] Historial de versiones de documentos
- [ ] Búsqueda full-text con Elasticsearch

### [1.2.0] - Futuro
- [ ] Integración con GitHub/GitLab
- [ ] CI/CD para documentación
- [ ] API pública para integraciones
- [ ] Webhooks para eventos
- [ ] Métricas y analytics de documentación

---

**Leyenda:**
- ✨ Características nuevas
- 🔧 Mejoras técnicas
- 🐛 Correcciones de bugs
- 📝 Documentación
- 🔒 Seguridad
- 🚀 Despliegue
- ⚠️ Deprecado
- 🗑️ Removido
