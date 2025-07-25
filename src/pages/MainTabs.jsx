import { useContext, useState } from "react";
import { PetsContext } from "../contexts/PetsContext";
import { Box, Tab, Tabs, Paper, Typography } from "@mui/material";
import PetForm from "../components/PetForm";
import ServiceFlow from "../components/ServiceFlow";
import Home from "./Home";
import Calendar from "../components/Calendar";
import Cashier from "./Cashier";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MainTabs = () => {
  const [value, setValue] = useState(0);
  const { pets, setPets } = useContext(PetsContext);
  
  const activePets = pets.filter(pet => pet.inService && pet.serviceProgress < 3);
  const finishedPets = pets.filter(pet => pet.serviceProgress === 3);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const updatePetProgress = (petId, progress) => {
    setPets(pets.map(pet => 
      pet.id === petId ? { ...pet, serviceProgress: progress } : pet
    ));
  };

  const completeService = (petId) => {
    setPets(pets.map(pet => 
      pet.id === petId ? { 
        ...pet, 
        serviceProgress: 3, 
        completedToday: true,
        inService: false 
      } : pet
    ));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Início" />
          <Tab label="Cadastro Pet" />
          <Tab label="Serviços Ativos" />
          <Tab label="Serviços Finalizados" />
          <Tab label="Agenda" />
          <Tab label="Caixa" />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <Home />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <PetForm />
      </TabPanel>

      <TabPanel value={value} index={2}>
        {activePets.length > 0 ? (
          activePets.map(pet => (
            <ServiceFlow 
              key={pet.id} 
              pet={pet} 
              onNextStep={(petId, step) => updatePetProgress(petId, step)}
              onComplete={completeService}
            />
          ))
        ) : (
          <Typography>Nenhum pet em serviço no momento</Typography>
        )}
      </TabPanel>

      <TabPanel value={value} index={3}>
        {finishedPets.length > 0 ? (
          finishedPets.map(pet => (
            <Paper key={pet.id} sx={{ p: 2, mb: 2 }}>
              <Typography>
                {pet.name} (Dono: {pet.owner}) - Serviço: {pet.serviceType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Finalizado em: {new Date().toLocaleString()}
              </Typography>
            </Paper>
          ))
        ) : (
          <Typography>Nenhum serviço finalizado hoje</Typography>
        )}
      </TabPanel>

      <TabPanel value={value} index={4}>
        <Calendar />
      </TabPanel>

      <TabPanel value={value} index={5}>
        <Cashier />
      </TabPanel>
    </Box>
  );
};

export default MainTabs;