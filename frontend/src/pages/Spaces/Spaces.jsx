import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Description,
  Code,
  AccountTree,
  MenuBook,
  Lightbulb,
  Edit,
  Delete,
  Settings,
  People,
  Folder,
  Work,
  Assignment,
  Build,
  BugReport,
  Dashboard,
  DataObject,
  DeviceHub,
  Dns,
  Extension,
  Fingerprint,
  Grading,
  Hub,
  IntegrationInstructions,
  Language,
  Layers,
  Memory,
  Policy,
  Psychology,
  Quiz,
  School,
  Science,
  Security,
  SettingsApplications,
  Source,
  Speed,
  Storage,
  Terminal,
  VerifiedUser,
  Widgets,
  CloudQueue,
  Functions,
  Api,
  CheckCircle,
  Palette,
} from '@mui/icons-material';
import workspaceService from '../../services/workspaceService';

// Galería completa de iconos disponibles
const AVAILABLE_ICONS = [
  { name: 'Code', component: Code, category: 'technical' },
  { name: 'Terminal', component: Terminal, category: 'technical' },
  { name: 'DataObject', component: DataObject, category: 'technical' },
  { name: 'Source', component: Source, category: 'technical' },
  { name: 'Functions', component: Functions, category: 'technical' },
  { name: 'Api', component: Api, category: 'technical' },
  { name: 'IntegrationInstructions', component: IntegrationInstructions, category: 'technical' },
  { name: 'Storage', component: Storage, category: 'technical' },
  { name: 'Memory', component: Memory, category: 'technical' },
  { name: 'CloudQueue', component: CloudQueue, category: 'technical' },

  { name: 'AccountTree', component: AccountTree, category: 'processes' },
  { name: 'Hub', component: Hub, category: 'processes' },
  { name: 'DeviceHub', component: DeviceHub, category: 'processes' },
  { name: 'Layers', component: Layers, category: 'processes' },
  { name: 'Extension', component: Extension, category: 'processes' },
  { name: 'Widgets', component: Widgets, category: 'processes' },
  { name: 'Build', component: Build, category: 'processes' },
  { name: 'Settings', component: Settings, category: 'processes' },
  { name: 'SettingsApplications', component: SettingsApplications, category: 'processes' },
  { name: 'Speed', component: Speed, category: 'processes' },

  { name: 'MenuBook', component: MenuBook, category: 'guides' },
  { name: 'Description', component: Description, category: 'guides' },
  { name: 'Assignment', component: Assignment, category: 'guides' },
  { name: 'Grading', component: Grading, category: 'guides' },
  { name: 'School', component: School, category: 'guides' },
  { name: 'Quiz', component: Quiz, category: 'guides' },
  { name: 'Policy', component: Policy, category: 'guides' },
  { name: 'CheckCircle', component: CheckCircle, category: 'guides' },

  { name: 'Lightbulb', component: Lightbulb, category: 'knowledge' },
  { name: 'Psychology', component: Psychology, category: 'knowledge' },
  { name: 'Science', component: Science, category: 'knowledge' },
  { name: 'Language', component: Language, category: 'knowledge' },
  { name: 'Dashboard', component: Dashboard, category: 'knowledge' },

  { name: 'Folder', component: Folder, category: 'general' },
  { name: 'Work', component: Work, category: 'general' },
  { name: 'BugReport', component: BugReport, category: 'general' },
  { name: 'Security', component: Security, category: 'general' },
  { name: 'VerifiedUser', component: VerifiedUser, category: 'general' },
  { name: 'Fingerprint', component: Fingerprint, category: 'general' },
  { name: 'Dns', component: Dns, category: 'general' },
  { name: 'Palette', component: Palette, category: 'general' },
];

// Mapa de iconos por nombre para fácil acceso
const ICON_MAP = AVAILABLE_ICONS.reduce((acc, icon) => {
  acc[icon.name] = icon.component;
  return acc;
}, {});

