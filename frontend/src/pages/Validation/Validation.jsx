import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import validationService from '../../services/validationService';
import documentService from '../../services/documentService';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Divider,
} from '@mui/material';
import { toast } from 'react-toastify';
import { can } from '../../utils/permissions';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Validation = () => {
  const [tab, setTab] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [results, setResults] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [issues, setIssues] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const { user } = useSelector((s) => s.auth);
  const role = user?.role || 'DEV';
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const titleVariant = isXs ? 'h5' : 'h4';
  const btnSize = isXs ? 'small' : 'medium';
  const chipSize = isXs ? 'small' : 'medium';

  useEffect(() => {
    (async () => {
      try {
        const docs = await documentService.getAll();
        const list = docs.results || docs;
        setDocuments(list);
        if (list.length > 0) {
          setSelectedDoc(list[0].id);
        }
      } catch {
        toast.error('No se pudieron cargar los documentos');
      }
    })();
  }, []);

  const loadData = async (docId) => {
    if (!docId) return;
    try {
      const [r, q, i, c] = await Promise.all([
        validationService.getResults(docId),
        validationService.getQAReviews(docId),
        validationService.getIssues(docId),
        validationService.getCheckpoints(docId),
      ]);
      setResults(r.results || r);
      setReviews(q.results || q);
      setIssues(i.results || i);
      setCheckpoints(c.results || c);
    } catch {
      toast.error('No se pudo cargar la validación');
    }
  };

  useEffect(() => {
    loadData(selectedDoc);
  }, [selectedDoc]);

  const STATUS_COLORS = {
    PASSED: 'success',
    FAILED: 'error',
    WARNING: 'warning',
    SKIPPED: 'default',
  };
  const ISSUE_SEVERITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const REVIEW_STATUS = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'];

  const [newReview, setNewReview] = useState({
    document: '',
    reviewer: user?.id || null,
    status: 'PENDING',
    comments: '',
    checklist_data: {},
    is_blocking: false,
  });
  const [newIssue, setNewIssue] = useState({
    document: '',
    title: '',
    description: '',
    severity: 'MEDIUM',
    status: 'OPEN',
    section_reference: '',
    assigned_to: null,
    created_by: user?.id || null,
  });
  const [newCheckpoint, setNewCheckpoint] = useState({
    document: '',
    checkpoint_name: '',
    is_passed: false,
    validated_by: user?.id || null,
    notes: '',
  });

  useEffect(() => {
    setNewReview((s) => ({ ...s, document: selectedDoc || '' }));
    setNewIssue((s) => ({ ...s, document: selectedDoc || '' }));
    setNewCheckpoint((s) => ({ ...s, document: selectedDoc || '' }));
  }, [selectedDoc]);

  const createReview = async () => {
    if (!newReview.document) return;
    try {
      const created = await validationService.createQAReview(newReview);
      setReviews((prev) => [created, ...prev]);
      setNewReview((s) => ({ ...s, comments: '', status: 'PENDING' }));
      toast.success('Revisión creada');
    } catch {
      toast.error('No se pudo crear la revisión');
    }
  };
  const createIssue = async () => {
    if (!newIssue.document || !newIssue.title) return;
    try {
      const created = await validationService.createIssue(newIssue);
      setIssues((prev) => [created, ...prev]);
      setNewIssue((s) => ({ ...s, title: '', description: '' }));
      toast.success('Incidencia creada');
    } catch {
      toast.error('No se pudo crear la incidencia');
    }
  };
  const createCheckpoint = async () => {
    if (!newCheckpoint.document || !newCheckpoint.checkpoint_name) return;
    try {
      const created = await validationService.createCheckpoint(newCheckpoint);
      setCheckpoints((prev) => [created, ...prev]);
      setNewCheckpoint((s) => ({ ...s, checkpoint_name: '', notes: '' }));
      toast.success('Checkpoint creado');
    } catch {
      toast.error('No se pudo crear el checkpoint');
    }
  };

  return (
    <Box>
      <Typography variant={titleVariant} gutterBottom>Validación y QA</Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} md={6}>
          <InputLabel id="doc-select-label">Documento</InputLabel>
          <Select
            labelId="doc-select-label"
            fullWidth
            value={selectedDoc || ''}
            onChange={(e) => setSelectedDoc(e.target.value)}
          >
            {documents.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.title} · {d.project_code}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Tab label="Resultados" />
        <Tab label="QA Reviews" />
        <Tab label="Incidencias" />
        <Tab label="Checkpoints" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          {results.map((r) => (
            <Grid item xs={12} md={6} key={r.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{r.validation_rule}</Typography>
                  <Chip label={r.status} color={STATUS_COLORS[r.status] || 'default'} size={chipSize} />
                  <Typography sx={{ mt: 1 }}>{r.message}</Typography>
                  {r.details && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {JSON.stringify(r.details)}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {results.length === 0 && (
            <Box sx={{ ml: 2 }}>
              <Typography color="text.secondary">Sin resultados</Typography>
            </Box>
          )}
        </Grid>
      )}

      {tab === 1 && (
        <Box>
          {can(role, 'validation.qaReview.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Estado"
                fullWidth
                value={newReview.status}
                onChange={(e) => setNewReview((s) => ({ ...s, status: e.target.value }))}
              >
                {REVIEW_STATUS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField
                label="Comentarios"
                fullWidth
                multiline
                minRows={2}
                value={newReview.comments}
                onChange={(e) => setNewReview((s) => ({ ...s, comments: e.target.value }))}
              />
            </Grid>
            {can(role, 'validation.qaReview.create') && (
              <Grid item xs={12}>
                <Button size={btnSize} variant="contained" onClick={createReview}>
                  Crear revisión
                </Button>
              </Grid>
            )}
          </Grid>
          )}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            {reviews.map((q) => (
              <Grid item xs={12} md={6} key={q.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{q.document_title}</Typography>
                    <Chip label={q.status} />
                    <Typography sx={{ mt: 1 }}>{q.comments}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {q.reviewer_name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {reviews.length === 0 && (
              <Box sx={{ ml: 2 }}>
                <Typography color="text.secondary">Sin revisiones</Typography>
              </Box>
            )}
          </Grid>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          {can(role, 'validation.issue.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Título"
                fullWidth
                value={newIssue.title}
                onChange={(e) => setNewIssue((s) => ({ ...s, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Severidad"
                fullWidth
                value={newIssue.severity}
                onChange={(e) => setNewIssue((s) => ({ ...s, severity: e.target.value }))}
              >
                {ISSUE_SEVERITY.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                multiline
                minRows={2}
                value={newIssue.description}
                onChange={(e) => setNewIssue((s) => ({ ...s, description: e.target.value }))}
              />
            </Grid>
            {can(role, 'validation.issue.create') && (
              <Grid item xs={12}>
                <Button size={btnSize} variant="contained" onClick={createIssue}>
                  Crear incidencia
                </Button>
              </Grid>
            )}
          </Grid>
          )}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            {issues.map((i) => (
              <Grid item xs={12} md={6} key={i.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{i.title}</Typography>
                    <Chip label={i.severity} />
                    <Typography sx={{ mt: 1 }}>{i.description}</Typography>
                    {i.section_reference && (
                      <Typography variant="caption" color="text.secondary">
                        Sección: {i.section_reference}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {issues.length === 0 && (
              <Box sx={{ ml: 2 }}>
                <Typography color="text.secondary">Sin incidencias</Typography>
              </Box>
            )}
          </Grid>
        </Box>
      )}

      {tab === 3 && (
        <Box>
          {can(role, 'validation.checkpoint.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre del checkpoint"
                fullWidth
                value={newCheckpoint.checkpoint_name}
                onChange={(e) => setNewCheckpoint((s) => ({ ...s, checkpoint_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Notas"
                fullWidth
                value={newCheckpoint.notes}
                onChange={(e) => setNewCheckpoint((s) => ({ ...s, notes: e.target.value }))}
              />
            </Grid>
            {can(role, 'validation.checkpoint.create') && (
              <Grid item xs={12}>
                <Button size={btnSize} variant="contained" onClick={createCheckpoint}>
                  Crear checkpoint
                </Button>
              </Grid>
            )}
          </Grid>
          )}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            {checkpoints.map((c) => (
              <Grid item xs={12} md={6} key={c.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{c.checkpoint_name}</Typography>
                    <Typography color="text.secondary">
                      {c.is_passed ? 'Aprobado' : 'Pendiente'} · {c.validated_by}
                    </Typography>
                    {c.notes && (
                      <Typography sx={{ mt: 1 }}>{c.notes}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {checkpoints.length === 0 && (
              <Box sx={{ ml: 2 }}>
                <Typography color="text.secondary">Sin checkpoints</Typography>
              </Box>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Validation;
