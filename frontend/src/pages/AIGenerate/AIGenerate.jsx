import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  AutoAwesome,
  Description,
  Code,
  Article,
  Assessment,
  CheckCircle,
  Folder,
  Save,
  Preview,
  Cancel,
} from '@mui/icons-material';
import { marked } from 'marked';
import standardsService from '../../services/standardsService';
import workspaceService from '../../services/workspaceService';
import documentService from '../../services/documentService';

const AIGenerate = () => {
  const navigate = useNavigate();
  const [standards, setStandards] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingStandards, setLoadingStandards] = useState(true);

  useEffect(() => {
    fetchStandards();
    fetchWorkspaces();
  }, []);

  const fetchStandards = async () => {
    setLoadingStandards(true);
    try {
      const data = await standardsService.getAll({ is_active: true });
      const standardsList = data.results || data || [];

      // Si no hay estándares del backend, usar valores por defecto
      if (standardsList.length === 0) {
        loadDefaultStandards();
      } else {
        setStandards(standardsList);
      }
    } catch (err) {
      console.error('Error al cargar estándares:', err);
      // Si falla la llamada, cargar valores por defecto
      loadDefaultStandards();
    } finally {
      setLoadingStandards(false);
    }
  };

  const loadDefaultStandards = () => {
    // Estándares por defecto cuando no hay en el backend
    const defaultStandards = [
      {
        id: 'default-1',
        name: 'Documentación de Infraestructura',
        description: 'Documentación técnica sobre arquitectura, infraestructura y configuración de sistemas',
        category: 'TECHNICAL_SPEC',
        icon: '🏗️',
        color: '#1976D2',
        is_default: true,
      },
      {
        id: 'default-2',
        name: 'Guías de Administración',
        description: 'Manuales para administradores del sistema con procedimientos y configuraciones',
        category: 'USER_MANUAL',
        icon: '⚙️',
        color: '#F57C00',
        is_default: true,
      },
      {
        id: 'default-3',
        name: 'Procedimientos de Despliegue',
        description: 'Documentación sobre procesos de despliegue, CI/CD y DevOps',
        category: 'PROCESS',
        icon: '🚀',
        color: '#388E3C',
        is_default: true,
      },
      {
        id: 'default-4',
        name: 'Guías de Desarrollo',
        description: 'Documentación para desarrolladores sobre APIs, componentes y arquitectura',
        category: 'API_DOC',
        icon: '💻',
        color: '#7B1FA2',
        is_default: true,
      },
      {
        id: 'default-5',
        name: 'Casos de Uso',
        description: 'Documentación de casos de uso con flujos, actores y escenarios',
        category: 'USE_CASE',
        icon: '📋',
        color: '#0288D1',
        is_default: true,
      },
      {
        id: 'default-6',
        name: 'Diagramas UML',
        description: 'Documentación con diagramas UML (clases, secuencia, componentes)',
        category: 'UML_DIAGRAM',
        icon: '📊',
        color: '#D32F2F',
        is_default: true,
      },
      {
        id: 'default-7',
        name: 'Preguntas Frecuentes (FAQ)',
        description: 'Base de conocimiento con preguntas y respuestas frecuentes',
        category: 'FAQ',
        icon: '❓',
        color: '#C2185B',
        is_default: true,
      },
      {
        id: 'default-8',
        name: 'Manuales de Usuario',
        description: 'Guías paso a paso para usuarios finales del sistema',
        category: 'USER_MANUAL',
        icon: '📖',
        color: '#5E35B1',
        is_default: true,
      },
    ];

    setStandards(defaultStandards);
  };

  const fetchWorkspaces = async () => {
    try {
      const data = await workspaceService.getAll({ is_active: true });
      setWorkspaces(data.results || data || []);
    } catch (err) {
      console.error('Error al cargar workspaces:', err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedStandard || !userPrompt.trim()) {
      setError('Por favor selecciona un tipo de documento e ingresa una descripción');
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const result = await standardsService.generate({
        standard_id: selectedStandard,
        user_prompt: userPrompt,
      });

      if (result.success) {
        setGeneratedContent(result.data);
        // Sugerir título basado en el prompt
        setDocumentTitle(extractTitleFromPrompt(userPrompt));
        // Sugerir workspace basado en el estándar
        const standard = standards.find(s => s.id === selectedStandard);
        if (standard) {
          suggestWorkspace(standard);
        }
      } else {
        setError(result.error || 'Error al generar el documento');
      }
    } catch (err) {
      console.error('Error al generar:', err);
      setError(err.response?.data?.error || 'No se pudo generar el documento');
    } finally {
      setGenerating(false);
    }
  };

  const extractTitleFromPrompt = (prompt) => {
    // Extraer las primeras palabras como título sugerido
    const words = prompt.trim().split(' ');
    return words.slice(0, Math.min(6, words.length)).join(' ');
  };

  const suggestWorkspace = (standard) => {
    // Sugerir workspace basado en la categoría del estándar
    const categoryToType = {
      'USE_CASE': 'TECHNICAL',
      'UML_DIAGRAM': 'TECHNICAL',
      'USER_MANUAL': 'GUIDES',
      'TECHNICAL_SPEC': 'TECHNICAL',
      'API_DOC': 'TECHNICAL',
      'PROCESS': 'PROCESSES',
      'FAQ': 'KNOWLEDGE_BASE',
    };

    const suggestedType = categoryToType[standard.category];
    const workspace = workspaces.find(w => w.type === suggestedType);
    if (workspace) {
      setSelectedWorkspace(workspace.id);
    }
  };

  const handleOpenSaveDialog = () => {
    if (!generatedContent) return;
    setSaveDialogOpen(true);
  };

  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  const convertMarkdownToHTML = (markdownContent) => {
    // Configurar marked para manejar diagramas Mermaid
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Convertir markdown a HTML
    let html = marked.parse(markdownContent);

    // Reemplazar bloques de código mermaid con divs que se pueden renderizar
    html = html.replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      (match, code) => {
        // Decodificar entidades HTML que marked puede haber escapado
        const decodedCode = code
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

        // Preservar saltos de línea convirtiéndolos a <br> para el HTML
        const codeWithBreaks = decodedCode.replace(/\n/g, '<br>');

        return `<div class="mermaid" style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 16px 0;">${codeWithBreaks}</div>`;
      }
    );

    return html;
  };

  const handleSaveDocument = async () => {
    if (!documentTitle.trim() || !selectedWorkspace) {
      setError('Por favor ingresa un título y selecciona un espacio');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Combinar contenido y diagrama en markdown antes de convertir a HTML
      let fullMarkdownContent = generatedContent.content;

      // Si hay un diagrama, agregarlo al final del contenido
      if (generatedContent.diagram_code) {
        fullMarkdownContent += '\n\n## Diagrama\n\n```mermaid\n' + generatedContent.diagram_code + '\n```';
      }

      // Convertir el contenido markdown completo a HTML
      const htmlContent = convertMarkdownToHTML(fullMarkdownContent);

      const newDocument = await documentService.create({
        title: documentTitle,
        content: htmlContent,
        workspace: selectedWorkspace,
        status: 'EN_REVISION',
      });

      // Redirigir al documento creado
      navigate(`/documents/${newDocument.id}`);
    } catch (err) {
      console.error('Error al guardar documento:', err);
      setError('No se pudo guardar el documento');
      setSaving(false);
    }
  };

  const getWorkspaceSuggestion = () => {
    if (!selectedStandard || workspaces.length === 0) return null;

    const standard = standards.find(s => s.id === selectedStandard);
    if (!standard) return null;

    const categoryToType = {
      'USE_CASE': 'TECHNICAL',
      'UML_DIAGRAM': 'TECHNICAL',
      'USER_MANUAL': 'GUIDES',
      'TECHNICAL_SPEC': 'TECHNICAL',
      'API_DOC': 'TECHNICAL',
      'PROCESS': 'PROCESSES',
      'FAQ': 'KNOWLEDGE_BASE',
    };

    const suggestedType = categoryToType[standard.category];
    const workspace = workspaces.find(w => w.type === suggestedType);

    return workspace;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Generar con IA
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Crea documentación automáticamente con inteligencia artificial
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={generatedContent ? 6 : 8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Nueva Generación
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="standard-select-label">Tipo de Documento</InputLabel>
              <Select
                labelId="standard-select-label"
                value={selectedStandard || ''}
                label="Tipo de Documento"
                onChange={(e) => setSelectedStandard(e.target.value)}
                disabled={generating}
                renderValue={(value) => {
                  if (!value) return '';
                  const standard = standards.find(s => s.id === value);
                  if (!standard) return '';
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{standard.icon}</span>
                      <span>{standard.name}</span>
                    </Box>
                  );
                }}
              >
                <MenuItem value="" disabled>
                  <span style={{ color: '#999' }}>Selecciona un tipo de documento</span>
                </MenuItem>
                {standards.map((standard) => (
                  <MenuItem key={standard.id} value={standard.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{standard.icon}</span>
                      <span>{standard.name}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={8}
              label="Descripción del Documento"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe qué quieres documentar. Ej: Sistema de autenticación con email y contraseña, incluyendo recuperación de contraseña y verificación de email..."
              sx={{ mb: 3 }}
              disabled={generating}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
              onClick={handleGenerate}
              disabled={generating || !selectedStandard || !userPrompt.trim()}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                py: 1.5,
                fontSize: 16,
              }}
            >
              {generating ? 'Generando...' : 'Generar Documento con IA'}
            </Button>

            {generatedContent && (
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Save />}
                onClick={handleOpenSaveDialog}
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  py: 1.5,
                  fontSize: 16,
                }}
              >
                Guardar Documento
              </Button>
            )}
          </Paper>
        </Grid>

        {generatedContent ? (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, maxHeight: '70vh', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Documento Generado
                </Typography>
                <Chip
                  icon={<CheckCircle />}
                  label="Generado con IA"
                  color="success"
                  size="small"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{
                fontSize: 14,
                lineHeight: 1.6,
                '& h1': {
                  fontSize: '2rem',
                  fontWeight: 700,
                  marginTop: 2,
                  marginBottom: 1,
                },
                '& h2': {
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  marginTop: 2,
                  marginBottom: 1,
                },
                '& h3': {
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginTop: 1.5,
                  marginBottom: 0.5,
                },
                '& p': {
                  marginBottom: 1,
                },
                '& ul, & ol': {
                  marginLeft: 3,
                  marginBottom: 1,
                },
                '& code': {
                  backgroundColor: '#f5f5f5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                },
                '& pre': {
                  backgroundColor: '#f5f5f5',
                  padding: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  marginBottom: 2,
                },
                '& table': {
                  borderCollapse: 'collapse',
                  width: '100%',
                  marginBottom: 2,
                },
                '& th, & td': {
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'left',
                },
                '& th': {
                  backgroundColor: '#f5f5f5',
                  fontWeight: 600,
                },
              }}>
                <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(generatedContent.content) }} />
              </Box>

              {generatedContent.diagram_code && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Diagrama Incluido
                  </Typography>
                  <Box sx={{
                    bgcolor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}>
                    {generatedContent.diagram_code}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        ) : (
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Tipos de Documentos
              </Typography>
              {standards.slice(0, 4).map((standard) => (
                <Card
                  key={standard.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    border: selectedStandard === standard.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                  onClick={() => setSelectedStandard(standard.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography sx={{ fontSize: 32 }}>{standard.icon}</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {standard.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {standard.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Paper sx={{ p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                💡 Consejos
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: 12 }}>
                • Sé específico en los detalles
                <br />
                • Incluye contexto relevante
                <br />
                • Menciona audiencia objetivo
                <br />
                • Especifica formato deseado
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Diálogo para guardar documento */}
      <Dialog open={saveDialogOpen} onClose={handleCloseSaveDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Guardar Documento Generado
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Título del Documento"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Ingresa un título descriptivo"
              sx={{ mb: 3 }}
              autoFocus
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Espacio de Trabajo</InputLabel>
              <Select
                value={selectedWorkspace}
                label="Espacio de Trabajo"
                onChange={(e) => setSelectedWorkspace(e.target.value)}
              >
                {workspaces.map((workspace) => (
                  <MenuItem key={workspace.id} value={workspace.id}>
                    {workspace.name} - {workspace.type_display}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {getWorkspaceSuggestion() && (
              <Alert severity="info" icon={<Folder />} sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Sugerencia:</strong> Este tipo de documento encaja bien en el espacio{' '}
                  <strong>"{getWorkspaceSuggestion().name}"</strong>
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseSaveDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveDocument}
            variant="contained"
            disabled={saving || !documentTitle.trim() || !selectedWorkspace}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIGenerate;