// Paleta de colores predefinidos
const COLOR_PALETTE = [
  { name: 'Azul', value: '#2196F3' },
  { name: 'Azul Oscuro', value: '#1976D2' },
  { name: 'Índigo', value: '#3F51B5' },
  { name: 'Púrpura', value: '#9C27B0' },
  { name: 'Morado Oscuro', value: '#673AB7' },
  { name: 'Rosa', value: '#E91E63' },
  { name: 'Rojo', value: '#F44336' },
  { name: 'Naranja', value: '#FF9800' },
  { name: 'Naranja Oscuro', value: '#FF5722' },
  { name: 'Amarillo', value: '#FFC107' },
  { name: 'Verde Lima', value: '#8BC34A' },
  { name: 'Verde', value: '#4CAF50' },
  { name: 'Verde Azulado', value: '#009688' },
  { name: 'Cian', value: '#00BCD4' },
  { name: 'Azul Claro', value: '#03A9F4' },
  { name: 'Gris Azulado', value: '#607D8B' },
  { name: 'Marrón', value: '#795548' },
  { name: 'Gris', value: '#9E9E9E' },
];

// Iconos predeterminados por tipo
const DEFAULT_ICONS = {
  TECHNICAL: 'Code',
  PROCESSES: 'AccountTree',
  GUIDES: 'MenuBook',
  KNOWLEDGE_BASE: 'Lightbulb',
};

// Colores predeterminados por tipo
const DEFAULT_COLORS = {
  TECHNICAL: '#2196F3',
  PROCESSES: '#4CAF50',
  GUIDES: '#FF9800',
  KNOWLEDGE_BASE: '#9C27B0',
};

// Tipos de workspace
const WORKSPACE_TYPES = [
  { value: 'TECHNICAL', label: 'Documentación Técnica' },
  { value: 'PROCESSES', label: 'Procesos' },
  { value: 'GUIDES', label: 'Guías' },
  { value: 'KNOWLEDGE_BASE', label: 'Base de Conocimiento' },
];

