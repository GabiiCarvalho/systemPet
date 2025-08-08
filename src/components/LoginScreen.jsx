import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Alert
} from '@mui/material';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }
    setError('');
    login(email, password);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper sx={{ p: 4, width: 400, maxWidth: '90%' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
          Login Petshop
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Senha"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          Email: proprietario@email.com (acesso total)<br />
          Email: funcionario@email.com (acesso limitado)
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginScreen;