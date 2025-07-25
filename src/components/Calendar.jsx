import { useState, useContext } from "react";
import { PetsContext } from "../contexts/PetsContext";
import { 
  Box, Typography, Paper, Chip, Grid,
  Tabs, Tab, Divider, Button, ButtonGroup,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, useTheme, Badge
} from "@mui/material";
import { 
  format, isSameDay, isSameWeek, isSameMonth, 
  parseISO, eachDayOfInterval, startOfWeek, 
  endOfWeek, startOfMonth, endOfMonth, addDays,
  isToday, isWeekend
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EventIcon from '@mui/icons-material/Event';

const Calendar = () => {
  const { pets, startService, completeService } = useContext(PetsContext);
  const [viewMode, setViewMode] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPet, setSelectedPet] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const theme = useTheme();

  // Cores para status
  const statusColors = {
    'pending': theme.palette.warning.main,    // Agendado
    'inProgress': theme.palette.info.main,   // Em andamento
    'completed': theme.palette.success.main, // Finalizado
    'default': theme.palette.error.main      // Padrão
  };

  // Cores para tipos de serviço
  const serviceColors = {
    'Banho Completo': theme.palette.secondary.main,
    'Banho e Tosa': theme.palette.primary.main,
    'Tosa Higiênica': theme.palette.error.light,
    'Tosa Completa': theme.palette.warning.light,
    'Plano Mensal': theme.palette.info.main,
    'Banho': theme.palette.success.light,
    'Outros': theme.palette.grey[500]
  };

  const normalizeDate = (date) => {
    if (!date) return null;
    try {
      if (typeof date === 'string') return parseISO(date);
      if (date.toISOString) return new Date(date);
      return new Date(date);
    } catch (error) {
      console.error('Erro ao normalizar data:', error);
      return null;
    }
  };

  // Filtra pets com base no modo de visualização
  const filteredPets = pets.filter(pet => {
    const petDate = normalizeDate(pet.scheduleDate);
    if (!petDate) return false;
    
    switch(viewMode) {
      case 'day': return isSameDay(petDate, selectedDate);
      case 'week': return isSameWeek(petDate, selectedDate, { weekStartsOn: 1 });
      case 'month': return isSameMonth(petDate, selectedDate);
      default: return true;
    }
  });

  // Agrupa por hora (modo dia)
  const groupByTime = () => {
    const grouped = {};
    filteredPets.forEach(pet => {
      const petDate = normalizeDate(pet.scheduleDate);
      if (!petDate) return;
      
      const timeKey = format(petDate, 'HH:mm');
      if (!grouped[timeKey]) grouped[timeKey] = [];
      grouped[timeKey].push(pet);
    });
    return grouped;
  };

  // Gera dias da semana (modo semana)
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  // Gera dias do mês (modo mês)
  const getMonthDays = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  };

  const timeSchedule = groupByTime();
  const weekDays = getWeekDays();
  const monthDays = getMonthDays();

  // Navegação entre datas
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (7 * direction));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    
    setSelectedDate(newDate);
  };

  // Título da visualização atual
  const getHeaderTitle = () => {
    if (viewMode === 'day') {
      return format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: ptBR });
    } else if (viewMode === 'week') {
      const start = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd/MM', { locale: ptBR });
      const end = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: ptBR });
      return `Semana: ${start} - ${end}`;
    } else {
      return format(selectedDate, 'MMMM yyyy', { locale: ptBR });
    }
  };

  // Determina o status do pet
  const getPetStatus = (pet) => {
    if (pet.completedToday) return 'completed';
    if (pet.inService) return 'inProgress';
    return 'pending';
  };

  // Renderiza um card de pet
  const renderPetCard = (pet) => {
    const status = getPetStatus(pet);
    const statusText = {
      'pending': 'Agendado',
      'inProgress': 'Em andamento',
      'completed': 'Finalizado'
    }[status];

    return (
      <Paper 
        key={pet.id} 
        onClick={() => handlePetClick(pet)}
        sx={{ 
          p: 2, 
          flex: 1,
          minWidth: 200,
          borderLeft: `4px solid ${statusColors[status]}`,
          boxShadow: 2,
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': { 
            transform: 'translateY(-2px)',
            boxShadow: 4
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {pet.name}
          </Typography>
          <Chip
            label={statusText}
            size="small"
            sx={{ 
              backgroundColor: statusColors[status],
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {pet.owner}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
          <Chip
            label={pet.serviceType || 'Serviço'}
            size="small"
            sx={{ 
              backgroundColor: serviceColors[pet.serviceType] || serviceColors['Outros'],
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          {status === 'completed' && (
            <CheckCircleIcon sx={{ color: statusColors.completed }} />
          )}
          {status === 'inProgress' && (
            <PlayCircleOutlineIcon sx={{ color: statusColors.inProgress }} />
          )}
        </Box>
        
        {pet.observations && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            {pet.observations}
          </Typography>
        )}
      </Paper>
    );
  };

  // Visualização por dia em 4 colunas
  const renderDayView = () => (
    <Grid container spacing={2}>
      {Object.entries(timeSchedule).sort().map(([time, timePets]) => (
        <Grid item xs={12} key={time}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Box sx={{ 
              width: 100, 
              textAlign: 'center',
              pt: 1.5,
              fontWeight: 'bold',
              color: 'text.secondary',
              position: 'sticky',
              top: 0,
              backgroundColor: 'background.paper',
              zIndex: 1
            }}>
              {time}
            </Box>
            <Grid container spacing={2} sx={{ flex: 1 }}>
              {timePets.map(pet => (
                <Grid item xs={12} sm={6} md={3} key={pet.id}>
                  {renderPetCard(pet)}
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider sx={{ my: 2 }} />
        </Grid>
      ))}
    </Grid>
  );

  // Visualização por semana em 4 colunas
  const renderWeekView = () => (
    <Grid container spacing={2}>
      {weekDays.map(day => {
        const dayPets = pets.filter(pet => {
          const petDate = normalizeDate(pet.scheduleDate);
          return petDate && isSameDay(petDate, day);
        });
        
        return (
          <Grid item xs={12} key={day}>
            <Paper sx={{ 
              p: 2, 
              borderLeft: `4px solid ${isToday(day) ? statusColors.inProgress : isWeekend(day) ? theme.palette.secondary.light : theme.palette.grey[300]}`,
              backgroundColor: isToday(day) ? '#f5f5f5' : 'white'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {format(day, 'EEEE, dd/MM', { locale: ptBR })}
                </Typography>
                {isToday(day) && (
                  <Chip label="HOJE" color="primary" size="small" />
                )}
                {isWeekend(day) && (
                  <Chip label="FIM DE SEMANA" color="secondary" size="small" />
                )}
              </Box>
              <Divider sx={{ my: 1 }} />
              
              {dayPets.length > 0 ? (
                <Grid container spacing={2}>
                  {dayPets.map(pet => (
                    <Grid item xs={12} sm={6} md={3} key={pet.id}>
                      {renderPetCard(pet)}
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Nenhum serviço agendado
                </Typography>
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );

  // Visualização por mês
  const renderMonthView = () => {
    const weekDaysHeader = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
      <Box>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {weekDaysHeader.map((day, index) => (
            <Grid item xs key={index} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={1}>
          {monthDays.map(day => {
            const dayPets = pets.filter(pet => {
              const petDate = normalizeDate(pet.scheduleDate);
              return petDate && isSameDay(petDate, day);
            });
            
            return (
              <Grid item xs key={day} sx={{ minHeight: 100 }}>
                <Paper 
                  sx={{ 
                    p: 1, 
                    height: '100%',
                    border: isToday(day) ? `2px solid ${theme.palette.primary.main}` : 'none',
                    backgroundColor: isWeekend(day) ? '#F5F5F5' : 'white',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 2
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={isToday(day) ? 'bold' : 'normal'}
                      color={isToday(day) ? 'primary' : isWeekend(day) ? 'secondary' : 'text.primary'}
                    >
                      {format(day, 'd')}
                    </Typography>
                    {dayPets.length > 0 && (
                      <Badge 
                        badgeContent={dayPets.length} 
                        color="primary" 
                        sx={{ 
                          '& .MuiBadge-badge': {
                            right: -5,
                            top: -5
                          }
                        }}
                      />
                    )}
                  </Box>
                  
                  {dayPets.slice(0, 2).map(pet => {
                    const status = getPetStatus(pet);
                    return (
                      <Chip
                        key={pet.id}
                        label={`${pet.name} (${format(normalizeDate(pet.scheduleDate), 'HH:mm')})`}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePetClick(pet);
                        }}
                        sx={{
                          mt: 0.5,
                          backgroundColor: statusColors[status],
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.9
                          }
                        }}
                      />
                    );
                  })}
                  
                  {dayPets.length > 2 && (
                    <Typography variant="caption" color="text.secondary">
                      +{dayPets.length - 2} mais
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Manipuladores de eventos
  const handlePetClick = (pet) => {
    setSelectedPet(pet);
    setOpenDialog(true);
  };

  const handleStartService = () => {
    if (selectedPet) {
      startService(selectedPet.id);
      setOpenDialog(false);
    }
  };

  const handleCompleteService = () => {
    if (selectedPet) {
      completeService(selectedPet.id);
      setOpenDialog(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Agenda de Serviços
        </Typography>
        
        <Tabs 
          value={viewMode} 
          onChange={(e, newValue) => setViewMode(newValue)}
          sx={{ mb: 2 }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Dia" value="day" icon={<EventIcon />} iconPosition="start" sx={{ fontWeight: 'bold' }} />
          <Tab label="Semana" value="week" icon={<EventIcon />} iconPosition="start" sx={{ fontWeight: 'bold' }} />
          <Tab label="Mês" value="month" icon={<EventIcon />} iconPosition="start" sx={{ fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      {/* Controles de navegação */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        p: 2,
        borderRadius: 1,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <ButtonGroup variant="contained">
          <Button 
            onClick={() => navigateDate(-1)}
            sx={{ 
              backgroundColor: theme.palette.secondary.main,
              '&:hover': { backgroundColor: theme.palette.secondary.dark }
            }}
          >
            Anterior
          </Button>
          <Button 
            onClick={() => setSelectedDate(new Date())}
            sx={{ 
              backgroundColor: theme.palette.primary.dark,
              '&:hover': { backgroundColor: theme.palette.primary.light }
            }}
          >
            Hoje
          </Button>
          <Button 
            onClick={() => navigateDate(1)}
            sx={{ 
              backgroundColor: theme.palette.secondary.main,
              '&:hover': { backgroundColor: theme.palette.secondary.dark }
            }}
          >
            Próximo
          </Button>
        </ButtonGroup>
        
        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {getHeaderTitle()}
        </Typography>
      </Box>

      {/* Visualização atual */}
      {filteredPets.length === 0 && viewMode === 'day' ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            Nenhum serviço agendado para este período.
          </Typography>
        </Paper>
      ) : (
        <>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </>
      )}

      {/* Diálogo de detalhes do pet */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
          Detalhes do Serviço
        </DialogTitle>
        <DialogContent>
          {selectedPet && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: serviceColors[selectedPet.serviceType] || serviceColors['Outros'],
                  width: 56, 
                  height: 56,
                  fontSize: 24,
                  fontWeight: 'bold'
                }}>
                  {selectedPet.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{selectedPet.name}</Typography>
                  <Typography variant="body1" color="text.secondary">{selectedPet.owner}</Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Serviço:</strong> {selectedPet.serviceType}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Horário:</strong> {format(normalizeDate(selectedPet.scheduleDate), 'HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  {selectedPet.observations && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1" fontWeight="bold">Observações:</Typography>
                      <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography>{selectedPet.observations}</Typography>
                      </Paper>
                    </Box>
                  )}
                </Grid>
              </Grid>
              
              <Paper sx={{ 
                p: 2, 
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold">
                  Status: {{
                    'pending': 'AGENDADO',
                    'inProgress': 'EM ANDAMENTO',
                    'completed': 'FINALIZADO'
                  }[getPetStatus(selectedPet)]}
                </Typography>
                {selectedPet.completedToday ? (
                  <CheckCircleIcon sx={{ color: statusColors.completed, fontSize: 32 }} />
                ) : selectedPet.inService ? (
                  <PlayCircleOutlineIcon sx={{ color: statusColors.inProgress, fontSize: 32 }} />
                ) : null}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
          {!selectedPet?.inService && !selectedPet?.completedToday && (
            <Button 
              onClick={handleStartService}
              variant="contained" 
              color="primary"
              startIcon={<PlayCircleOutlineIcon />}
              sx={{ minWidth: 180 }}
            >
              Iniciar Serviço
            </Button>
          )}
          {selectedPet?.inService && !selectedPet?.completedToday && (
            <Button 
              onClick={handleCompleteService}
              variant="contained" 
              color="success"
              startIcon={<CheckCircleIcon />}
              sx={{ minWidth: 180 }}
            >
              Finalizar Serviço
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;