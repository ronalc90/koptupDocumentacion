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
  AppBar,
  Toolbar,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import { register, clearError } from '../../store/slices/authSlice';
import { Link } from 'react-router-dom';

const validationSchema = yup.object({
  first_name: yup.string().required('El nombre es requerido'),
  last_name: yup.string().required('El apellido es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .matches(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .matches(/[0-9]/, 'Debe contener al menos un número')
    .required('La contraseña es requerida'),
  password2: yup.string().oneOf([yup.ref('password')], 'Las contraseñas no coinciden').required('Confirma la contraseña'),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [backendErrors, setBackendErrors] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      // Manejar diferentes tipos de errores del backend
      if (typeof error === 'object') {
        setBackendErrors(error);

        // Mostrar errores específicos de campos
        if (error.password) {
          toast.error(`Contraseña: ${Array.isArray(error.password) ? error.password.join(', ') : error.password}`);
        } else if (error.email) {
          toast.error(`Email: ${Array.isArray(error.email) ? error.email.join(', ') : error.email}`);
        } else if (error.detail) {
          toast.error(error.detail);
        } else {
          toast.error('Error en el registro. Verifica los datos ingresados.');
        }
      } else {
        toast.error(error || 'No se pudo registrar');
      }
    }
  }, [error]);

  useEffect(() => {
    // Limpiar errores al desmontar
    return () => {
      dispatch(clearError());
      setBackendErrors(null);
    };
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password2: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await dispatch(register(values));
    },
  });

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Plataforma de Gestión Documental
          </Typography>
          <MuiLink component={Link} to="/login" color="inherit" underline="none">
            Iniciar sesión
          </MuiLink>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Typography component="h1" variant="h5" gutterBottom>
              Crear cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Complete sus datos para comenzar
            </Typography>

            {backendErrors && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {backendErrors.password && (
                  <div>
                    <strong>Contraseña:</strong> {Array.isArray(backendErrors.password) ? backendErrors.password.join(', ') : backendErrors.password}
                  </div>
                )}
                {backendErrors.email && (
                  <div>
                    <strong>Email:</strong> {Array.isArray(backendErrors.email) ? backendErrors.email.join(', ') : backendErrors.email}
                  </div>
                )}
                {backendErrors.detail && <div>{backendErrors.detail}</div>}
                {!backendErrors.password && !backendErrors.email && !backendErrors.detail && (
                  <div>Error en el registro. Verifica los datos ingresados.</div>
                )}
              </Alert>
            )}

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                label="Nombre"
                margin="normal"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                label="Apellido"
                margin="normal"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                margin="normal"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Contraseña"
                type="password"
                margin="normal"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={
                  formik.touched.password && formik.errors.password
                    ? formik.errors.password
                    : 'Mínimo 8 caracteres, una mayúscula, una minúscula y un número'
                }
              />
              <TextField
                fullWidth
                id="password2"
                name="password2"
                label="Confirmar contraseña"
                type="password"
                margin="normal"
                value={formik.values.password2}
                onChange={formik.handleChange}
                error={formik.touched.password2 && Boolean(formik.errors.password2)}
                helperText={formik.touched.password2 && formik.errors.password2}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : 'Registrarse'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default Register;
