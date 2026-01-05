import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDocuments, createDocument } from '../../store/slices/documentsSlice';
import projectService from '../../services/projectService';
import standardsService from '../../services/standardsService';
import workspaceService from '../../services/workspaceService';
import documentService from '../../services/documentService';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, Add, Folder, Description, Star, StarBorder } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { can } from '../../utils/permissions';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Documents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaceId } = useParams(); // Obtener workspace ID de la URL
  const { documents: allDocuments, isLoading: isLoadingRedux } = useSelector((s) => s.documents);
  const { user } = useSelector((s) => s.auth);
  const role = user?.role || 'DEV';
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const titleVariant = isXs ? 'h5' : 'h4';
  const btnSize = isXs ? 'small' : 'medium';
  const chipSize = isXs ? 'small' : 'medium';

  // Estados
  const [workspace, setWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [newDoc, setNewDoc] = useState({
    project: '',
    document_type: '',
    title: '',
    content: '',
    status: 'EN_REVISION',
    version: '1.0',
    created_by: user?.id || null,
  });
  const canCreate = can(role, 'documents.document.create');

  const STATUS = [
    { value: 'EN_REVISION', label: 'En revisión' },
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Si hay workspaceId, cargar workspace y sus documentos
        if (workspaceId) {
          const [ws, docs, p, t] = await Promise.all([
            workspaceService.getById(workspaceId),
            documentService.getAll({ workspace: workspaceId }),
            projectService.getAll(),
            standardsService.getStandards(),
          ]);
          setWorkspace(ws);
          setDocuments(docs.results || docs || []);
          setProjects(p.results || p);
          setDocTypes(t.results || t);
        } else {
          // Si no hay workspaceId, cargar todos los documentos
          dispatch(fetchDocuments());
          const [p, t] = await Promise.all([
            projectService.getAll(),
            standardsService.getStandards(),
          ]);
          setProjects(p.results || p);
          setDocTypes(t.results || t);
          setDocuments(allDocuments);
        }
      } catch (e) {
        console.error('Error al cargar datos:', e);
        toast.error('No se pudieron cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, workspaceId]);

  const onCreate = async () => {
    // Validación más flexible cuando estamos en un workspace
    const required = workspaceId ? ['title'] : ['project', 'document_type', 'title', 'content'];
    if (required.some((k) => !newDoc[k])) {
      const mensaje = workspaceId ? 'Completa el título' : 'Completa proyecto, tipo, título y contenido';
      toast.info(mensaje);
      return;
    }
    try {
      // Si estamos en un workspace, asociar el documento al workspace
      const docData = { ...newDoc };
      if (workspaceId) {
        docData.workspace = parseInt(workspaceId);
      }

      const created = await dispatch(createDocument(docData)).unwrap();
      toast.success('Documento creado');
      setNewDoc({
        project: '',
        document_type: '',
        title: '',
        content: '',
        status: 'EN_REVISION',
        version: '1.0',
        created_by: user?.id || null,
      });

      // Recargar documentos del workspace
      if (workspaceId) {
        const docs = await documentService.getAll({ workspace: workspaceId });
        setDocuments(docs.results || docs || []);
      }

      navigate(`/documents/${created.id}`);
    } catch (e) {
      console.error('Error al crear documento:', e);
      toast.error('No se pudo crear el documento');
    }
  };

  const handleToggleFavorite = async (e, docId, currentStatus) => {
    e.stopPropagation(); // Evitar que se navegue al documento
    try {
      const newFavoriteStatus = !currentStatus;
      await documentService.update(docId, { is_favorite: newFavoriteStatus });

      // Actualizar el documento en el estado local
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === docId ? { ...doc, is_favorite: newFavoriteStatus } : doc
        )
      );
    } catch (error) {
      console.error('Error actualizando favorito:', error);
      toast.error('No se pudo actualizar el favorito');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con breadcrumbs si estamos en un workspace */}
      {workspaceId && workspace && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate('/spaces')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Breadcrumbs>
              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigate('/spaces')}
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Folder sx={{ mr: 0.5, fontSize: 20 }} />
                Espacios
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                {workspace.name}
              </Typography>
            </Breadcrumbs>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant={titleVariant} sx={{ fontWeight: 700 }}>
                {workspace.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {workspace.description || 'Sin descripción'}
              </Typography>
              <Chip
                label={`${documents.length} documento${documents.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(`/documents/new?workspace=${workspaceId}`)}
              sx={{ textTransform: 'none' }}
            >
              Nuevo Documento
            </Button>
          </Box>
        </Box>
      )}

      {!workspaceId && (
        <Typography variant={titleVariant} gutterBottom>Gestión de Documentos</Typography>
      )}

      {/* Formulario de creación solo si NO estamos en un workspace */}
      {!workspaceId && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} md={4}>
          <InputLabel id="project-label">Proyecto</InputLabel>
          <Select
            labelId="project-label"
            fullWidth
            value={newDoc.project}
            onChange={(e) => setNewDoc((s) => ({ ...s, project: e.target.value }))}
            disabled={!canCreate}
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.code} · {p.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} md={4}>
          <InputLabel id="doctype-label">Tipo de documento</InputLabel>
          <Select
            labelId="doctype-label"
            fullWidth
            value={newDoc.document_type}
            onChange={(e) => setNewDoc((s) => ({ ...s, document_type: e.target.value }))}
            disabled={!canCreate}
          >
            {docTypes.map((dt) => (
              <MenuItem key={dt.id} value={dt.id}>
                {dt.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Estado"
            fullWidth
            value={newDoc.status}
            onChange={(e) => setNewDoc((s) => ({ ...s, status: e.target.value }))}
            disabled={!canCreate}
          >
            {STATUS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Título"
            fullWidth
            value={newDoc.title}
            onChange={(e) => setNewDoc((s) => ({ ...s, title: e.target.value }))}
            disabled={!canCreate}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Versión"
            fullWidth
            value={newDoc.version}
            onChange={(e) => setNewDoc((s) => ({ ...s, version: e.target.value }))}
            disabled={!canCreate}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Contenido"
            fullWidth
            multiline
            minRows={3}
            value={newDoc.content}
            onChange={(e) => setNewDoc((s) => ({ ...s, content: e.target.value }))}
            disabled={!canCreate}
          />
        </Grid>
        {can(role, 'documents.document.create') && (
          <Grid item xs={12}>
            <Button size={btnSize} variant="contained" onClick={onCreate} disabled={isLoading}>
              Crear Documento
            </Button>
          </Grid>
        )}
      </Grid>
      )}

      {/* Lista de documentos */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {documents.map((doc) => (
          <Grid item xs={12} md={6} lg={4} key={doc.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              }}
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, pr: 1 }}>
                    {doc.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleToggleFavorite(e, doc.id, doc.is_favorite)}
                      sx={{
                        color: doc.is_favorite ? '#ffa726' : '#bdbdbd',
                        '&:hover': {
                          color: doc.is_favorite ? '#ff9800' : '#757575',
                        },
                      }}
                    >
                      {doc.is_favorite ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                    </IconButton>
                    <Chip
                      label={`v${doc.version}`}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        bgcolor: 'rgba(0, 0, 0, 0.06)',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Box>

                {doc.document_type_name && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {doc.document_type_name}
                    </Typography>
                  </Box>
                )}

                {doc.project_code && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Folder sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {doc.project_code}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Modificado: {new Date(doc.updated_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Typography>
                {doc.last_modified_by_name && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    Por: {doc.last_modified_by_name}
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!isLoading && documents.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">No hay documentos</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Documents;
