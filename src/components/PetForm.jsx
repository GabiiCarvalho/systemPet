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
    if (acc.some(c => c.pets.some(p => p.id === pet.id))) {
      return acc;
    }

    const existingClient = acc.find(c => c.phone === pet.phone);

    if (existingClient) {
      if (!existingClient.pets.some(p => p.id === pet.id)) {
        existingClient.pets.push(pet);
      }
    } else {
      acc.push({
        owner: pet.owner,
        phone: pet.phone,
        pets: [pet]
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

    const isRenewal = quickScheduleForm.serviceType === "Renovação Plano Mensal";

    // Se for renovação, mostra mensagem e não permite continuar
    if (isRenewal) {
      alert(`Para renovar o plano mensal, por favor:\n
1. Vá para a aba de Caixa\n
2. Busque pelo cliente "${selectedClient.owner}"\n
3. Adicione o serviço "Renovação Plano Mensal" ao carrinho\n
4. Realize o pagamento`);
      return;
    }

    const isMonthlyPlan = quickScheduleForm.serviceType === "Plano Mensal";

    // Verifica pets sem plano tentando agendar como plano mensal
    const petsWithoutPlan = selectedClient.pets.filter(pet =>
      pet.serviceType !== "Plano Mensal" &&
      quickScheduleForm.serviceType === "Plano Mensal"
    );

    if (petsWithoutPlan.length > 0) {
      alert(`Os pets ${petsWithoutPlan.map(p => p.name).join(', ')} não têm plano mensal!`);
      return;
    }

    // Verifica pets com plano mas sem banhos disponíveis
    const petsWithNoBaths = selectedClient.pets.filter(pet =>
      pet.serviceType === "Plano Mensal" &&
      (pet.monthlyBathsRemaining || 0) <= 0 &&
      quickScheduleForm.serviceType === "Plano Mensal"
    );

    if (petsWithNoBaths.length > 0) {
      alert(`Os pets ${petsWithNoBaths.map(p => p.name).join(', ')} não têm banhos disponíveis! Renove o plano.`);
      return;
    }

    const scheduledDateTime = new Date(quickScheduleForm.scheduleDate);
    const time = new Date(quickScheduleForm.scheduleTime);
    scheduledDateTime.setHours(time.getHours());
    scheduledDateTime.setMinutes(time.getMinutes());

    const updatedPets = pets.map(pet => {
      const isClientPet = selectedClient.pets.some(p => p.id === pet.id);
      if (isClientPet) {
        const updatedPet = {
          ...pet,
          scheduleDate: scheduledDateTime,
          serviceType: quickScheduleForm.serviceType,
          observations: quickScheduleForm.observations,
          inService: false,
          serviceProgress: 0,
          completedToday: false
        };

        return updatedPet;
      }
      return pet;
    });

    setPets(updatedPets);
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
                    {selectedClient.pets.map((pet, index) => (
                      <Chip
                        key={`${pet.id}-${index}`}
                        label={
                          <>
                            {pet.name} ({pet.breed})
                            {pet.serviceType === "Plano Mensal" && (
                              ` | ${pet.monthlyBathsRemaining} banhos restantes`
                            )}
                            {pet.serviceType === "Plano Mensal" && quickScheduleForm.serviceType === "Plano Mensal" && (
                              ` (será ${pet.monthlyBathsRemaining - 1} após este serviço)`
                            )}
                          </>
                        }
                        variant="outlined"
                        color={pet.serviceType === "Plano Mensal" && pet.monthlyBathsRemaining <= 0 ? "warning" : "default"}
                        avatar={
                          <Avatar sx={{
                            bgcolor: pet.serviceType === "Plano Mensal"
                              ? (pet.monthlyBathsRemaining > 0 ? '#4671ffff' : '#ff9800')
                              : '#8e24aa',
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
                    <Alert
                      severity={
                        selectedClient.pets.some(p =>
                          p.serviceType === "Plano Mensal" &&
                          (p.monthlyBathsRemaining || 0) <= 0
                        )
                          ? "warning"
                          : "info"
                      }
                      sx={{ mt: 2 }}
                    >
                      {selectedClient.pets.some(p =>
                        p.serviceType === "Plano Mensal" &&
                        (p.monthlyBathsRemaining || 0) <= 0
                      )
                        ? "Alguns pets não têm banhos disponíveis no plano mensal. Renove o plano!"
                        : "Este cliente possui plano mensal. O banho será debitado do plano após a conclusão do serviço."
                      }
                    </Alert>
                  )}
                </Box>
              )}

              <TextField
                select
                label="Tipo de Serviço"
                fullWidth
                value={quickScheduleForm.serviceType}
                onChange={(e) => {
                  if (e.target.value === "Renovação Plano Mensal") {
                    alert(`Para renovar o plano mensal, por favor:\n
1. Vá para a aba de Caixa\n
2. Busque pelo cliente "${selectedClient?.owner || 'o cliente'}"\n
3. Adicione o serviço "Renovação Plano Mensal" ao carrinho\n
4. Realize o pagamento`);
                    return;
                  }
                  setQuickScheduleForm({ ...quickScheduleForm, serviceType: e.target.value });
                }}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Banho">Banho</MenuItem>
                <MenuItem value="Banho e Tosa">Banho e Tosa</MenuItem>
                <MenuItem value="Tosa Higiênica">Tosa Higiênica</MenuItem>
                <MenuItem value="Tosa Completa">Tosa Completa</MenuItem>
                <MenuItem value="Plano Mensal">Plano Mensal</MenuItem>
                <MenuItem value="Renovação Plano Mensal">Renovação Plano Mensal</MenuItem>
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