import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
} from '@mui/material';
import {
  Description,
  ExpandMore,
  ChevronRight,
  Add,
  MoreHoriz,
  Edit,
  Delete,
  Refresh,
  Code,
  AccountTree,
  MenuBook,
  Lightbulb,
  Folder,
  Work,
  Assignment,
  Build,
  BugReport,
  Dashboard as DashboardIcon,
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
  Settings,
} from '@mui/icons-material';
import documentService from '../../services/documentService';
import workspaceService from '../../services/workspaceService';

// Mapa de todos los iconos disponibles
const ICON_MAP = {
  Code,
  Terminal,
  DataObject,
  Source,
  Functions,
  Api,
  IntegrationInstructions,
  Storage,
  Memory,
  CloudQueue,
  AccountTree,
  Hub,
  DeviceHub,
  Layers,
  Extension,
  Widgets,
  Build,
  Settings,
  SettingsApplications,
  Speed,
  MenuBook,
  Description,
  Assignment,
  Grading,
  School,
  Quiz,
  Policy,
  CheckCircle,
  Lightbulb,
  Psychology,
  Science,
  Language,
  Dashboard: DashboardIcon,
  Folder,
  Work,
  BugReport,
  Security,
  VerifiedUser,
  Fingerprint,
  Dns,
  Palette,
};

