import { useContext, useState } from "react";
import { PetsContext } from "../contexts/PetsContext";
import {
  TextField, Button, Typography, Grid,
  MenuItem, Paper, Container
} from "@mui/material";
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
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
    scheduleTime: new Date(),
    monthlyBathsRemaining: 0,
    monthlyHygienicGrooming: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Combinando data e hora
    const scheduledDateTime = new Date(form.scheduleDate);
    const time = new Date(form.scheduleTime);
    scheduledDateTime.setHours(time.getHours());
    scheduledDateTime.setMinutes(time.getMinutes());

    const newPet = {
      ...form,
      id: Date.now(),
      scheduledDateTime,
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
      scheduleTime: new Date(),
      monthlyBathsRemaining: 0,
      monthlyHygienicGrooming: false
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              mb: 3,
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Cadastro de Novo Pet
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Nome do Pet */}
              <Grid item xs={12}>
                <TextField
                  label="Nome do Pet *"
                  fullWidth
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Grid>

              {/* Telefone */}
              <Grid item xs={12}>
                <PhoneInput
                  country={'br'}
                  value={form.phone}
                  onChange={(phone) => setForm({ ...form, phone })}
                  inputStyle={{ width: '100%' }}
                  placeholder="Telefone para contato"
                />
              </Grid>

              {/* Raça */}
              <Grid item xs={12}>
                <TextField
                  label="Raça"
                  fullWidth
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                />
              </Grid>

              {/* Tipo de Serviço */}
              <Grid item xs={12}>
                <TextField
                  select
                  label="Tipo de Serviço"
                  fullWidth
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                >
                  <MenuItem value="Banho">Banho</MenuItem>
                  <MenuItem value="Banho e Tosa">Banho e Tosa</MenuItem>
                  <MenuItem value="Tosa Higiênica">Tosa Higiênica</MenuItem>
                  <MenuItem value="Tosa Completa">Tosa Completa</MenuItem>
                  <MenuItem value="Plano Mensal">Plano Mensal</MenuItem>
                </TextField>
              </Grid>

              {/* Data e Hora */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data do Serviço"
                  value={form.scheduleDate}
                  onChange={(newDate) => setForm({ ...form, scheduleDate: newDate })}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={new Date()}
                  format="dd/MM/yyyy"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Horário do Serviço"
                  value={form.scheduleTime}
                  onChange={(newTime) => setForm({ ...form, scheduleTime: newTime })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              {/* Nome do Dono */}
              <Grid item xs={12}>
                <TextField
                  label="Nome do Dono *"
                  fullWidth
                  required
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                />
              </Grid>

              {/* Observações */}
              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  fullWidth
                  multiline
                  rows={3}
                  value={form.observations}
                  onChange={(e) => setForm({ ...form, observations: e.target.value })}
                />
              </Grid>

              {/* Botão de Cadastro */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ mt: 2, py: 1.5 }}
                >
                  CADASTRAR PET
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default PetForm;