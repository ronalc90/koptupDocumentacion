# Índice de Flujos por Rol

- Roles definidos en `backend/apps/users/models.py:80-86`.
- Objetivo: identificar qué flujo corresponde a cada rol y qué acciones realiza.

## Roles y Flujos
- ADMIN
  - Flujo: Configuración y supervisión
  - Acciones: gestionar organizaciones/usuarios, definir estándares, revisar auditoría, certificar entregas.
  - Doc: `[ADMIN](./roles/admin.md)`
  - Nota: ADMIN puede usar todas las funcionalidades para pruebas.
- PO
  - Flujo: Dirección de proyecto
  - Acciones: crear proyectos, configurar estándares, solicitar QA, gestionar checklist y reportes.
  - Doc: `[PO](./roles/po.md)`
- DEV
  - Flujo: Implementación y documentación
  - Acciones: crear/editar documentos, adjuntos, atender incidencias QA, gestionar tareas ágiles.
  - Doc: `[DEV](./roles/dev.md)`
- QA
  - Flujo: Validación de calidad
  - Acciones: ejecutar validaciones, crear QA reviews, incidencias y checkpoints; actualizar estados.
  - Doc: `[QA](./roles/qa.md)`
- CLIENT
  - Flujo: Aprobación y entrega
  - Acciones: revisar documentos y checklist, aprobar/rechazar entregables, descargar certificados.
  - Doc: `[CLIENT](./roles/client.md)`

## Enlaces UI
- `/projects`, `/projects/:id`
- `/standards`
- `/documents`, `/documents/:id`
- `/validation`
- `/checklist`
- `/audit`
- `/agile`

## Endpoints (prefijo `/api/v1/`)
- Proyectos: `projects/projects/`
- Estándares: `standards/document-types/`, `standards/templates/`, `standards/rules/`
- Documentos: `documents/documents/`, `documents/versions/`, `documents/comments/`, `documents/attachments/`
- Validación: `validation/results/`, `validation/qa-reviews/`, `validation/issues/`, `validation/checkpoints/`
- Checklist: `checklist/checklists/`, `checklist/items/`, `checklist/blocking-issues/`, `checklist/certificates/`
- Auditoría: `audit/logs/`, `audit/approvals/`, `audit/access/`, `audit/compliance-reports/`, `audit/retention-policies/`, `audit/security-events/`
- Ágil: `agile/epics/`, `agile/user-stories/`, `agile/tasks/`, `agile/sprints/`
