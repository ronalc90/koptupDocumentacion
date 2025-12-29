import { useEffect } from 'react';
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
} from '@mui/material';
import { toast } from 'react-toastify';
import { register } from '../../store/slices/authSlice';
import { Link } from 'react-router-dom';

const validationSchema = yup.object({
  first_name: yup.string().required('El nombre es requerido'),
  last_name: yup.string().required('El apellido es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es requerida'),
  password2: yup.string().oneOf([yup.ref('password')], 'Las contraseñas no coinciden').required('Confirma la contraseña'),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error('No se pudo registrar');
    }
  }, [error]);

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
                helperText={formik.touched.password && formik.errors.password}
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
