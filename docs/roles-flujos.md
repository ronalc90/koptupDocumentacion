# Roles de Usuario y Flujos Operativos

## Tipos de usuario
- ADMIN: Administrador de Plataforma. Definido en `backend/apps/users/models.py:80-86`.
- PO: Product Owner. Definido en `backend/apps/users/models.py:80-86`.
- DEV: Desarrollador. Definido en `backend/apps/users/models.py:80-86`.
- QA: QA/Tester. Definido en `backend/apps/users/models.py:80-86`.
- CLIENT: Cliente/Stakeholder. Definido en `backend/apps/users/models.py:80-86`.

Nota: El backend expone endpoints autenticados (IsAuthenticated). La autorización por rol puede complementarse con políticas adicionales; este documento describe las capacidades esperadas por rol en la plataforma.

## Módulos y capacidades

### Proyectos
- ADMIN: crea/edita proyectos, gestiona equipo y visibilidad.
- PO: crea/edita proyectos de su organización, configura metadatos.
- DEV: visualiza y participa en proyectos asignados.
- QA: visualiza proyectos, consulta estado para validaciones.
- CLIENT: visualiza proyectos aprobados y entregables.

### Estándares Documentales
- ADMIN: define tipos, plantillas oficiales y reglas globales.
- PO: adapta estándares a su proyecto/organización; solicita plantillas.
- DEV: consulta estándares aplicables antes de redactar documentos.
- QA: consulta reglas para validación documental.
- CLIENT: consulta plantillas públicas asociadas a entregables.

### Gestión de Documentos
- ADMIN: acceso completo; puede editar, aprobar y eliminar si es necesario.
- PO: crea y edita documentos del proyecto; gestiona versiones y aprobación.
- DEV: crea/edita documentos vinculados a historias/tareas; sube adjuntos y comenta.
- QA: revisa documentos, deja comentarios; marca estados tras validación.
- CLIENT: lectura; puede aprobar/rechazar entregables según acuerdos.

### Validación y QA
- ADMIN: consulta resultados; crea revisiones QA e incidencias globales.
- PO: solicita revisiones QA; gestiona incidencias y checkpoints de proyecto.
- DEV: atiende incidencias; actualiza documentos hasta aprobación.
- QA: crea revisiones QA, checkpoints y incidencias; registra resultados de validación.
- CLIENT: consulta estado de validación previo a la entrega.

### Checklist de Entrega
- ADMIN: crea checklist por proyecto; define ítems; certifica entregas.
- PO: crea checklist; gestiona ítems y bloqueos; impulsa certificación.
- DEV: completa ítems (p. ej., documentación aprobada, historias cerradas).
- QA: valida ítems de QA; marca checkpoints; reporta bloqueos.
- CLIENT: consulta checklist y certificados; descarga documentación final.

### Auditoría y Cumplimiento
- ADMIN: consulta logs/aprobaciones/accesos; crea reportes, políticas y eventos.
- PO: genera reportes de cumplimiento del proyecto; consulta aprobaciones.
- DEV: sin creación; puede consultar accesos propios y eventos relevantes.
- QA: consulta aprobaciones y eventos de seguridad relacionados con QA.
- CLIENT: lectura acotada de reportes de cumplimiento del proyecto.

### Gestión Ágil
- ADMIN: acceso a épicas/historias/tareas; soporte operativo.
- PO: crea épicas e historias; prioriza y da seguimiento.
- DEV: crea tareas; actualiza estados; vincula documentación.
- QA: crea tareas de pruebas; marca criterios de aceptación y estados.
- CLIENT: lectura del avance (sprints, historias).

## Flujos principales por rol

### ADMIN
- Configura organización y usuarios.
- Define estándares (tipos, plantillas, reglas).
- Revisa auditoría: crea reportes, políticas y registra eventos.
- Supervisa proyectos, checklist y certificación de entregas.

### PO
- Crea proyecto y equipo.
- Configura estándares del proyecto.
- Solicita validación QA de documentos clave.
- Gestiona checklist y solicita certificación de entrega.
- Genera reportes de cumplimiento del proyecto.

### DEV
- Crea documentos vinculados a historias/tareas.
- Responde comentarios e incidencias QA.
- Actualiza tareas y estados en Gestión Ágil.
- Adjunta evidencia y mantiene versiones.

### QA
- Ejecuta validación automática y manual (QA Reviews).
- Registra incidencias y checkpoints.
- Cambia estado de documentos tras validación.
- Marca ítems de checklist relacionados con calidad.

### CLIENT
- Consulta documentos y checklist de entrega.
- Aprueba/rechaza entregables.
- Descarga certificados y documentación final.

## Enlaces de interfaz
- Login: `/login`
- Proyectos: `/projects`, detalle `/projects/:id`
- Estándares: `/standards`
- Documentos: `/documents`, editor `/documents/:id`
- Validación: `/validation`
- Checklist: `/checklist`
- Auditoría: `/audit`
- Ágil: `/agile`

## Endpoints relevantes (prefijo `/api/v1/`)
- Proyectos: `projects/projects/`
- Estándares: `standards/document-types/`, `standards/templates/`, `standards/rules/`
- Documentos: `documents/documents/`, `documents/versions/`, `documents/comments/`, `documents/attachments/`
- Validación: `validation/results/`, `validation/qa-reviews/`, `validation/issues/`, `validation/checkpoints/`
- Checklist: `checklist/checklists/`, `checklist/items/`, `checklist/blocking-issues/`, `checklist/certificates/`
- Auditoría: `audit/logs/`, `audit/approvals/`, `audit/access/`, `audit/compliance-reports/`, `audit/retention-policies/`, `audit/security-events/`
- Ágil: `agile/epics/`, `agile/user-stories/`, `agile/tasks/`, `agile/sprints/`
