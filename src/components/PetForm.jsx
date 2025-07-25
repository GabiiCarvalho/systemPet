import { useContext, useState } from "react";
import { PetsContext } from "../contexts/PetsContext";
import { 
  TextField, Button, Box, Typography, Grid, 
  MenuItem, Paper, InputAdornment 
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PetForm = () => {
  const { pets, setPets } = useContext(PetsContext);
  const [form, setForm] = useState({ 
    name: "", 
    owner: "", 
    breed: "",
    phone: "",
    serviceType: "Banho",
    observations: "",
    scheduleDate: new Date(),
    monthlyBathsRemaining: 0,
    monthlyHygienicGrooming: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPet = {
      ...form,
      id: Date.now(),
      inService: false,
      serviceProgress: 0,
      completedToday: false,
      monthlyBathsRemaining: form.serviceType === "Plano Mensal" ? 4 : 0,
      monthlyHygienicGrooming: form.serviceType === "Plano Mensal"
    };
    setPets([...pets, newPet]);
    setForm({ 
      name: "", 
      owner: "", 
      breed: "",
      phone: "",
      serviceType: "Banho",
      observations: "",
      scheduleDate: new Date(),
      monthlyBathsRemaining: 0,
      monthlyHygienicGrooming: false
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Cadastro de Novo Pet
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Pet"
                fullWidth
                required
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Raça"
                fullWidth
                value={form.breed}
                onChange={(e) => setForm({...form, breed: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Dono"
                fullWidth
                required
                value={form.owner}
                onChange={(e) => setForm({...form, owner: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <PhoneInput
                country={'br'}
                value={form.phone}
                onChange={(phone) => setForm({...form, phone})}
                inputStyle={{ width: '100%' }}
                placeholder="Telefone para contato"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Tipo de Serviço"
                fullWidth
                value={form.serviceType}
                onChange={(e) => setForm({...form, serviceType: e.target.value})}
              >
                <MenuItem value="Plano Mensal">Plano Mensal</MenuItem>
                <MenuItem value="Banho">Banho</MenuItem>
                <MenuItem value="Banho e Tosa">Banho e Tosa</MenuItem>
                <MenuItem value="Tosa Higiênica">Tosa Higiênica</MenuItem>
                <MenuItem value="Tosa Completa">Tosa Completa</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data do Serviço"
                value={form.scheduleDate}
                onChange={(newDate) => setForm({...form, scheduleDate: newDate})}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={new Date()}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observações"
                fullWidth
                multiline
                rows={3}
                value={form.observations}
                onChange={(e) => setForm({...form, observations: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                fullWidth
                sx={{ mt: 2 }}
              >
                Cadastrar Pet
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default PetForm;