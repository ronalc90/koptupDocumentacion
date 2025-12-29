import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import checklistService from '../../services/checklistService';
import projectService from '../../services/projectService';
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

const Checklist = () => {
  const [tab, setTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [checklist, setChecklist] = useState(null);
  const [items, setItems] = useState([]);
  const [issues, setIssues] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const { user } = useSelector((s) => s.auth);
  const role = user?.role || 'DEV';
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const titleVariant = isXs ? 'h5' : 'h4';
  const btnSize = isXs ? 'small' : 'medium';
  const chipSize = isXs ? 'small' : 'medium';

  const STATUS_COLORS = {
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    BLOCKED: 'error',
    CERTIFIED: 'success',
  };
  const ITEM_STATUS_COLORS = {
    PENDING: 'default',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    FAILED: 'error',
    NA: 'default',
  };
  const ISSUE_SEVERITY_COLORS = {
    MINOR: 'default',
    MAJOR: 'warning',
    CRITICAL: 'error',
    BLOCKER: 'error',
  };

  useEffect(() => {
    (async () => {
      try {
        const p = await projectService.getAll();
        const list = p.results || p;
        setProjects(list);
        if (list.length > 0) {
          setSelectedProject(list[0].id);
        }
      } catch {
        toast.error('No se pudieron cargar los proyectos');
      }
    })();
  }, []);

  const loadChecklistData = async (projectId) => {
    if (!projectId) return;
    try {
      const cl = await checklistService.getChecklists({ project: projectId });
      const data = cl.results || cl;
      const c = data[0] || null;
      setChecklist(c);
      if (c) {
        const [its, iss, certs] = await Promise.all([
          checklistService.getItems({ checklist: c.id }),
          checklistService.getBlockingIssues({ checklist: c.id }),
          checklistService.getCertificates({ checklist: c.id }),
        ]);
        setItems(its.results || its);
        setIssues(iss.results || iss);
        setCertificates(certs.results || certs);
      } else {
        setItems([]);
        setIssues([]);
        setCertificates([]);
      }
    } catch {
      toast.error('No se pudo cargar el checklist');
    }
  };

  useEffect(() => {
    loadChecklistData(selectedProject);
  }, [selectedProject]);

  const [newChecklist, setNewChecklist] = useState({
    project: '',
    status: 'IN_PROGRESS',
    notes: '',
  });

  useEffect(() => {
    setNewChecklist((s) => ({ ...s, project: selectedProject || '' }));
  }, [selectedProject]);

  const createChecklist = async () => {
    if (!newChecklist.project) return;
    try {
      const created = await checklistService.createChecklist(newChecklist);
      setChecklist(created);
      toast.success('Checklist creado');
      await loadChecklistData(selectedProject);
    } catch {
      toast.error('No se pudo crear el checklist');
    }
  };

  const [newItem, setNewItem] = useState({
    checklist: '',
    item_type: 'CUSTOM',
    title: '',
    description: '',
    is_mandatory: true,
    status: 'PENDING',
    order: 0,
  });

  useEffect(() => {
    setNewItem((s) => ({ ...s, checklist: checklist?.id || '' }));
  }, [checklist]);

  const createItem = async () => {
    if (!newItem.checklist || !newItem.title) return;
    try {
      const created = await checklistService.createItem(newItem);
      setItems((prev) => [created, ...prev]);
      setNewItem((s) => ({ ...s, title: '', description: '' }));
      toast.success('Ítem creado');
    } catch {
      toast.error('No se pudo crear el ítem');
    }
  };

  const [newIssue, setNewIssue] = useState({
    checklist: '',
    title: '',
    description: '',
    severity: 'MAJOR',
    status: 'OPEN',
    created_by: user?.id || null,
  });

  useEffect(() => {
    setNewIssue((s) => ({ ...s, checklist: checklist?.id || '' }));
  }, [checklist]);

  const createIssue = async () => {
    if (!newIssue.checklist || !newIssue.title) return;
    try {
      const created = await checklistService.createBlockingIssue(newIssue);
      setIssues((prev) => [created, ...prev]);
      setNewIssue((s) => ({ ...s, title: '', description: '' }));
      toast.success('Incidencia creada');
    } catch {
      toast.error('No se pudo crear la incidencia');
    }
  };

  const [newCert, setNewCert] = useState({
    checklist: '',
    certificate_number: '',
    project_summary: '',
    deliverables: [],
    certifications: {},
    signatures: {},
    issued_by: user?.id || null,
    is_final: true,
  });

  useEffect(() => {
    setNewCert((s) => ({ ...s, checklist: checklist?.id || '' }));
  }, [checklist]);

  const createCertificate = async () => {
    if (!newCert.checklist || !newCert.certificate_number) return;
    try {
      const created = await checklistService.createCertificate(newCert);
      setCertificates((prev) => [created, ...prev]);
      setNewCert((s) => ({ ...s, certificate_number: '', project_summary: '' }));
      toast.success('Certificado creado');
    } catch {
      toast.error('No se pudo crear el certificado');
    }
  };

  return (
    <Box>
      <Typography variant={titleVariant} gutterBottom>Checklist de Entrega</Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} md={6}>
          <InputLabel id="project-select-label">Proyecto</InputLabel>
          <Select
            labelId="project-select-label"
            fullWidth
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.code} · {p.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} md={6}>
          {checklist ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>Estado:</Typography>
              <Chip label={checklist.status} color={STATUS_COLORS[checklist.status] || 'default'} size={chipSize} />
              <Typography>
                Avance: {Number(checklist.completion_percentage || 0)}%
              </Typography>
            </Box>
          ) : (
            can(role, 'checklist.checklist.create') && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Notas"
                  fullWidth
                  value={newChecklist.notes}
                  onChange={(e) => setNewChecklist((s) => ({ ...s, notes: e.target.value }))}
                />
                <Button size={btnSize} variant="contained" onClick={createChecklist}>
                  Crear Checklist
                </Button>
              </Box>
            )
          )}
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Ítems" />
        <Tab label="Incidencias" />
        <Tab label="Certificado" />
      </Tabs>

      {tab === 0 && (
        <Box>
          {can(role, 'checklist.item.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Título"
                fullWidth
                value={newItem.title}
                onChange={(e) => setNewItem((s) => ({ ...s, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Descripción"
                fullWidth
                value={newItem.description}
                onChange={(e) => setNewItem((s) => ({ ...s, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                label="Tipo"
                fullWidth
                value={newItem.item_type}
                onChange={(e) => setNewItem((s) => ({ ...s, item_type: e.target.value }))}
              >
                {['STORIES_CLOSED', 'DOCUMENTATION_APPROVED', 'QA_VALIDATED', 'DELIVERY_DOCUMENT', 'CUSTOM'].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
                <Button size={btnSize} variant="contained" onClick={createItem} disabled={!checklist}>
                  Agregar Ítem
                </Button>
            </Grid>
          </Grid>
          )}

          <Grid container spacing={3}>
            {items.map((it) => (
              <Grid item xs={12} md={6} key={it.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{it.title}</Typography>
                    <Typography color="text.secondary">
                      {it.item_type}
                    </Typography>
                    <Chip label={it.status} color={ITEM_STATUS_COLORS[it.status] || 'default'} sx={{ mt: 1 }} />
                    <Typography sx={{ mt: 1 }}>{it.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {items.length === 0 && (
              <Box sx={{ ml: 2 }}>
                <Typography color="text.secondary">Sin ítems</Typography>
              </Box>
            )}
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {can(role, 'checklist.issue.create') && (
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
                {['MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER'].map((s) => (
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
            <Grid item xs={12}>
                <Button size={btnSize} variant="contained" onClick={createIssue} disabled={!checklist}>
                  Crear incidencia
                </Button>
            </Grid>
          </Grid>
          )}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            {issues.map((i) => (
              <Grid item xs={12} md={6} key={i.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{i.title}</Typography>
                    <Chip label={i.severity} color={ISSUE_SEVERITY_COLORS[i.severity] || 'default'} />
                    <Typography sx={{ mt: 1 }}>{i.description}</Typography>
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

      {tab === 2 && (
        <Box>
          {can(role, 'checklist.certificate.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Número de certificado"
                fullWidth
                value={newCert.certificate_number}
                onChange={(e) => setNewCert((s) => ({ ...s, certificate_number: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                label="Resumen del proyecto"
                fullWidth
                value={newCert.project_summary}
                onChange={(e) => setNewCert((s) => ({ ...s, project_summary: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
                <Button size={btnSize} variant="contained" onClick={createCertificate} disabled={!checklist}>
                  Crear certificado
                </Button>
            </Grid>
          </Grid>
          )}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            {certificates.map((c) => (
              <Grid item xs={12} md={6} key={c.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{c.certificate_number}</Typography>
                    <Typography color="text.secondary">{c.project_summary}</Typography>
                    {c.file && (
                      <Box sx={{ mt: 1 }}>
                        <a href={c.file} target="_blank" rel="noopener noreferrer">
                          Descargar certificado
                        </a>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {certificates.length === 0 && (
              <Box sx={{ ml: 2 }}>
                <Typography color="text.secondary">Sin certificados</Typography>
              </Box>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Checklist;
