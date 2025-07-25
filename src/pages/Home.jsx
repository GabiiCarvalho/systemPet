import { Box, Typography, Grid, Paper, Chip, Avatar, LinearProgress } from "@mui/material";
import { PetsContext } from "../contexts/PetsContext";
import { useContext } from "react";
import BathroomIcon from '@mui/icons-material/Bathroom';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Home = () => {
  const { pets } = useContext(PetsContext);

  // Agrupa pets por status
  const petsByStatus = pets.reduce((acc, pet) => {
    if (!pet.inService) return acc;

    const status =
      pet.serviceProgress === 1 ? 'Secagem' :
        pet.serviceProgress === 2 ? 'Tosa' :
          pet.serviceProgress >= 3 ? 'Finalizado' :
            'Banho';

    if (!acc[status]) acc[status] = [];
    acc[status].push(pet);
    return acc;
  }, {});

  // Cores para cada status
  const statusColors = {
    'Banho': '#1976d2',
    'Secagem': '#9c27b0',
    'Tosa': '#ff9800',
    'Finalizado': '#4caf50'
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Panorama de Serviços
      </Typography>

      {/* Cards de Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(petsByStatus).map(([status, petsList]) => (
          <Grid item xs={12} md={6} lg={4} key={status}>
            <Paper sx={{
              p: 2,
              borderLeft: `4px solid ${statusColors[status] || '#ccc'}`,
              boxShadow: 3
            }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 'bold',
                  color: statusColors[status] || 'inherit'
                }}
              >
                {status} ({petsList.length})
              </Typography>

              {petsList.map(pet => (
                <Box
                  key={pet.id}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    backgroundColor: '#fafafa'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{
                      bgcolor: statusColors[status],
                      mr: 2,
                      color: 'white'
                    }}>
                      {pet.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        <strong>{pet.name}</strong> ({pet.breed || 'Raça não informada'})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dono: {pet.owner}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Barra de progresso */}
                  <LinearProgress
                    variant="determinate"
                    value={(pet.serviceProgress || 0) * 25}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      mb: 2,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: statusColors[status]
                      }
                    }}
                  />

                  {/* Etapas do serviço */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    {['Banho', 'Secagem', 'Tosa', 'Finalizado'].map((etapa, index) => (
                      <Chip
                        key={etapa}
                        label={etapa}
                        size="small"
                        icon={
                          etapa === 'Banho' ? <BathroomIcon fontSize="small" /> :
                            etapa === 'Secagem' ? <BathroomIcon fontSize="small" /> :
                              etapa === 'Tosa' ? <ContentCutIcon fontSize="small" /> :
                                <CheckCircleIcon fontSize="small" />
                        }
                        sx={{
                          backgroundColor: pet.serviceProgress >= index ? statusColors[status] : '#e0e0e0',
                          color: pet.serviceProgress >= index ? '#fff' : 'inherit',
                          minWidth: 80
                        }}
                      />
                    ))}
                  </Box>

                  {pet.serviceType === "Plano Mensal" && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Chip
                        label={
                          pet.monthlyBathsRemaining > 0
                            ? `Banhos restantes: ${pet.monthlyBathsRemaining}/4`
                            : "Plano esgotado - Renovar!"
                        }
                        color={pet.monthlyBathsRemaining > 0 ? "primary" : "error"}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}
                      />
                    </Box>
                  )}

                </Box>
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Resumo do Dia */}
      <Paper sx={{
        p: 3,
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Resumo do Dia
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Typography>
            <strong>Total de Pets:</strong> <span style={{ color: '#1976d2' }}>{pets.length}</span>
          </Typography>
          <Typography>
            <strong>Em Andamento:</strong> <span style={{ color: '#9c27b0' }}>{pets.filter(p => p.inService && !p.completedToday).length}</span>
          </Typography>
          <Typography>
            <strong>Finalizados:</strong> <span style={{ color: '#4caf50' }}>{pets.filter(p => p.completedToday).length}</span>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Home;