const Spaces = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Diálogo de crear/editar workspace
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'TECHNICAL',
    description: '',
    color: '#2196F3',
    icon: 'Code',
  });

  // Menú de opciones (3 puntos)
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  // Diálogo de confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

  // Notificaciones (Snackbar)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
  });

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workspaceService.getAll({ is_active: true });
      setWorkspaces(data.results || data || []);
    } catch (err) {
      console.error('Error al cargar workspaces:', err);
      setError('No se pudieron cargar los espacios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleViewDocuments = (workspace) => {
    navigate(`/?workspace=${workspace.id}`);
  };

  // Abrir diálogo para crear workspace
  const handleOpenCreateDialog = () => {
    setEditingWorkspace(null);
    setFormData({
      name: '',
      type: 'TECHNICAL',
      description: '',
      color: DEFAULT_COLORS.TECHNICAL,
      icon: DEFAULT_ICONS.TECHNICAL,
    });
    setOpenDialog(true);
  };

  // Abrir diálogo para editar workspace
  const handleOpenEditDialog = (workspace) => {
    setEditingWorkspace(workspace);
    setFormData({
      name: workspace.name,
      type: workspace.type,
      description: workspace.description || '',
      color: workspace.color || DEFAULT_COLORS[workspace.type],
      icon: workspace.icon || DEFAULT_ICONS[workspace.type],
    });
    setOpenDialog(true);
    handleCloseMenu();
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWorkspace(null);
    setFormData({
      name: '',
      type: 'TECHNICAL',
      description: '',
      color: '#2196F3',
      icon: 'Code',
    });
  };

  // Guardar workspace (crear o editar)
  const handleSaveWorkspace = async () => {
    try {
      if (editingWorkspace) {
        // Editar existente
        await workspaceService.update(editingWorkspace.id, formData);
        setSnackbar({
          open: true,
          message: 'Espacio actualizado correctamente',
          severity: 'success',
        });
      } else {
        // Crear nuevo
        await workspaceService.create(formData);
        setSnackbar({
          open: true,
          message: 'Espacio creado correctamente',
          severity: 'success',
        });
      }

      handleCloseDialog();
      fetchWorkspaces();
    } catch (err) {
      console.error('Error al guardar workspace:', err);

      // Extraer mensaje de error amigable
      let errorMessage = 'No se pudo guardar el espacio';

      if (err.response?.data) {
        const data = err.response.data;

        // Casos específicos con mensajes amigables
        if (data.organization) {
          errorMessage = 'Tu cuenta debe estar asociada a una organización para crear espacios';
        } else if (data.name) {
          const nameError = data.name[0];
          // Detectar error de nombre duplicado
          if (nameError.includes('already exists') || nameError.includes('unique') || nameError.includes('ya existe')) {
            errorMessage = 'Ya existe un espacio con este nombre en tu organización';
          } else {
            errorMessage = `El nombre del espacio no es válido: ${nameError}`;
          }
        } else if (data.non_field_errors) {
          const nonFieldError = data.non_field_errors[0];
          // Detectar error de unique_together
          if (nonFieldError.includes('already exists') || nonFieldError.includes('unique')) {
            errorMessage = 'Ya existe un espacio con este nombre en tu organización';
          } else {
            errorMessage = nonFieldError;
          }
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  // Abrir menú de opciones
  const handleOpenMenu = (event, workspace) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedWorkspace(workspace);
  };

  // Cerrar menú de opciones
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedWorkspace(null);
  };

  // Abrir diálogo de eliminación
  const handleOpenDeleteDialog = (workspace) => {
    setWorkspaceToDelete(workspace);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  // Cerrar diálogo de eliminación
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setWorkspaceToDelete(null);
  };

  // Eliminar workspace
  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;

    try {
      await workspaceService.delete(workspaceToDelete.id);
      handleCloseDeleteDialog();
      setSnackbar({
        open: true,
        message: 'Espacio eliminado correctamente',
        severity: 'success',
      });
      fetchWorkspaces();
    } catch (err) {
      console.error('Error al eliminar workspace:', err);
      handleCloseDeleteDialog();
      setSnackbar({
        open: true,
        message: 'No se pudo eliminar el espacio. Verifica que no tenga documentos asociados.',
        severity: 'error',
      });
    }
  };

  // Cerrar Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Manejar cambio de tipo (actualiza color e icono automáticamente)
  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      color: DEFAULT_COLORS[type],
      icon: DEFAULT_ICONS[type],
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Espacios
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Organiza tus documentos en espacios colaborativos por categoría
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none',
            px: 3,
          }}
        >
          Nuevo Espacio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={fetchWorkspaces}>
            Reintentar
          </Button>
        }>
          {error}
        </Alert>
      )}

      {workspaces.length === 0 && !error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, p: 4 }}>
          <Description sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No hay espacios disponibles
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
            Crea tu primer espacio para organizar la documentación.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
          >
            Crear Espacio
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {workspaces.map((workspace) => {
            const Icon = ICON_MAP[workspace.icon] || ICON_MAP[DEFAULT_ICONS[workspace.type]] || Code;

            return (
              <Grid item xs={12} sm={6} md={4} key={workspace.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                  }}
                  onClick={() => handleViewDocuments(workspace)}
                >
                  <Box
                    sx={{
                      height: 8,
                      background: `linear-gradient(135deg, ${workspace.color || '#667eea'} 0%, ${workspace.color || '#667eea'}dd 100%)`,
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: workspace.color || '#667eea',
                            width: 48,
                            height: 48,
                          }}
                        >
                          <Icon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {workspace.name}
                          </Typography>
                          <Chip
                            label={workspace.type_display}
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 18,
                              mt: 0.5,
                              bgcolor: workspace.color || '#667eea',
                              color: 'white',
                            }}
                          />
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, workspace)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2, minHeight: 40 }}>
                      {workspace.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        size="small"
                        icon={<Description sx={{ fontSize: 16 }} />}
                        label={`${workspace.document_count || 0} documento${workspace.document_count !== 1 ? 's' : ''}`}
                        sx={{ bgcolor: '#f5f5f5' }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Compartido con toda la organización
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      sx={{ textTransform: 'none' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDocuments(workspace);
                      }}
                    >
                      Ver Documentos ({workspace.document_count || 0})
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Menú de opciones (3 puntos) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleOpenEditDialog(selectedWorkspace)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleViewDocuments(selectedWorkspace)}>
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver Documentos</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <People fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gestionar Miembros</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Configuración</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleOpenDeleteDialog(selectedWorkspace)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* Diálogo para crear/editar workspace */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ fontWeight: 700, fontSize: '1.5rem', mb: 0.5 }}>
            {editingWorkspace ? 'Editar Espacio' : 'Crear Nuevo Espacio'}
          </Box>
          <Typography variant="body2" color="textSecondary">
            Personaliza tu espacio con iconos y colores
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Vista Previa */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                background: `linear-gradient(135deg, ${formData.color}15 0%, ${formData.color}05 100%)`,
                borderRadius: 2,
                border: `2px solid ${formData.color}40`,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: formData.color,
                  width: 64,
                  height: 64,
                  boxShadow: `0 4px 12px ${formData.color}40`,
                }}
              >
                {ICON_MAP[formData.icon] &&
                  (() => {
                    const PreviewIcon = ICON_MAP[formData.icon];
                    return <PreviewIcon sx={{ fontSize: 32 }} />;
                  })()
                }
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formData.name || 'Nombre del Espacio'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formData.description || 'Descripción del espacio'}
                </Typography>
                <Chip
                  label={WORKSPACE_TYPES.find(t => t.value === formData.type)?.label || 'Tipo'}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: formData.color,
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>

            {/* Información Básica */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre del Espacio"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                placeholder="Ej: Arquitectura del Sistema"
              />

              <TextField
                select
                label="Tipo de Espacio"
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                fullWidth
                required
              >
                {WORKSPACE_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                fullWidth
                placeholder="Describe el propósito y contenido de este espacio..."
              />
            </Box>

            {/* Selector de Iconos */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Selecciona un Icono
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                  gap: 1,
                  maxHeight: 280,
                  overflowY: 'auto',
                  p: 1,
                  bgcolor: '#fafafa',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                {AVAILABLE_ICONS.map((iconData) => {
                  const IconComponent = iconData.component;
                  const isSelected = formData.icon === iconData.name;

                  return (
                    <Tooltip key={iconData.name} title={iconData.name} arrow>
                      <IconButton
                        onClick={() => setFormData({ ...formData, icon: iconData.name })}
                        sx={{
                          width: 56,
                          height: 56,
                          border: isSelected ? `3px solid ${formData.color}` : '2px solid transparent',
                          bgcolor: isSelected ? `${formData.color}15` : 'white',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: `${formData.color}25`,
                            transform: 'scale(1.1)',
                            border: `2px solid ${formData.color}`,
                          },
                        }}
                      >
                        <IconComponent
                          sx={{
                            fontSize: 28,
                            color: isSelected ? formData.color : '#666',
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>

            {/* Selector de Colores */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Selecciona un Color
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Paleta de colores predefinidos */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: 1,
                  }}
                >
                  {COLOR_PALETTE.map((colorData) => {
                    const isSelected = formData.color === colorData.value;

                    return (
                      <Tooltip key={colorData.value} title={colorData.name} arrow>
                        <Box
                          onClick={() => setFormData({ ...formData, color: colorData.value })}
                          sx={{
                            height: 50,
                            bgcolor: colorData.value,
                            borderRadius: 1,
                            cursor: 'pointer',
                            border: isSelected ? '4px solid #333' : '2px solid transparent',
                            transition: 'all 0.2s',
                            position: 'relative',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: `0 4px 12px ${colorData.value}60`,
                            },
                          }}
                        >
                          {isSelected && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                bgcolor: 'rgba(0,0,0,0.3)',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CheckCircle sx={{ fontSize: 20 }} />
                            </Box>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>

                {/* Color personalizado */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                    Color personalizado:
                  </Typography>
                  <TextField
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    sx={{
                      width: 80,
                      '& input': {
                        height: 40,
                        cursor: 'pointer',
                      }
                    }}
                  />
                  <TextField
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#000000"
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} size="large">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveWorkspace}
            variant="contained"
            size="large"
            disabled={!formData.name.trim()}
            sx={{
              background: `linear-gradient(135deg, ${formData.color} 0%, ${formData.color}dd 100%)`,
              px: 3,
              '&:hover': {
                background: `linear-gradient(135deg, ${formData.color}dd 0%, ${formData.color}bb 100%)`,
              },
            }}
          >
            {editingWorkspace ? 'Guardar Cambios' : 'Crear Espacio'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el espacio <strong>"{workspaceToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer. Todos los documentos en este espacio quedarán sin espacio asignado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteWorkspace} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Spaces;
