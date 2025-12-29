import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import auditService from '../../services/auditService';
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

const Audit = () => {
  const [tab, setTab] = useState(0);
  const [orgId, setOrgId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const { user } = useSelector((s) => s.auth);
  const role = user?.role || 'DEV';
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const titleVariant = isXs ? 'h5' : 'h4';
  const btnSize = isXs ? 'small' : 'medium';
  const chipSize = isXs ? 'small' : 'medium';

  useEffect(() => {
    setOrgId(user?.organization || null);
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        if (orgId) {
          const [l, a, ac] = await Promise.all([
            auditService.getLogs({ organization: orgId }),
            auditService.getApprovals({ organization: orgId }),
            auditService.getAccess({}),
          ]);
          setLogs(l.results || l);
          setApprovals(a.results || a);
          setAccessLogs(ac.results || ac);
        }
        const p = await projectService.getAll();
        setProjects(p.results || p);
      } catch {
        toast.error('No se pudo cargar auditoría');
      }
    })();
  }, [orgId]);

  const [newReport, setNewReport] = useState({
    organization: '',
    project: '',
    report_type: 'ISO27001',
    title: '',
    description: '',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    generated_by: user?.id || null,
  });
  const [newPolicy, setNewPolicy] = useState({
    organization: '',
    data_type: '',
    retention_days: 365,
    description: '',
    is_active: true,
  });
  const [newEvent, setNewEvent] = useState({
    organization: '',
    event_type: 'SUSPICIOUS_ACTIVITY',
    severity: 'MEDIUM',
    description: '',
    ip_address: '127.0.0.1',
    user_agent: 'Web',
    details: {},
    is_resolved: false,
  });

  useEffect(() => {
    setNewReport((s) => ({ ...s, organization: orgId || '' }));
    setNewPolicy((s) => ({ ...s, organization: orgId || '' }));
    setNewEvent((s) => ({ ...s, organization: orgId || '' }));
  }, [orgId]);

  const createReport = async () => {
    if (!newReport.organization || !newReport.title || !newReport.project) return;
    try {
      const created = await auditService.createComplianceReport(newReport);
      setReports((prev) => [created, ...prev]);
      setNewReport((s) => ({ ...s, title: '', description: '' }));
      toast.success('Reporte de cumplimiento creado');
    } catch {
      toast.error('No se pudo crear el reporte');
    }
  };
  const createPolicy = async () => {
    if (!newPolicy.organization || !newPolicy.data_type) return;
    try {
      const created = await auditService.createRetentionPolicy(newPolicy);
      setPolicies((prev) => [created, ...prev]);
      setNewPolicy((s) => ({ ...s, data_type: '', description: '' }));
      toast.success('Política de retención creada');
    } catch {
      toast.error('No se pudo crear la política');
    }
  };
  const createEvent = async () => {
    if (!newEvent.organization || !newEvent.description) return;
    try {
      const created = await auditService.createSecurityEvent(newEvent);
      setEvents((prev) => [created, ...prev]);
      setNewEvent((s) => ({ ...s, description: '' }));
      toast.success('Evento de seguridad registrado');
    } catch {
      toast.error('No se pudo crear el evento');
    }
  };

  return (
    <Box>
      <Typography variant={titleVariant} gutterBottom>Auditoría y Cumplimiento</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Tab label="Logs" />
        <Tab label="Aprobaciones" />
        <Tab label="Accesos" />
        <Tab label="Reportes" />
        <Tab label="Retención" />
        <Tab label="Eventos" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          {logs.map((l) => (
            <Grid item xs={12} md={6} key={l.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{l.action_type}</Typography>
                  <Typography color="text.secondary">
                    {l.resource_type} · {l.resource_id}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>{l.description}</Typography>
                  <Chip label={l.status_code || 200} size={chipSize} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
          {logs.length === 0 && <Typography color="text.secondary">Sin logs</Typography>}
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          {approvals.map((a) => (
            <Grid item xs={12} md={6} key={a.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{a.resource_name}</Typography>
                  <Typography color="text.secondary">
                    {a.approval_type} · {a.status}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>{a.comments}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {approvals.length === 0 && <Typography color="text.secondary">Sin aprobaciones</Typography>}
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={3}>
          {accessLogs.map((al) => (
            <Grid item xs={12} md={6} key={al.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{al.resource_name}</Typography>
                  <Typography color="text.secondary">
                    {al.action} · {al.ip_address}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {accessLogs.length === 0 && <Typography color="text.secondary">Sin accesos</Typography>}
        </Grid>
      )}

      {tab === 3 && (
        <Box>
          {can(role, 'audit.complianceReport.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <InputLabel id="report-project-label">Proyecto</InputLabel>
              <Select
                labelId="report-project-label"
                fullWidth
                value={newReport.project}
                onChange={(e) => setNewReport((s) => ({ ...s, project: e.target.value }))}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.code} · {p.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Tipo"
                fullWidth
                value={newReport.report_type}
                onChange={(e) => setNewReport((s) => ({ ...s, report_type: e.target.value }))}
              >
                {['ISO27001', 'SOC2', 'GDPR', 'CUSTOM'].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                label="Título"
                fullWidth
                value={newReport.title}
                onChange={(e) => setNewReport((s) => ({ ...s, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                value={newReport.description}
                onChange={(e) => setNewReport((s) => ({ ...s, description: e.target.value }))}
              />
            </Grid>
            {can(role, 'audit.complianceReport.create') && (
              <Grid item xs={12}>
              <Button size={btnSize} variant="contained" onClick={createReport} disabled={!orgId}>
                Crear reporte
              </Button>
              </Grid>
            )}
          </Grid>
          )}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            {reports.map((r) => (
              <Grid item xs={12} md={6} key={r.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{r.title}</Typography>
                    <Typography color="text.secondary">
                      {r.report_type} · {r.status}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {reports.length === 0 && <Typography color="text.secondary">Sin reportes</Typography>}
          </Grid>
        </Box>
      )}

      {tab === 4 && (
        <Box>
          {can(role, 'audit.retentionPolicy.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Tipo de datos"
                fullWidth
                value={newPolicy.data_type}
                onChange={(e) => setNewPolicy((s) => ({ ...s, data_type: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Días de retención"
                type="number"
                fullWidth
                value={newPolicy.retention_days}
                onChange={(e) => setNewPolicy((s) => ({ ...s, retention_days: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Descripción"
                fullWidth
                value={newPolicy.description}
                onChange={(e) => setNewPolicy((s) => ({ ...s, description: e.target.value }))}
              />
            </Grid>
            {can(role, 'audit.retentionPolicy.create') && (
              <Grid item xs={12}>
              <Button size={btnSize} variant="contained" onClick={createPolicy} disabled={!orgId}>
                Crear política
              </Button>
              </Grid>
            )}
          </Grid>
          )}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            {policies.map((p) => (
              <Grid item xs={12} md={6} key={p.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{p.data_type}</Typography>
                    <Typography color="text.secondary">
                      {p.retention_days} días
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {policies.length === 0 && <Typography color="text.secondary">Sin políticas</Typography>}
          </Grid>
        </Box>
      )}

      {tab === 5 && (
        <Box>
          {can(role, 'audit.securityEvent.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Tipo de evento"
                fullWidth
                value={newEvent.event_type}
                onChange={(e) => setNewEvent((s) => ({ ...s, event_type: e.target.value }))}
              >
                {['FAILED_LOGIN', 'UNAUTHORIZED_ACCESS', 'PERMISSION_DENIED', 'DATA_EXPORT', 'SUSPICIOUS_ACTIVITY'].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Severidad"
                fullWidth
                value={newEvent.severity}
                onChange={(e) => setNewEvent((s) => ({ ...s, severity: e.target.value }))}
              >
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Descripción"
                fullWidth
                value={newEvent.description}
                onChange={(e) => setNewEvent((s) => ({ ...s, description: e.target.value }))}
              />
            </Grid>
            {can(role, 'audit.securityEvent.create') && (
              <Grid item xs={12}>
              <Button size={btnSize} variant="contained" onClick={createEvent} disabled={!orgId}>
                Registrar evento
              </Button>
              </Grid>
            )}
          </Grid>
          )}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            {events.map((ev) => (
              <Grid item xs={12} md={6} key={ev.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{ev.event_type}</Typography>
                    <Chip label={ev.severity} size={chipSize} />
                    <Typography sx={{ mt: 1 }}>{ev.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {events.length === 0 && <Typography color="text.secondary">Sin eventos</Typography>}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Audit;
