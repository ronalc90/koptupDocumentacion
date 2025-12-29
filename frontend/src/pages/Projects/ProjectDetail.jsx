import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Link as MuiLink,
  Skeleton,
  Tabs,
  Tab,
  Button,
  IconButton,
  Breadcrumbs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Info,
  ViewKanban,
  Description,
  ExpandMore,
} from '@mui/icons-material';
import { fetchProjectById } from '../../store/slices/projectsSlice';
import { fetchEpics, fetchUserStories } from '../../store/slices/agileSlice';
import CreateEpicModal from '../../components/agile/CreateEpicModal';
import CreateUserStoryModal from '../../components/agile/CreateUserStoryModal';
import UserStoryDetailModal from '../../components/agile/UserStoryDetailModal';

// Tab Panel Component
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject, isLoading } = useSelector((state) => state.projects);
  const { epics, userStories, isLoading: isLoadingEpics } = useSelector((state) => state.agile);
  const [activeTab, setActiveTab] = useState(0);
  const [openEpicModal, setOpenEpicModal] = useState(false);
  const [openUserStoryModal, setOpenUserStoryModal] = useState(false);
  const [openUserStoryDetailModal, setOpenUserStoryDetailModal] = useState(false);
  const [selectedEpicId, setSelectedEpicId] = useState(null);
  const [selectedUserStory, setSelectedUserStory] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchEpics({ project: id }));
      dispatch(fetchUserStories({ epic__project: id }));
    }
  }, [dispatch, id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    navigate('/projects');
  };

  const getStatusColor = (status) => {
    const colors = {
      DEFINITION: 'default',
      DEVELOPMENT: 'primary',
      DOCUMENTATION: 'info',
      VALIDATION: 'warning',
      READY: 'success',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'default',
      MEDIUM: 'primary',
      HIGH: 'warning',
      CRITICAL: 'error',
    };
    return colors[priority] || 'default';
  };

  const handleOpenEpicModal = () => {
    setOpenEpicModal(true);
  };

  const handleCloseEpicModal = () => {
    setOpenEpicModal(false);
    // Refresh epics list
    if (id) {
      dispatch(fetchEpics({ project: id }));
    }
  };

  const handleEpicCreated = (epic) => {
    // Epic created successfully, list will be refreshed on modal close
    console.log('Epic created:', epic);
  };

  const handleOpenUserStoryModal = (epicId) => {
    setSelectedEpicId(epicId);
    setOpenUserStoryModal(true);
  };

  const handleCloseUserStoryModal = () => {
    setOpenUserStoryModal(false);
    setSelectedEpicId(null);
    // Refresh user stories list
    if (id) {
      dispatch(fetchUserStories({ epic__project: id }));
    }
  };

  const handleUserStoryCreated = (userStory) => {
    // User Story created successfully, list will be refreshed on modal close
    console.log('User Story created:', userStory);
  };

  // Get user stories count for a specific epic
  const getUserStoriesCountForEpic = (epicId) => {
    if (!userStories || !Array.isArray(userStories)) return 0;
    return userStories.filter(us => us.epic === epicId).length;
  };

  const handleOpenUserStoryDetail = (userStory) => {
    setSelectedUserStory(userStory);
    setOpenUserStoryDetailModal(true);
  };

  const handleCloseUserStoryDetail = () => {
    setOpenUserStoryDetailModal(false);
    setSelectedUserStory(null);
  };

  const handleOpenTaskModal = (userStoryId) => {
    // TODO: Open task creation modal
    console.log('Opening task modal for user story:', userStoryId);
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={240} height={60} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2, borderRadius: 2 }} />
      </Box>
    );
  }

  if (!currentProject) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          Proyecto no encontrado
        </Typography>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Volver a Proyectos
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Breadcrumbs>
            <MuiLink
              component="button"
              variant="body1"
              onClick={handleBack}
              sx={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              Proyectos
            </MuiLink>
            <Typography color="text.primary">{currentProject.name}</Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {currentProject.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={currentProject.code} variant="outlined" size="small" />
              <Chip
                label={currentProject.status}
                color={getStatusColor(currentProject.status)}
                size="small"
              />
              <Chip
                label={currentProject.priority}
                color={getPriorityColor(currentProject.priority)}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<Info />} label="Información" iconPosition="start" />
          <Tab icon={<ViewKanban />} label="Épicas & Tareas" iconPosition="start" />
          <Tab icon={<Description />} label="Documentos" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Información del Proyecto */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Descripción
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                  {currentProject.description || 'Sin descripción'}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Detalles
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cliente
                    </Typography>
                    <Typography variant="body1">{currentProject.client_name || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Metodología
                    </Typography>
                    <Typography variant="body1">
                      {currentProject.methodology_name || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fecha de Inicio
                    </Typography>
                    <Typography variant="body1">{currentProject.start_date || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Fecha de Fin
                    </Typography>
                    <Typography variant="body1">{currentProject.end_date || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Presupuesto
                    </Typography>
                    <Typography variant="body1">{currentProject.budget ?? '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Horas Estimadas
                    </Typography>
                    <Typography variant="body1">
                      {currentProject.estimated_hours ?? '—'}
                    </Typography>
                  </Grid>
                  {currentProject.repository_url && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Repositorio
                      </Typography>
                      <MuiLink
                        href={currentProject.repository_url}
                        target="_blank"
                        rel="noopener"
                      >
                        {currentProject.repository_url}
                      </MuiLink>
                    </Grid>
                  )}
                  {currentProject.documentation_url && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Documentación
                      </Typography>
                      <MuiLink
                        href={currentProject.documentation_url}
                        target="_blank"
                        rel="noopener"
                      >
                        {currentProject.documentation_url}
                      </MuiLink>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Equipo
                </Typography>
                {currentProject.members && currentProject.members.length > 0 ? (
                  currentProject.members.map((member) => (
                    <Box key={member.id} sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {member.user_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.role}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {member.user_email}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin miembros asignados
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Fases
                </Typography>
                {currentProject.phases && currentProject.phases.length > 0 ? (
                  currentProject.phases.map((phase) => (
                    <Box key={phase.id} sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {phase.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {phase.start_date || '—'} → {phase.end_date || '—'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sin fases definidas
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Épicas & Tareas */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Épicas del Proyecto
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenEpicModal}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                },
              }}
            >
              Nueva Épica
            </Button>
          </Box>

          {epics && epics.length > 0 ? (
            <Box sx={{ mb: 3 }}>
              {epics.map((epic) => (
                <Accordion key={epic.id} sx={{ mb: 2, '&:before': { display: 'none' } }}>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      backgroundColor: 'background.paper',
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                        {epic.title}
                      </Typography>
                      <Chip
                        label={epic.status}
                        color={getStatusColor(epic.status)}
                        size="small"
                      />
                      <Chip
                        label={epic.priority}
                        color={getPriorityColor(epic.priority)}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 2 }}>
                    <Typography variant="body2" paragraph>
                      {epic.description}
                    </Typography>
                    {epic.business_value && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Valor de Negocio
                        </Typography>
                        <Typography variant="body2">
                          {epic.business_value}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 2 }} />

                    {/* User Stories List */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          User Stories ({getUserStoriesCountForEpic(epic.id)})
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Add />}
                          onClick={() => handleOpenUserStoryModal(epic.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Nueva User Story
                        </Button>
                      </Box>

                      {userStories && userStories.filter(us => us.epic === epic.id).length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {userStories
                            .filter(us => us.epic === epic.id)
                            .map((story) => (
                              <Card
                                key={story.id}
                                onClick={() => handleOpenUserStoryDetail(story)}
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    boxShadow: 3,
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              >
                                <CardContent sx={{ py: 1.5, px: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {story.story_id} - {story.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                        Como {story.as_a}, quiero {story.i_want}
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip
                                          label={story.status}
                                          color={getStatusColor(story.status)}
                                          size="small"
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                        <Chip
                                          label={story.priority}
                                          color={getPriorityColor(story.priority)}
                                          size="small"
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                        {story.story_points && (
                                          <Chip
                                            label={`${story.story_points} pts`}
                                            variant="outlined"
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          No hay user stories en esta épica
                        </Typography>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ViewKanban sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No hay épicas todavía
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Comienza creando tu primera épica para organizar el trabajo del proyecto
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenEpicModal}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                      },
                    }}
                  >
                    Crear Primera Épica
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Documentos */}
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Description sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Documentación del proyecto
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Aquí se mostrarán los documentos generados para este proyecto
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Create Epic Modal */}
      <CreateEpicModal
        open={openEpicModal}
        onClose={handleCloseEpicModal}
        projectId={id}
        onEpicCreated={handleEpicCreated}
      />

      {/* Create User Story Modal */}
      <CreateUserStoryModal
        open={openUserStoryModal}
        onClose={handleCloseUserStoryModal}
        epicId={selectedEpicId}
        onUserStoryCreated={handleUserStoryCreated}
      />

      {/* User Story Detail Modal */}
      <UserStoryDetailModal
        open={openUserStoryDetailModal}
        onClose={handleCloseUserStoryDetail}
        userStory={selectedUserStory}
        onOpenTaskModal={handleOpenTaskModal}
      />
    </Box>
  );
};

export default ProjectDetail;
