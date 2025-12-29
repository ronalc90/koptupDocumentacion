import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Close,
  Add,
  Edit,
  Comment,
  Assignment,
  CheckCircleOutline,
} from '@mui/icons-material';
import { fetchTasks } from '../../store/slices/agileSlice';

// Tab Panel Component
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UserStoryDetailModal = ({ open, onClose, userStory, onOpenTaskModal }) => {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.agile);
  const [activeTab, setActiveTab] = useState(0);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (open && userStory) {
      // Fetch tasks for this user story
      dispatch(fetchTasks({ user_story: userStory.id }));
    }
  }, [open, userStory, dispatch]);

  if (!userStory) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddComment = () => {
    // TODO: Implement comment functionality
    console.log('Adding comment:', newComment);
    setNewComment('');
  };

  const userStoryTasks = tasks?.filter(task => task.user_story === userStory.id) || [];

  const getStatusColor = (status) => {
    const colors = {
      BACKLOG: 'default',
      TODO: 'default',
      IN_PROGRESS: 'primary',
      IN_REVIEW: 'info',
      TESTING: 'warning',
      DONE: 'success',
      BLOCKED: 'error',
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {userStory.story_id} - {userStory.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip
              label={userStory.status}
              color={getStatusColor(userStory.status)}
              size="small"
            />
            <Chip
              label={userStory.priority}
              color={getPriorityColor(userStory.priority)}
              size="small"
            />
            {userStory.story_points && (
              <Chip
                label={`${userStory.story_points} puntos`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ px: 3, pt: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Assignment />} label="Detalles" iconPosition="start" />
        <Tab icon={<CheckCircleOutline />} label={`Tasks (${userStoryTasks.length})`} iconPosition="start" />
        <Tab icon={<Comment />} label="Comentarios" iconPosition="start" />
      </Tabs>

      <DialogContent sx={{ pt: 0 }}>
        {/* Tab 0: Details */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Historia de Usuario
                </Typography>
                <Box sx={{
                  p: 2,
                  backgroundColor: '#f5f7fa',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    <strong>Como</strong> {userStory.as_a}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    <strong>Quiero</strong> {userStory.i_want}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Para</strong> {userStory.so_that}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Descripción
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {userStory.description}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Asignado a
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                    {userStory.assigned_to_name?.[0] || '?'}
                  </Avatar>
                  <Typography variant="body2">
                    {userStory.assigned_to_name || 'Sin asignar'}
                  </Typography>
                  <IconButton size="small" sx={{ ml: 'auto' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Estado
                </Typography>
                <Chip
                  label={userStory.status}
                  color={getStatusColor(userStory.status)}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Prioridad
                </Typography>
                <Chip
                  label={userStory.priority}
                  color={getPriorityColor(userStory.priority)}
                  size="small"
                />
              </Box>

              {userStory.story_points && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Puntos de Historia
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {userStory.story_points}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 1: Tasks */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tasks Técnicas
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => onOpenTaskModal(userStory.id)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                },
              }}
            >
              Nueva Task
            </Button>
          </Box>

          {userStoryTasks.length > 0 ? (
            <List>
              {userStoryTasks.map((task) => (
                <ListItem
                  key={task.id}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.status}
                          color={getStatusColor(task.status)}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Chip
                          label={task.task_type}
                          variant="outlined"
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={task.description}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay tasks todavía
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Crea tasks técnicas para implementar esta user story
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => onOpenTaskModal(userStory.id)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                  },
                }}
              >
                Crear Primera Task
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Tab 2: Comments */}
        <TabPanel value={activeTab} index={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Comentarios
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                  },
                }}
              >
                Agregar Comentario
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Comment sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No hay comentarios todavía
              </Typography>
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2.5,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}>
        <Button
          onClick={onClose}
          color="secondary"
          sx={{ minWidth: 100 }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserStoryDetailModal;
