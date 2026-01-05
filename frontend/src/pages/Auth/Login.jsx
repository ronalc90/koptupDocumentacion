import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, clearError } from '../../store/slices/authSlice';

const validationSchema = yup.object({
  email: yup
    .string('Ingrese su email')
    .email('Email inválido')
    .required('El email es requerido'),
  password: yup
    .string('Ingrese su contraseña')
    .required('La contraseña es requerida'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      let message = 'Credenciales inválidas';

      if (typeof error === 'object') {
        if (error.detail) {
          message = error.detail;
        } else if (error.email) {
          message = `Email: ${Array.isArray(error.email) ? error.email.join(', ') : error.email}`;
        } else if (error.password) {
          message = `Contraseña: ${Array.isArray(error.password) ? error.password.join(', ') : error.password}`;
        } else if (error.non_field_errors) {
          message = Array.isArray(error.non_field_errors) ? error.non_field_errors.join(', ') : error.non_field_errors;
        }
      } else if (typeof error === 'string') {
        message = error;
      }

      setErrorMessage(message);
      toast.error(message);
    } else {
      setErrorMessage('');
    }
  }, [error]);

  useEffect(() => {
    // Limpiar errores al desmontar
    return () => {
      dispatch(clearError());
      setErrorMessage('');
    };
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await dispatch(login(values));
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Lado Izquierdo - Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          px: 8,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
          Koptup Documentación
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          Gestión Documental Inteligente
        </Typography>
        <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.8 }}>
            Centraliza, estandariza y genera documentación de proyectos con IA.
            Tu solución completa para la gestión documental corporativa.
          </Typography>
        </Box>
      </Box>

      {/* Lado Derecho - Formulario de Login */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'white',
          px: 4,
        }}
      >
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Logo/Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
              }}
            >
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                D
              </Typography>
            </Box>

            <Typography
              component="h1"
              variant="h4"
              sx={{ fontWeight: 600, mb: 1 }}
            >
              Bienvenido
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Ingresa tus credenciales para continuar
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {errorMessage}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ width: '100%' }}
            >
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Correo Electrónico"
                margin="normal"
                autoComplete="email"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Contraseña"
                type="password"
                margin="normal"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes cuenta?{' '}
                  <MuiLink
                    component={Link}
                    to="/register"
                    sx={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Crear cuenta
                  </MuiLink>
                </Typography>
              </Box>

              {/* Demo Credentials */}
              <Paper
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Credenciales de prueba:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Email: test@koptup.com
                </Typography>
                <Typography variant="body2">
                  Password: test123456
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;
