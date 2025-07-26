import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  Paper, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Chip 
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useState } from "react";

const ServiceFlow = ({ pet, onNextStep, onComplete }) => {
  const [activeStep, setActiveStep] = useState(pet.serviceProgress || 0);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Definindo os steps baseados no tipo de serviço
  const getSteps = () => {
    switch(pet.serviceType) {
      case 'Banho':
        return ['Banho', 'Secagem', 'Finalização'];
      case 'Banho e Tosa':
        return ['Banho', 'Secagem', 'Tosa Completa', 'Finalização'];
      case 'Tosa Higiênica':
        return ['Banho', 'Secagem', 'Tosa Higiênica', 'Finalização'];
      case 'Tosa Completa':
        return ['Banho', 'Secagem', 'Tosa Completa', 'Finalização'];
      case 'Plano Mensal':
        return ['Banho', 'Secagem', 'Finalização'];
      default:
        return ['Banho', 'Secagem', 'Finalização'];
    }
  };

  const steps = getSteps();

  const handleNext = () => {
    const newStep = activeStep + 1;
    setActiveStep(newStep);
    
    if (newStep === steps.length - 1) {
      setOpenDialog(true);
    } else {
      onNextStep?.(pet.id, newStep);
    }
  };

  const handleComplete = () => {
    onComplete?.(pet.id);
    setOpenDialog(false);
  };

  const isMonthlyPlan = pet.serviceType === "Plano Mensal";
  const bathsRemaining = pet.monthlyBathsRemaining || 0;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Processo para: <strong>{pet.name}</strong> (Dono: {pet.owner})
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Serviço: {pet.serviceType || 'Banho/Tosa'}
      </Typography>

      {isMonthlyPlan && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={
              bathsRemaining > 0
                ? `Banhos restantes: ${bathsRemaining}`
                : "Renove o plano mensal!"
            }
            color={bathsRemaining > 0 ? "primary" : "warning"}
            icon={bathsRemaining > 0 ? null : <WarningIcon />}
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      )}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel 
              StepIconProps={{
                completed: activeStep > steps.indexOf(label),
                active: activeStep === steps.indexOf(label)
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color={activeStep === steps.length - 1 ? 'success' : 'primary'}
          startIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : null}
          onClick={handleNext}
          disabled={activeStep >= steps.length}
          sx={{ px: 4 }}
        >
          {activeStep >= steps.length - 1 
            ? 'Finalizar Serviço' 
            : 'Próximo Passo'}
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Finalização</DialogTitle>
        <DialogContent>
          <Typography>
            Confirmar que o serviço para {pet.name} foi concluído com sucesso?
          </Typography>
          {isMonthlyPlan && bathsRemaining === 0 && (
            <Typography color="warning.main" sx={{ mt: 2 }}>
              <WarningIcon fontSize="small" /> Este pet não tem mais banhos disponíveis no plano mensal.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleComplete} 
            variant="contained" 
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ServiceFlow;