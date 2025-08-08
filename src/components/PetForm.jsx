import { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { PetsContext } from "../contexts/PetsContext";
import {
  TextField, Button, Typography, Box,
  MenuItem, Paper, Container, Tabs, Tab,
  Autocomplete, Chip, Alert, Avatar, Checkbox,
  FormControlLabel, FormGroup
} from "@mui/material";
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import 'react-toastify/dist/ReactToastify.css';

const PetForm = ({ onChangeTab }) => {
  const { pets, setPets } = useContext(PetsContext);
  const [localTabValue, setLocalTabValue] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [additionalServices, setAdditionalServices] = useState({
    nailTrim: false,
    teethBrushing: false,
    furHydration: false,
    earCleaning: false
  });

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

  const [quickScheduleForm, setQuickScheduleForm] = useState({
    serviceType: "Plano Mensal",
    scheduleDate: new Date(),
    scheduleTime: new Date(),
    observations: ""
  });

  const servicePrices = {
    "Banho": 60,
    "Banho e Tosa": 80,
    "Tosa Higiênica": 75,
    "Tosa Completa": 90,
    "Plano Mensal": 180,
    "Renovação Plano Mensal": 180
  };

  const additionalServicePrices = {
    "nailTrim": 25,
    "teethBrushing": 25,
    "furHydration": 45,
    "earCleaning": 30,
    "eyeCleaning": 35
  };

  const serviceDescriptions = {
    "Banho": "Banho completo com produtos de qualidade",
    "Banho e Tosa": "Banho completo + tosa higiênica",
    "Tosa Higiênica": "Tosa nas áreas íntimas, patas e rosto",
    "Tosa Completa": "Tosa completa no corpo todo",
    "Plano Mensal": "4 banhos e 1 tosa higiênica por mês",
    "Renovação Plano Mensal": "Renovação do plano mensal (4 banhos + 1 tosa)"
  };

  const handleTabChange = (event, newValue) => {
    setLocalTabValue(newValue);
  };

  const handleAdditionalServiceChange = (event) => {
    setAdditionalServices({
      ...additionalServices,
      [event.target.name]: event.target.checked
    });
  };

  const handleNewPetSubmit = (e) => {
    e.preventDefault();

    if (!newPetForm.name || !newPetForm.owner || !newPetForm.phone) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const pendingData = {
      ...newPetForm,
      servicePrice: servicePrices[newPetForm.serviceType],
      serviceDescription: serviceDescriptions[newPetForm.serviceType],
      additionalServices: Object.entries(additionalServices)
        .filter(([_, value]) => value)
        .map(([key]) => key)
    };

    localStorage.setItem('pendingPetRegistration', JSON.stringify(pendingData));

    const newPet = {
      ...newPetForm,
      id: Date.now(),
      inService: false,
      serviceProgress: 0,
      completedToday: false,
      additionalServices: Object.entries(additionalServices)
        .filter(([_, value]) => value)
        .map(([key]) => key)
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
    setAdditionalServices({
      nailTrim: false,
      teethBrushing: false,
      furHydration: false,
      earCleaning: false
    });

    toast.success("Pet cadastrado com sucesso! Você será redirecionado para o caixa para finalizar o pagamento.");
    onChangeTab(6);
  };

  const handleQuickScheduleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error("Selecione um cliente para agendar o serviço!");
      return;
    }

    const petWithActivePlan = selectedClient.pets.find(p =>
      p.serviceType === "Plano Mensal" &&
      p.monthlyBathsRemaining > 0 &&
      (!p.planExpiration || new Date(p.planExpiration) > new Date())
    );

    const isPlanService = quickScheduleForm.serviceType === "Plano Mensal";
    const isRenewal = quickScheduleForm.serviceType === "Renovação Plano Mensal";

    if (isPlanService) {
      if (petWithActivePlan) {
        const selectedAdditionalServices = Object.entries(additionalServices)
          .filter(([_, value]) => value)
          .map(([key]) => key);

        const newAppointment = {
          ...petWithActivePlan,
          id: Date.now(),
          serviceType: "Banho",
          scheduleDate: quickScheduleForm.scheduleDate,
          scheduleTime: quickScheduleForm.scheduleTime,
          observations: quickScheduleForm.observations,
          inService: false,
          serviceProgress: 0,
          completedToday: false,
          usingPlan: true,
          additionalServices: selectedAdditionalServices
        };

        // Atualiza o número de banhos restantes no pet original do plano
        setPets(prevPets => prevPets.map(pet =>
          pet.id === petWithActivePlan.id ? {
            ...pet,
            monthlyBathsRemaining: pet.monthlyBathsRemaining - 1
          } : pet
        ));

        // Adiciona o novo agendamento
        setPets(prevPets => [...prevPets, newAppointment]);

        const remaining = petWithActivePlan.monthlyBathsRemaining - 1;
        toast.success(
          remaining > 0
            ? `Serviço agendado! Banhos restantes: ${remaining}`
            : "Serviço agendado! Seu plano acabou, renove para continuar usando.",
          { autoClose: 3000 }
        );

        setQuickScheduleForm({
          serviceType: "Plano Mensal",
          scheduleDate: new Date(),
          scheduleTime: new Date(),
          observations: ""
        });
        setAdditionalServices({
          nailTrim: false,
          teethBrushing: false,
          furHydration: false,
          earCleaning: false
        });
      } else {
        toast.error("Este cliente não tem um plano ativo com banhos disponíveis!");
      }
      return;
    }

    if (isRenewal) {
      localStorage.setItem('pendingPlanRenewal', JSON.stringify({
        client: selectedClient,
        serviceType: quickScheduleForm.serviceType
      }));
      onChangeTab(6);
      toast.success("Renovação de plano - você será redirecionado ao caixa");
      return;
    }

    const selectedAdditionalServices = Object.entries(additionalServices)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    localStorage.setItem('pendingServiceSchedule', JSON.stringify({
      client: selectedClient,
      serviceType: quickScheduleForm.serviceType,
      scheduleDate: quickScheduleForm.scheduleDate,
      scheduleTime: quickScheduleForm.scheduleTime,
      observations: quickScheduleForm.observations,
      usingPlan: false,
      additionalServices: selectedAdditionalServices
    }));

    onChangeTab(6);
    toast.info("Você será redirecionado ao caixa para finalizar");
  };

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

  const filteredClients = clients.filter(client =>
    client.owner.toLowerCase().includes(searchInput.toLowerCase()) ||
    client.phone.includes(searchInput)
  );

  const getAdditionalServicesPrice = () => {
    return Object.entries(additionalServices)
      .filter(([_, value]) => value)
      .reduce((total, [key]) => total + additionalServicePrices[key], 0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4 }}>
          <ToastContainer position="top-center" autoClose={3000} />

          <Tabs value={localTabValue} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
            <Tab label="Agendamento Rápido" />
            <Tab label="Novo Cadastro" />
          </Tabs>

          {localTabValue === 0 ? (
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
                  <TextField {...params} label="Buscar cliente por nome ou telefone" fullWidth sx={{ mb: 2 }} />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.phone}>
                    <Box>
                      <Typography>{option.owner}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.phone} • {option.pets.length} pet(s)
                      </Typography>
                    </Box>
                  </Box>
                )}
              />

              {selectedClient && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pets do cliente:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedClient.pets.map((pet) => (
                      <Chip
                        key={pet.id}
                        label={`${pet.name} (${pet.breed})`}
                        variant="outlined"
                        color={pet.serviceType === "Plano Mensal" ? "primary" : "default"}
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
                </Box>
              )}

              <TextField
                select
                label="Tipo de Serviço"
                fullWidth
                value={quickScheduleForm.serviceType}
                onChange={(e) => {
                  if (e.target.value === "Renovação Plano Mensal") {
                    toast.info(`Para renovar o plano mensal, por favor:
1. Vá para a aba de Caixa
2. Busque pelo cliente "${selectedClient?.owner || 'o cliente'}"
3. Adicione o serviço "Renovação Plano Mensal" ao carrinho
4. Realize o pagamento`, {
                      position: "top-center",
                      autoClose: 10000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    });
                    return;
                  }
                  setQuickScheduleForm({ ...quickScheduleForm, serviceType: e.target.value });
                }}
                sx={{ mb: 2 }}
              >
                {Object.entries(servicePrices).map(([service, price]) => (
                  <MenuItem key={service} value={service}>
                    {service} - R$ {price.toFixed(2)}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
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

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Serviços Adicionais:</Typography>
              <FormGroup row sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalServices.nailTrim}
                      onChange={handleAdditionalServiceChange}
                      name="nailTrim"
                    />
                  }
                  label={`Aparar Unhas (R$ ${additionalServicePrices.nailTrim.toFixed(2)})`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalServices.teethBrushing}
                      onChange={handleAdditionalServiceChange}
                      name="teethBrushing"
                    />
                  }
                  label={`Escovar Dentes (R$ ${additionalServicePrices.teethBrushing.toFixed(2)})`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalServices.furHydration}
                      onChange={handleAdditionalServiceChange}
                      name="furHydration"
                    />
                  }
                  label={`Hidratar Pelos (R$ ${additionalServicePrices.furHydration.toFixed(2)})`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalServices.eyeCleaning}
                      onChange={handleAdditionalServiceChange}
                      name="eyeCleaning"
                    />
                  }
                  label={`Limpeza dos Olhos (R$ ${additionalServicePrices.furHydration.toFixed(2)})`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalServices.earCleaning}
                      onChange={handleAdditionalServiceChange}
                      name="earCleaning"
                    />
                  }
                  label={`Limpeza de Ouvidos (R$ ${additionalServicePrices.earCleaning.toFixed(2)})`}
                />
              </FormGroup>

              {Object.values(additionalServices).some(v => v) && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Total de serviços adicionais: R$ {getAdditionalServicesPrice().toFixed(2)}
                </Alert>
              )}

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
                {Object.entries(servicePrices).map(([service, price]) => (
                  <MenuItem key={service} value={service}>
                    {service} - R$ {price.toFixed(2)}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
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

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Serviços Adicionais:</Typography>
              <FormGroup row sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalServices.nailTrim}
                      onChange={handleAdditionalServiceChange}
                      name="nailTrim"
                    />
                  }
                  label={`Aparar Unhas (R$ ${additionalServicePrices.nailTrim.toFixed(2)})`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalServices.teethBrushing}
                      onChange={handleAdditionalServiceChange}
                      name="teethBrushing"
                    />
                  }
                  label={`Escovar Dentes (R$ ${additionalServicePrices.teethBrushing.toFixed(2)})`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalServices.furHydration}
                      onChange={handleAdditionalServiceChange}
                      name="furHydration"
                    />
                  }
                  label={`Hidratar Pelos (R$ ${additionalServicePrices.furHydration.toFixed(2)})`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={additionalServices.earCleaning}
                      onChange={handleAdditionalServiceChange}
                      name="earCleaning"
                    />
                  }
                  label={`Limpeza de Ouvidos (R$ ${additionalServicePrices.earCleaning.toFixed(2)})`}
                />
              </FormGroup>

              {Object.values(additionalServices).some(v => v) && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Total de serviços adicionais: R$ {getAdditionalServicesPrice().toFixed(2)}
                </Alert>
              )}

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