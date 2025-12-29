import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDocuments, createDocument } from '../../store/slices/documentsSlice';
import projectService from '../../services/projectService';
import standardsService from '../../services/standardsService';
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
} from '@mui/material';
import { toast } from 'react-toastify';
import { can } from '../../utils/permissions';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Documents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { documents, isLoading } = useSelector((s) => s.documents);
  const { user } = useSelector((s) => s.auth);
  const role = user?.role || 'DEV';
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const titleVariant = isXs ? 'h5' : 'h4';
  const btnSize = isXs ? 'small' : 'medium';
  const chipSize = isXs ? 'small' : 'medium';
  const [projects, setProjects] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [newDoc, setNewDoc] = useState({
    project: '',
    document_type: '',
    title: '',
    content: '',
    status: 'DRAFT',
    version: '1.0',
    created_by: user?.id || null,
  });
  const canCreate = can(role, 'documents.document.create');

  const STATUS = [
    'DRAFT',
    'AI_GENERATED',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
  ];

  useEffect(() => {
    dispatch(fetchDocuments());
    (async () => {
      try {
        const [p, t] = await Promise.all([
          projectService.getAll(),
          standardsService.getStandards(),
        ]);
        setProjects(p.results || p);
        setDocTypes(t.results || t);
      } catch (e) {
        toast.error('No se pudieron cargar proyectos/estándares');
      }
    })();
  }, [dispatch]);

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'default',
      AI_GENERATED: 'info',
      IN_REVIEW: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  const onCreate = async () => {
    const required = ['project', 'document_type', 'title', 'content'];
    if (required.some((k) => !newDoc[k])) {
      toast.info('Completa proyecto, tipo, título y contenido');
      return;
    }
    try {
      const created = await dispatch(createDocument(newDoc)).unwrap();
      toast.success('Documento creado');
      setNewDoc({
        project: '',
        document_type: '',
        title: '',
        content: '',
        status: 'DRAFT',
        version: '1.0',
        created_by: user?.id || null,
      });
      navigate(`/documents/${created.id}`);
    } catch (e) {
      toast.error('No se pudo crear el documento');
    }
  };

  return (
    <Box>
      <Typography variant={titleVariant} gutterBottom>Gestión de Documentos</Typography>

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
              <MenuItem key={s} value={s}>
                {s}
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

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {documents.map((doc) => (
          <Grid item xs={12} md={6} key={doc.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{doc.title}</Typography>
                <Typography color="text.secondary" gutterBottom>
                  {doc.project_code} · {doc.document_type_name} · v{doc.version}
                </Typography>
                <Chip label={doc.status} color={getStatusColor(doc.status)} size={chipSize} />
                <Box sx={{ mt: 2 }}>
                  <Button size={btnSize} onClick={() => navigate(`/documents/${doc.id}`)}>
                    Editar
                  </Button>
                </Box>
              </CardContent>
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
