import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import agileService from '../../services/agileService';
import projectService from '../../services/projectService';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Chip,
} from '@mui/material';
import { toast } from 'react-toastify';
import { can } from '../../utils/permissions';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Agile = () => {
  const [tab, setTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
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
        const p = await projectService.getAll();
        const list = p.results || p;
        setProjects(list);
        if (list.length > 0) setSelectedProject(list[0].id);
      } catch {
        toast.error('No se pudieron cargar proyectos');
      }
    })();
  }, []);

  const loadAgileData = async (projectId) => {
    if (!projectId) return;
    try {
      const e = await agileService.getEpics({ project: projectId });
      const ep = e.results || e;
      setEpics(ep);
      const st = await agileService.getUserStories({});
      setStories(st.results || st);
      const tk = await agileService.getTasks({});
      setTasks(tk.results || tk);
    } catch {
      toast.error('No se pudo cargar agile');
    }
  };

  useEffect(() => {
    loadAgileData(selectedProject);
  }, [selectedProject]);

  const [newEpic, setNewEpic] = useState({
    project: '',
    title: '',
    description: '',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    owner: user?.id || null,
    created_by: user?.id || null,
  });
  const [newStory, setNewStory] = useState({
    epic: '',
    story_id: '',
    title: '',
    description: '',
    as_a: '',
    i_want: '',
    so_that: '',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    created_by: user?.id || null,
  });
  const [newTask, setNewTask] = useState({
    user_story: '',
    title: '',
    description: '',
    task_type: 'DEVELOPMENT',
    status: 'TODO',
    created_by: user?.id || null,
  });

  useEffect(() => {
    setNewEpic((s) => ({ ...s, project: selectedProject || '' }));
  }, [selectedProject]);

  const createEpic = async () => {
    if (!newEpic.project || !newEpic.title) return;
    try {
      const created = await agileService.createEpic(newEpic);
      setEpics((prev) => [created, ...prev]);
      setNewEpic((s) => ({ ...s, title: '', description: '' }));
      toast.success('Épica creada');
    } catch {
      toast.error('No se pudo crear la épica');
    }
  };
  const createStory = async () => {
    if (!newStory.epic || !newStory.story_id || !newStory.title) return;
    try {
      const created = await agileService.createUserStory(newStory);
      setStories((prev) => [created, ...prev]);
      setNewStory((s) => ({ ...s, title: '', description: '', story_id: '' }));
      toast.success('Historia creada');
    } catch {
      toast.error('No se pudo crear la historia');
    }
  };
  const createTask = async () => {
    if (!newTask.user_story || !newTask.title) return;
    try {
      const created = await agileService.createTask(newTask);
      setTasks((prev) => [created, ...prev]);
      setNewTask((s) => ({ ...s, title: '', description: '' }));
      toast.success('Tarea creada');
    } catch {
      toast.error('No se pudo crear la tarea');
    }
  };

  return (
    <Box>
      <Typography variant={titleVariant} gutterBottom>Gestión Ágil</Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} md={6}>
          <InputLabel id="agile-project-label">Proyecto</InputLabel>
          <Select
            labelId="agile-project-label"
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
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Épicas" />
        <Tab label="Historias" />
        <Tab label="Tareas" />
      </Tabs>

      {tab === 0 && (
        <Box>
          {can(role, 'agile.epic.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Título"
                fullWidth
                value={newEpic.title}
                onChange={(e) => setNewEpic((s) => ({ ...s, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Descripción"
                fullWidth
                value={newEpic.description}
                onChange={(e) => setNewEpic((s) => ({ ...s, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                label="Estado"
                fullWidth
                value={newEpic.status}
                onChange={(e) => setNewEpic((s) => ({ ...s, status: e.target.value }))}
              >
                {['BACKLOG', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
              <Grid item xs={12} md={2}>
                <Button size={btnSize} variant="contained" onClick={createEpic}>
                  Crear épica
                </Button>
              </Grid>
          </Grid>
          )}
          <Grid container spacing={3}>
            {epics.map((e) => (
              <Grid item xs={12} md={6} key={e.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{e.title}</Typography>
                    <Typography color="text.secondary">
                      {e.project_code} · {e.priority}
                    </Typography>
                    <Chip label={e.status} size={chipSize} sx={{ mt: 1 }} />
                    <Typography sx={{ mt: 1 }}>{e.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {can(role, 'agile.story.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <InputLabel id="story-epic-label">Épica</InputLabel>
              <Select
                labelId="story-epic-label"
                fullWidth
                value={newStory.epic}
                onChange={(e) => setNewStory((s) => ({ ...s, epic: e.target.value }))}
              >
                {epics.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.title}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="ID Historia"
                fullWidth
                value={newStory.story_id}
                onChange={(e) => setNewStory((s) => ({ ...s, story_id: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Título"
                fullWidth
                value={newStory.title}
                onChange={(e) => setNewStory((s) => ({ ...s, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                value={newStory.description}
                onChange={(e) => setNewStory((s) => ({ ...s, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Button size={btnSize} variant="contained" onClick={createStory}>
                Crear historia
              </Button>
            </Grid>
          </Grid>
          )}
          <Grid container spacing={3}>
            {stories.map((s) => (
              <Grid item xs={12} md={6} key={s.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{s.story_id} · {s.title}</Typography>
                    <Typography color="text.secondary">
                      {s.epic_title} · {s.priority}
                    </Typography>
                    <Chip label={s.status} size={chipSize} sx={{ mt: 1 }} />
                    <Typography sx={{ mt: 1 }}>{s.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          {can(role, 'agile.task.create') && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <InputLabel id="task-story-label">Historia</InputLabel>
              <Select
                labelId="task-story-label"
                fullWidth
                value={newTask.user_story}
                onChange={(e) => setNewTask((s) => ({ ...s, user_story: e.target.value }))}
              >
                {stories.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.story_id} · {s.title}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Título"
                fullWidth
                value={newTask.title}
                onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                label="Tipo"
                fullWidth
                value={newTask.task_type}
                onChange={(e) => setNewTask((s) => ({ ...s, task_type: e.target.value }))}
              >
                {['DEVELOPMENT', 'TESTING', 'DOCUMENTATION', 'REVIEW', 'BUG', 'REFACTOR'].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
              <Grid item xs={12} md={2}>
                <Button size={btnSize} variant="contained" onClick={createTask}>
                  Crear tarea
                </Button>
              </Grid>
          </Grid>
          )}
          <Grid container spacing={3}>
            {tasks.map((t) => (
              <Grid item xs={12} md={6} key={t.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{t.title}</Typography>
                    <Typography color="text.secondary">
                      {t.user_story_id} · {t.task_type}
                    </Typography>
                    <Chip label={t.status} size={chipSize} sx={{ mt: 1 }} />
                    <Typography sx={{ mt: 1 }}>{t.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Agile;
