import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Settings = () => {
  const { user, users, addUser, updateUser, deleteUser } = useContext(AuthContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'employee',
    name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        password: '',
        role: user.role,
        name: user.name
      });
    } else {
      setFormData({
        email: '',
        password: '',
        role: 'employee',
        name: ''
      });
    }
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.email || !formData.name || (!selectedUser && !formData.password)) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (selectedUser) {
      // Atualizar usuário
      updateUser(selectedUser.id, {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        ...(formData.password && { password: formData.password })
      });
      setSuccess('Usuário atualizado com sucesso!');
    } else {
      // Criar novo usuário
      addUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        name: formData.name
      });
      setSuccess('Usuário criado com sucesso!');
    }

    setTimeout(() => {
      setOpenDialog(false);
      setSuccess('');
    }, 2000);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setOpenDeleteDialog(false);
    }
  };

  if (user?.role !== 'owner') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Acesso Restrito
        </Typography>
        <Typography variant="body1">
          Apenas o proprietário pode acessar esta área.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Configurações do Sistema
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Gerenciamento de Usuários
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Adicionar Usuário
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuário</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Função</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: u.role === 'owner' ? 'primary.main' : 'secondary.main' }}>
                        {u.name.charAt(0)}
                      </Avatar>
                      <Typography>{u.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role === 'owner' ? 'Proprietário' : 'Funcionário'}
                      color={u.role === 'owner' ? 'primary' : 'default'}
                      icon={u.role === 'owner' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(u)}>
                      <EditIcon />
                    </IconButton>
                    {u.role !== 'owner' && (
                      <IconButton onClick={() => handleOpenDeleteDialog(u)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo de Adição/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TextField
            fullWidth
            label="Nome Completo"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label={selectedUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            margin="normal"
            required={!selectedUser}
          />

          <TextField
            select
            fullWidth
            label="Função"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            margin="normal"
            disabled={selectedUser?.role === 'owner'} // Não permite alterar a função do proprietário
            SelectProps={{
              native: true,
            }}
          >
            <option value="employee">Funcionário</option>
            <option value="owner">Proprietário</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedUser ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o usuário <strong>{selectedUser?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;