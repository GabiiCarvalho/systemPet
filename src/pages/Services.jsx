import { useState, useContext } from "react";
import { PetsContext } from "../contexts/PetsContext";
import ServiceFlow from "../components/ServiceFlow";
import { Button, TextField, Box, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const Services = () => {
  const { pets, setPets } = useContext(PetsContext);
  const [newPet, setNewPet] = useState({ 
    name: "", 
    owner: "",
    serviceType: "Banho",
    monthlyBathsRemaining: 0
  });

  const handleAddPet = () => {
    if (newPet.name && newPet.owner) {
      setPets([...pets, { 
        ...newPet, 
        id: Date.now(),
        serviceProgress: 0,
        inService: false,
        completedToday: false,
        monthlyBathsRemaining: newPet.serviceType === "Plano Mensal" ? 4 : 0
      }]);
      setNewPet({ 
        name: "", 
        owner: "",
        serviceType: "Banho",
        monthlyBathsRemaining: 0
      });
    }
  };

  const handleNextStep = (petId, step) => {
    setPets(pets.map(pet => 
      pet.id === petId ? { ...pet, serviceProgress: step } : pet
    ));
  };

  const handleCompleteService = (petId) => {
    setPets(pets.map(pet => 
      pet.id === petId ? { 
        ...pet, 
        completedToday: true,
        monthlyBathsRemaining: pet.serviceType === "Plano Mensal" 
          ? Math.max(0, pet.monthlyBathsRemaining - 1)
          : 0
      } : pet
    ));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Serviços do Petshop
      </Typography>

      {/* Formulário para adicionar novo pet */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 4, alignItems: 'center' }}>
        <TextField
          label="Nome do Pet"
          value={newPet.name}
          onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
        />
        <TextField
          label="Dono"
          value={newPet.owner}
          onChange={(e) => setNewPet({ ...newPet, owner: e.target.value })}
        />
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Tipo de Serviço</InputLabel>
          <Select
            value={newPet.serviceType}
            label="Tipo de Serviço"
            onChange={(e) => setNewPet({ ...newPet, serviceType: e.target.value })}
          >
            <MenuItem value="Banho">Banho</MenuItem>
            <MenuItem value="Banho e Tosa">Banho e Tosa</MenuItem>
            <MenuItem value="Tosa Higiênica">Tosa Higiênica</MenuItem>
            <MenuItem value="Tosa Completa">Tosa Completa</MenuItem>
            <MenuItem value="Plano Mensal">Plano Mensal</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleAddPet}>
          Adicionar Pet
        </Button>
      </Box>

      {/* Lista de pets em serviço */}
      <Typography variant="h6" gutterBottom>
        Pets em Atendimento:
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {pets.map((pet) => (
          <ServiceFlow 
            key={pet.id} 
            pet={pet} 
            onNextStep={handleNextStep}
            onComplete={handleCompleteService}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Services;