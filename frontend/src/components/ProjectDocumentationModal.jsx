import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  Close,
  AutoAwesome,
  CheckCircle,
  Description,
} from '@mui/icons-material';
import DiagramViewer from './DiagramViewer';
import standardsService from '../services/standardsService';
import { toast } from 'react-toastify';

const CATEGORY_INFO = {
  USE_CASE: { icon: '📝', label: 'Casos de Uso', color: '#667eea' },
  UML_DIAGRAM: { icon: '📊', label: 'Diagramas UML', color: '#f093fb' },
  API_REST: { icon: '🔌', label: 'APIs REST', color: '#4facfe' },
  DATABASE: { icon: '🗄️', label: 'Base de Datos', color: '#43e97b' },
  ARCHITECTURE: { icon: '🏗️', label: 'Arquitectura', color: '#fa709a' },
  USER_MANUAL: { icon: '📖', label: 'Manual de Usuario', color: '#30cfd0' },
  TECHNICAL_SPEC: { icon: '📋', label: 'Especificación Técnica', color: '#a8edea' },
  TEST_PLAN: { icon: '🧪', label: 'Plan de Pruebas', color: '#fed6e3' },
  DEPLOYMENT: { icon: '🚀', label: 'Despliegue', color: '#c471ed' },
  OTHER: { icon: '📄', label: 'Otro', color: '#667eea' },
};

/**
 * ProjectDocumentationModal - Modal para generar documentación completa de un proyecto
 */
const ProjectDocumentationModal = ({ open, onClose, project }) => {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!project) return;

    try {
      setGenerating(true);
      setResult(null);

      const response = await standardsService.generateProjectDocumentation(project.id);

      if (response.success) {
        setResult(response);
        toast.success(`Documentación generada exitosamente en ${response.generation_time.toFixed(1)}s`);
      } else {
        toast.error(response.error || 'Error al generar documentación');
      }
    } catch (error) {
      console.error('Error generating project documentation:', error);
      toast.error('Error al generar documentación del proyecto');
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  const downloadDocumentation = () => {
    if (!result) return;

    let markdown = `# Documentación del Proyecto: ${result.project_name}\n\n`;
    markdown += `**Generado automáticamente con IA**\n\n`;
    markdown += `**Fecha:** ${new Date().toLocaleDateString()}\n`;
    markdown += `**Total de tareas:** ${result.tasks_count}\n`;
    markdown += `**Tiempo de generación:** ${result.generation_time.toFixed(2)}s\n\n`;
    markdown += `---\n\n`;

    Object.entries(result.documentation).forEach(([category, doc]) => {
      if (doc.error) return;

      const catInfo = CATEGORY_INFO[category] || CATEGORY_INFO.OTHER;
      markdown += `# ${catInfo.icon} ${doc.standard_name}\n\n`;
      markdown += `${doc.content}\n\n`;

      if (doc.diagram_code) {
        markdown += `## Diagrama\n\n\`\`\`mermaid\n${doc.diagram_code}\n\`\`\`\n\n`;
      }

      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.project_name.replace(/\s+/g, '_')}_documentacion.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Documentación descargada');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="primary" />
            <Typography variant="h6">
              Generar Documentación Completa del Proyecto
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {!result ? (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Esta función generará documentación completa para el proyecto{' '}
              <strong>{project?.name}</strong> usando inteligencia artificial.
              <br />
              Se generarán múltiples tipos de documentación: casos de uso, arquitectura,
              diagramas, APIs, base de datos, y más.
            </Alert>

            <Box sx={{ textAlign: 'center', py: 4 }}>
              {generating ? (
                <Box>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Generando documentación...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Esto puede tomar varios minutos dependiendo del tamaño del proyecto
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <AutoAwesome sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Haz clic en "Generar" para comenzar
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f7fa', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle color="success" />
                <Typography variant="h6">
                  Documentación generada exitosamente
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Proyecto: <strong>{result.project_name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tareas documentadas: <strong>{result.tasks_count}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tiempo de generación: <strong>{result.generation_time.toFixed(2)}s</strong>
              </Typography>
            </Box>

            {Object.entries(result.documentation).map(([category, doc]) => {
              const catInfo = CATEGORY_INFO[category] || CATEGORY_INFO.OTHER;

              if (doc.error) {
                return (
                  <Alert severity="warning" key={category} sx={{ mb: 2 }}>
                    <strong>{catInfo.label}:</strong> {doc.error}
                  </Alert>
                );
              }

              return (
                <Accordion key={category} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="h5">{catInfo.icon}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {doc.standard_name}
                      </Typography>
                      <Chip
                        label={doc.model_used || 'GPT-4'}
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Description fontSize="small" />
                        Contenido:
                      </Typography>
                      <Box
                        sx={{
                          maxHeight: 400,
                          overflow: 'auto',
                          p: 2,
                          mb: 2,
                          backgroundColor: '#f5f7fa',
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {doc.content}
                      </Box>

                      {doc.diagram_code && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Diagrama:
                          </Typography>
                          <DiagramViewer code={doc.diagram_code} type="mermaid" />
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {result ? 'Cerrar' : 'Cancelar'}
        </Button>
        {result && (
          <Button variant="outlined" onClick={downloadDocumentation}>
            Descargar Markdown
          </Button>
        )}
        {!result && (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesome />}
          >
            {generating ? 'Generando...' : 'Generar Documentación'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDocumentationModal;
