import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import { Add, AutoAwesome } from '@mui/icons-material';
import { fetchProjects } from '../../store/slices/projectsSlice';
import CreateProjectModal from '../../components/projects/CreateProjectModal';
import ProjectDocumentationModal from '../../components/ProjectDocumentationModal';

const Projects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, isLoading } = useSelector((state) => state.projects);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [documentationModal, setDocumentationModal] = useState({ open: false, project: null });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    // Refresh projects list after closing modal
    dispatch(fetchProjects());
  };

  const handleProjectCreated = (project) => {
    // Navegar al detalle del proyecto recién creado
    navigate(`/projects/${project.id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      DEFINITION: 'default',
      DEVELOPMENT: 'primary',
      DOCUMENTATION: 'info',
      VALIDATION: 'warning',
      READY: 'success',
      DELIVERED: 'success',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Proyectos</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreateModal}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
            },
          }}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {project.code}
                </Typography>
                <Chip
                  label={project.status}
                  color={getStatusColor(project.status)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button size="small" onClick={() => navigate(`/projects/${project.id}`)}>
                  Ver Detalles
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesome />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentationModal({ open: true, project });
                  }}
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5568d3',
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                    },
                  }}
                >
                  Generar Docs
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!isLoading && projects.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            No hay proyectos disponibles
          </Typography>
        </Box>
      )}

      <CreateProjectModal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        onProjectCreated={handleProjectCreated}
      />

      <ProjectDocumentationModal
        open={documentationModal.open}
        onClose={() => setDocumentationModal({ open: false, project: null })}
        project={documentationModal.project}
      />
    </Box>
  );
};

export default Projects;
