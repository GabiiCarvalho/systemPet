import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button,
  Alert
} from '@mui/material';

const Settings = () => {
  const { petshopName, updatePetshopName, user } = useContext(AuthContext);
  const [newName, setNewName] = useState(petshopName);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    updatePetshopName(newName);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (user?.role !== 'owner') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Acesso restrito ao proprietário</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Configurações do Petshop
      </Typography>
      
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Informações do Estabelecimento
        </Typography>
        
        <TextField
          label="Nome do Petshop"
          fullWidth
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          sx={{ mb: 3 }}
        />
        
        <Button
          variant="contained"
          onClick={handleSave}
        >
          Salvar Alterações
        </Button>
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Nome do petshop atualizado com sucesso!
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default Settings;