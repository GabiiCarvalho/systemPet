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
  Chip,
  Alert
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useState } from "react";

const ServiceFlow = ({ pet, onNextStep, onComplete }) => {
  const [activeStep, setActiveStep] = useState(pet.serviceProgress || 0);
  const [openDialog, setOpenDialog] = useState(false);

  const getSteps = () => {
    return ['Banho', 'Secagem', 'Finalização'];
  };

  const steps = getSteps();
  const isMonthlyPlan = pet.serviceType === "Plano Mensal";
  const bathsRemaining = pet.monthlyBathsRemaining ?? 4;
  const needsRenewal = isMonthlyPlan && bathsRemaining <= 0;

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
    const isMonthlyPlan = pet.serviceType === "Plano Mensal";
    const updatedPet = {
      ...pet,
      completedToday: true,
      inService: false,
      serviceProgress: steps.length,
      monthlyBathsRemaining: isMonthlyPlan ? Math.max(0, (pet.monthlyBathsRemaining || 0) - 1) : 0
    };
    
    onComplete?.(updatedPet);
    setOpenDialog(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Processo para: {pet.name} (Dono: {pet.owner})
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Serviço: {pet.serviceType}
      </Typography>

      {isMonthlyPlan && (
        <Box sx={{ mb: 3 }}>
          <Chip
            label={`${bathsRemaining} banhos restantes`}
            color="primary"
            variant="outlined"
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1rem',
              padding: '8px 12px'
            }}
          />
        </Box>
      )}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          disabled={activeStep >= steps.length || (isMonthlyPlan && needsRenewal)}
          sx={{ px: 6, py: 1.5 }}
        >
          {activeStep >= steps.length - 1 ? 'Finalização' : 'Próximo Passo'}
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Confirmar Finalização
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ fontSize: '1.1rem' }}>
            Confirmar que o serviço para {pet.name} foi concluído com sucesso?
          </Typography>

          {isMonthlyPlan && (
            <Alert severity="info" sx={{ mt: 2, fontSize: '1rem' }}>
              Após esta sessão, restarão {Math.max(0, bathsRemaining - 1)} banhos no plano.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            variant="outlined"
            sx={{ px: 4, py: 1 }}
          >
            CANCELAR
          </Button>
          <Button
            onClick={handleComplete}
            variant="contained"
            color="primary"
            sx={{ px: 4, py: 1 }}
          >
            CONFIRMAR
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ServiceFlow;