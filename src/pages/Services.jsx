import { useState, useContext } from "react";
import { PetsContext } from "../contexts/PetsContext";
import ServiceFlow from "../components/ServiceFlow";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Services = () => {
  const { pets, setPets } = useContext(PetsContext);
  const [newPet, setNewPet] = useState({ name: "", owner: "" });

  const handleAddPet = () => {
    if (newPet.name && newPet.owner) {
      setPets([...pets, { ...newPet, id: Date.now() }]);
      setNewPet({ name: "", owner: "" });
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Serviços do Petshop
      </Typography>

      {/* Formulário para adicionar novo pet */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 4 }}>
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
          <ServiceFlow key={pet.id} pet={pet} />
        ))}
      </Box>
    </Box>
  );
};

export default Services;