// Iconos predeterminados por tipo
const DEFAULT_ICONS = {
  TECHNICAL: 'Code',
  PROCESSES: 'AccountTree',
  GUIDES: 'MenuBook',
  KNOWLEDGE_BASE: 'Lightbulb',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Cargar workspaces y documentos desde la API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar workspaces
      const workspacesData = await workspaceService.getAll({ is_active: true });
      setWorkspaces(workspacesData.results || workspacesData || []);

      // Expandir todos los workspaces por defecto
      const expandedState = {};
      (workspacesData.results || workspacesData || []).forEach(ws => {
        expandedState[`workspace-${ws.id}`] = true;
      });
      setExpanded(expandedState);

      // Cargar todos los documentos
      const docsData = await documentService.getAll();
      setDocuments(docsData.results || docsData || []);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los workspaces y documentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDocumentClick = (doc) => {
    navigate(`/documents/${doc.id}`);
  };

  const handleContextMenu = (event, doc) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY });
    setSelectedDoc(doc);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleEdit = () => {
    if (selectedDoc) {
      navigate(`/documents/${selectedDoc.id}`);
    }
    handleCloseContextMenu();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleCloseContextMenu();
  };

  const handleDeleteConfirm = async () => {
    if (selectedDoc && selectedDoc.id) {
      try {
        await documentService.delete(selectedDoc.id);
        await fetchData(); // Recargar datos
        setDeleteDialogOpen(false);
        setSelectedDoc(null);
      } catch (error) {
        console.error('Error al eliminar documento:', error);
        alert('No se pudo eliminar el documento');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDoc(null);
  };

  // Renderizar un documento
  const renderDocumentItem = (doc, level = 1) => {
    const paddingLeft = 2 + level * 3;

    return (
      <ListItem key={doc.id} disablePadding>
        <ListItemButton
          onClick={() => handleDocumentClick(doc)}
          sx={{
            pl: paddingLeft,
            '&:hover': {
              bgcolor: '#f5f5f5',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Description sx={{ color: '#667eea', fontSize: 20 }} />
          </ListItemIcon>

          <ListItemText
            primary={doc.title}
            secondary={doc.workspace_name}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 400,
            }}
            secondaryTypographyProps={{
              fontSize: 12,
            }}
          />

          {doc.status && (
            <Chip
              label={doc.status}
              size="small"
              sx={{
                fontSize: 10,
                height: 20,
                mr: 1,
                bgcolor: doc.status === 'APPROVED' ? '#e8f5e9' : '#fff3e0',
                color: doc.status === 'APPROVED' ? '#2e7d32' : '#e65100',
              }}
            />
          )}

          <IconButton
            size="small"
            onClick={(e) => handleContextMenu(e, doc)}
            sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>
        </ListItemButton>
      </ListItem>
    );
  };

  // Renderizar un workspace con sus documentos
  const renderWorkspace = (workspace) => {
    const workspaceId = `workspace-${workspace.id}`;
    const isExpanded = expanded[workspaceId];
    const Icon = ICON_MAP[workspace.icon] || ICON_MAP[DEFAULT_ICONS[workspace.type]] || Code;

    // Filtrar documentos de este workspace
    const workspaceDocs = documents.filter(doc => doc.workspace === workspace.id);

    return (
      <Box key={workspace.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleToggle(workspaceId)}
            sx={{
              pl: 2,
              bgcolor: '#fafafa',
              borderBottom: '1px solid #e0e0e0',
              '&:hover': {
                bgcolor: '#f0f0f0',
              },
            }}
          >
            <IconButton
              size="small"
              sx={{ mr: 0.5 }}
            >
              {isExpanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>

            <ListItemIcon sx={{ minWidth: 36 }}>
              <Icon sx={{ color: workspace.color || '#667eea' }} />
            </ListItemIcon>

            <ListItemText
              primary={workspace.name}
              secondary={`${workspaceDocs.length} documento${workspaceDocs.length !== 1 ? 's' : ''}`}
              primaryTypographyProps={{
                fontWeight: 600,
                fontSize: 15,
              }}
              secondaryTypographyProps={{
                fontSize: 12,
              }}
            />

            <Chip
              label={workspace.type_display}
              size="small"
              sx={{
                fontSize: 10,
                height: 22,
                bgcolor: workspace.color || '#667eea',
                color: 'white',
              }}
            />
          </ListItemButton>
        </ListItem>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {workspaceDocs.length > 0 ? (
              workspaceDocs.map((doc) => renderDocumentItem(doc))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No hay documentos en este workspace"
                  primaryTypographyProps={{
                    fontSize: 14,
                    color: 'textSecondary',
                    fontStyle: 'italic',
                    pl: 6,
                  }}
                />
              </ListItem>
            )}
          </List>
        </Collapse>
      </Box>
    );
  };

  // Documentos sin workspace
  const documentsWithoutWorkspace = documents.filter(doc => !doc.workspace);

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Documentación
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Organiza y gestiona tu conocimiento por espacios
          </Typography>
        </Box>

        <Tooltip title="Crear nuevo documento">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/documents/new')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
            }}
          >
            Nuevo
          </Button>
        </Tooltip>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={
          <Button color="inherit" size="small" onClick={fetchData}>
            Reintentar
          </Button>
        }>
          {error}
        </Alert>
      )}

      {/* Workspaces y Documentos */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : workspaces.length === 0 && documents.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, p: 4 }}>
            <Description sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No hay workspaces ni documentos
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
              Contacta al administrador para crear workspaces o comienza creando tu primer documento.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/documents/new')}
            >
              Crear Documento
            </Button>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {/* Workspaces con documentos */}
            {workspaces.map((workspace) => renderWorkspace(workspace))}

            {/* Documentos sin workspace */}
            {documentsWithoutWorkspace.length > 0 && (
              <Box>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleToggle('no-workspace')}
                    sx={{
                      pl: 2,
                      bgcolor: '#fafafa',
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <IconButton size="small" sx={{ mr: 0.5 }}>
                      {expanded['no-workspace'] ? <ExpandMore /> : <ChevronRight />}
                    </IconButton>

                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Description sx={{ color: '#9e9e9e' }} />
                    </ListItemIcon>

                    <ListItemText
                      primary="Sin Workspace"
                      secondary={`${documentsWithoutWorkspace.length} documento${documentsWithoutWorkspace.length !== 1 ? 's' : ''}`}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: 15,
                      }}
                    />
                  </ListItemButton>
                </ListItem>

                <Collapse in={expanded['no-workspace']} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {documentsWithoutWorkspace.map((doc) => renderDocumentItem(doc))}
                  </List>
                </Collapse>
              </Box>
            )}
          </List>
        )}
      </Box>

      {/* Quick Actions */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: '#f5f7fa',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Acciones Rápidas
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            startIcon={<Add />}
            onClick={() => navigate('/ai-generate')}
            sx={{ textTransform: 'none' }}
          >
            Generar con IA
          </Button>
          <Button
            size="small"
            startIcon={<Description />}
            onClick={() => navigate('/recent')}
            sx={{ textTransform: 'none' }}
          >
            Recientes
          </Button>
          <Button
            size="small"
            onClick={() => navigate('/search')}
            sx={{ textTransform: 'none' }}
          >
            Buscar
          </Button>
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={fetchData}
            sx={{ textTransform: 'none' }}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el documento "{selectedDoc?.title}"?
            El documento será enviado a la papelera.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
