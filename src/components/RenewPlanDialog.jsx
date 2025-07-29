import { useState, useContext } from 'react';
import { PetsContext } from '../contexts/PetsContext';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Box, Chip
} from '@mui/material';

const RenewPlanDialog = ({ open, onClose, client }) => {
  const { renewMonthlyPlan } = useContext(PetsContext);
  const [baths, setBaths] = useState(4);

  const handleRenew = () => {
    if (baths <= 0) {
      alert("O plano deve ser renovado.");
      return;
    }
    
    renewMonthlyPlan(client.phone, baths);
    onClose();
  };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Renovar Plano Mensal</DialogTitle>
            <DialogContent>
                <Typography gutterBottom>
                    Renovando plano para: <strong>{client.owner}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {client.phone}
                </Typography>

                <Box sx={{ my: 2 }}>
                    {client.pets.filter(p => p.serviceType === "Plano Mensal").map(pet => (
                        <Chip
                            key={pet.id}
                            label={`${pet.name} (${pet.breed})`}
                            sx={{ mr: 1, mb: 1 }}
                        />
                    ))}
                </Box>

                <TextField
                    select
                    label="Quantidade de Banhos"
                    fullWidth
                    value={baths}
                    onChange={(e) => setBaths(Number(e.target.value))}
                    sx={{ mt: 2 }}
                >
                    {[4, 6, 8, 10, 12].map(option => (
                        <MenuItem key={option} value={option}>
                            {option} banhos
                        </MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleRenew} variant="contained" color="primary">
                    Renovar Plano
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RenewPlanDialog;