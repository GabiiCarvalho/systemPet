import { useContext, useState } from "react";
import { PetsContext } from "../contexts/PetsContext";
import {
  TextField, Button, Typography, Box,
  MenuItem, Paper, Container, Tabs, Tab,
  Autocomplete, Chip, Alert, Avatar
} from "@mui/material";
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PetForm = () => {
  const { pets, setPets } = useContext(PetsContext);
  const [tabValue, setTabValue] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  // Estado para novo cadastro
  const [newPetForm, setNewPetForm] = useState({
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

  // Estado para agendamento rápido
  const [quickScheduleForm, setQuickScheduleForm] = useState({
    serviceType: "Banho",
    scheduleDate: new Date(),
    scheduleTime: new Date(),
    observations: ""
  });

  // Agrupar clientes por telefone (único)
  const clients = pets.reduce((acc, pet) => {
    if (!acc.some(c => c.phone === pet.phone)) {
      acc.push({
        owner: pet.owner,
        phone: pet.phone,
        pets: pets.filter(p => p.phone === pet.phone)
      });
    }
    return acc;
  }, []);

  // Filtrar clientes para busca
  const filteredClients = clients.filter(client =>
    client.owner.toLowerCase().includes(searchInput.toLowerCase()) ||
    client.phone.includes(searchInput)
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Manipulador para novo cadastro
  const handleNewPetSubmit = (e) => {
    e.preventDefault();

    const scheduledDateTime = new Date(newPetForm.scheduleDate);
    const time = new Date(newPetForm.scheduleTime);
    scheduledDateTime.setHours(time.getHours());
    scheduledDateTime.setMinutes(time.getMinutes());

    const newPet = {
      ...newPetForm,
      id: Date.now(),
      scheduleDate: scheduledDateTime,
      inService: false,
      serviceProgress: 0,
      completedToday: false,
      monthlyBathsRemaining: newPetForm.serviceType === "Plano Mensal" ? 4 : 0,
      monthlyHygienicGrooming: newPetForm.serviceType === "Plano Mensal"
    };

    setPets([...pets, newPet]);
    setNewPetForm({
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

  // Manipulador para agendamento rápido
  const handleQuickScheduleSubmit = (e) => {
    e.preventDefault();

    if (!selectedClient) return;

    const scheduledDateTime = new Date(quickScheduleForm.scheduleDate);
    const time = new Date(quickScheduleForm.scheduleTime);
    scheduledDateTime.setHours(time.getHours());
    scheduledDateTime.setMinutes(time.getMinutes());

    // Para cada pet do cliente, cria um agendamento
    const newAppointments = selectedClient.pets.map(pet => ({
      ...pet,
      id: Date.now() + Math.random(), // ID único
      scheduleDate: scheduledDateTime,
      serviceType: quickScheduleForm.serviceType,
      observations: quickScheduleForm.observations,
      inService: false,
      serviceProgress: 0,
      completedToday: false,
      // Atualiza banhos restantes se for plano mensal
      monthlyBathsRemaining: pet.serviceType === "Plano Mensal"
        ? Math.max(0, (pet.monthlyBathsRemaining || 0) - 1)
        : 0
    }));

    setPets([...pets, ...newAppointments]);
    setQuickScheduleForm({
      serviceType: "Banho",
      scheduleDate: new Date(),
      scheduleTime: new Date(),
      observations: ""
    });
    setSelectedClient(null);
    setSearchInput("");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Agendamento Rápido" />
            <Tab label="Novo Cadastro" />
          </Tabs>

          {tabValue === 0 ? (
            <form onSubmit={handleQuickScheduleSubmit}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Agendamento para Cliente Cadastrado
              </Typography>

              {/* Correção principal no Autocomplete */}
              <Autocomplete
                options={filteredClients}
                getOptionLabel={(option) => `${option.owner} (${option.phone})`}
                inputValue={searchInput}
                onInputChange={(e, newValue) => setSearchInput(newValue)}
                onChange={(e, newValue) => setSelectedClient(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar cliente por nome ou telefone"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...restProps } = props;
                  return (
                    <li key={option.phone} {...restProps}>
                      <Box>
                        <Typography>{option.owner}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.phone} • {option.pets.length} pet(s)
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
              />

              {selectedClient && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pets do cliente:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedClient.pets.map(pet => (
                      <Chip
                        key={pet.id}
                        label={`${pet.name} (${pet.breed})`}
                        variant="outlined"
                        avatar={
                          <Avatar sx={{
                            bgcolor: pet.serviceType === "Plano Mensal" ? '#4671ffff' : '#8e24aa',
                            width: 24,
                            height: 24,
                            fontSize: 12
                          }}>
                            {pet.name.charAt(0)}
                          </Avatar>
                        }
                      />
                    ))}
                  </Box>

                  {selectedClient.pets.some(p => p.serviceType === "Plano Mensal") && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Este cliente possui plano mensal. O banho será debitado do plano.
                    </Alert>
                  )}
                </Box>
              )}

              <TextField
                select
                label="Tipo de Serviço"
                fullWidth
                value={quickScheduleForm.serviceType}
                onChange={(e) => setQuickScheduleForm({ ...quickScheduleForm, serviceType: e.target.value })}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Banho">Banho</MenuItem>
                <MenuItem value="Banho e Tosa">Banho e Tosa</MenuItem>
                <MenuItem value="Tosa Higiênica">Tosa Higiênica</MenuItem>
                <MenuItem value="Tosa Completa">Tosa Completa</MenuItem>
                <MenuItem value="Plano Mensal">Plano Mensal</MenuItem>
              </TextField>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2
              }}>
                <DatePicker
                  label="Data do Serviço"
                  value={quickScheduleForm.scheduleDate}
                  onChange={(newDate) => setQuickScheduleForm({ ...quickScheduleForm, scheduleDate: newDate })}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={new Date()}
                  format="dd/MM/yyyy"
                />
                <TimePicker
                  label="Horário do Serviço"
                  value={quickScheduleForm.scheduleTime}
                  onChange={(newTime) => setQuickScheduleForm({ ...quickScheduleForm, scheduleTime: newTime })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>

              <TextField
                label="Observações"
                fullWidth
                multiline
                rows={2}
                value={quickScheduleForm.observations}
                onChange={(e) => setQuickScheduleForm({ ...quickScheduleForm, observations: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!selectedClient}
                sx={{ py: 1.5 }}
              >
                AGENDAR SERVIÇO
              </Button>
            </form>
          ) : (
            // FORMULÁRIO DE NOVO CADASTRO
            <form onSubmit={handleNewPetSubmit}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Cadastrar Novo Pet
              </Typography>

              <TextField
                label="Nome do Pet *"
                fullWidth
                required
                value={newPetForm.name}
                onChange={(e) => setNewPetForm({ ...newPetForm, name: e.target.value })}
                sx={{ mb: 2 }}
              />

              <PhoneInput
                country={'br'}
                value={newPetForm.phone}
                onChange={(phone) => setNewPetForm({ ...newPetForm, phone })}
                inputStyle={{ width: '100%', marginBottom: '16px' }}
                placeholder="Telefone para contato *"
              />

              <TextField
                label="Raça"
                fullWidth
                value={newPetForm.breed}
                onChange={(e) => setNewPetForm({ ...newPetForm, breed: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                select
                label="Tipo de Serviço"
                fullWidth
                value={newPetForm.serviceType}
                onChange={(e) => setNewPetForm({ ...newPetForm, serviceType: e.target.value })}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Banho">Banho</MenuItem>
                <MenuItem value="Banho e Tosa">Banho e Tosa</MenuItem>
                <MenuItem value="Tosa Higiênica">Tosa Higiênica</MenuItem>
                <MenuItem value="Tosa Completa">Tosa Completa</MenuItem>
                <MenuItem value="Plano Mensal">Plano Mensal</MenuItem>
              </TextField>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2
              }}>
                <DatePicker
                  label="Data do Serviço"
                  value={newPetForm.scheduleDate}
                  onChange={(newDate) => setNewPetForm({ ...newPetForm, scheduleDate: newDate })}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={new Date()}
                  format="dd/MM/yyyy"
                />
                <TimePicker
                  label="Horário do Serviço"
                  value={newPetForm.scheduleTime}
                  onChange={(newTime) => setNewPetForm({ ...newPetForm, scheduleTime: newTime })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>

              <TextField
                label="Nome do Dono *"
                fullWidth
                required
                value={newPetForm.owner}
                onChange={(e) => setNewPetForm({ ...newPetForm, owner: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Observações"
                fullWidth
                multiline
                rows={3}
                value={newPetForm.observations}
                onChange={(e) => setNewPetForm({ ...newPetForm, observations: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{ py: 1.5 }}
              >
                CADASTRAR PET
              </Button>
            </form>
          )}
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default PetForm;