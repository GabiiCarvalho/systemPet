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
  isToday, isWeekend, addMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EventIcon from '@mui/icons-material/Event';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Calendar = () => {
  const { pets, startService, completeService, updatePetSchedule } = useContext(PetsContext);
  const [viewMode, setViewMode] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPet, setSelectedPet] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const theme = useTheme();

  // Cores para status
  const statusColors = {
    'pending': '#ff9900ff',    // Agendado
    'inProgress': '#29cf98ff', // Em andamento
    'completed': '#439104ff',  // Finalizado
    'default': '#ff0055ff'     // Padrão
  };

  // Cores para tipos de serviço
  const serviceColors = {
    'Banho Completo': '#FF2D75',
    'Banho e Tosa': '#00F0FF',
    'Tosa Higiênica': '#e73434ff',
    'Tosa Completa': '#ffd700ff',
    'Plano Mensal': '#4671ffff',
    'Banho': '#8e24aa',
    'Outros': '#8fe99bff'
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

    switch (viewMode) {
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
  const renderPetCard = (pet, index) => {
    const status = getPetStatus(pet);
    const statusText = {
      'pending': 'Agendado',
      'inProgress': 'Em andamento',
      'completed': 'Finalizado'
    }[status];

    return (
      <Draggable key={pet.id} draggableId={pet.id} index={index}>
        {(provided) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => handlePetClick(pet)}
            sx={{
              p: 2,
              mb: 2,
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
        )}
      </Draggable>
    );
  };

  // Visualização por dia
  const renderDayView = () => {
    const dayPets = filteredPets.sort((a, b) => {
      const dateA = normalizeDate(a.scheduleDate);
      const dateB = normalizeDate(b.scheduleDate);
      return dateA - dateB;
    });

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
        </Typography>
        
        {dayPets.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="day-view">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {dayPets.map((pet, index) => renderPetCard(pet, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Nenhum serviço agendado para este dia.
          </Typography>
        )}
      </Box>
    );
  };

  // Visualização por semana
  const renderWeekView = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {getHeaderTitle()}
        </Typography>
        
        <Grid container spacing={2}>
          {weekDays.map(day => {
            const dayPets = pets.filter(pet => {
              const petDate = normalizeDate(pet.scheduleDate);
              return petDate && isSameDay(petDate, day);
            }).sort((a, b) => {
              const dateA = normalizeDate(a.scheduleDate);
              const dateB = normalizeDate(b.scheduleDate);
              return dateA - dateB;
            });

            return (
              <Grid item xs={12} sm={6} md={4} key={day}>
                <Paper sx={{ 
                  p: 2,
                  borderLeft: `4px solid ${isToday(day) ? statusColors.inProgress : isWeekend(day) ? theme.palette.secondary.light : theme.palette.grey[300]}`,
                  backgroundColor: isToday(day) ? '#f5f5f5' : 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {format(day, 'EEEE, dd/MM', { locale: ptBR })}
                    </Typography>
                    {isToday(day) && (
                      <Chip label="HOJE" color="primary" size="small" />
                    )}
                    {isWeekend(day) && (
                      <Chip label="FIM DE SEMANA" color="secondary" size="small" />
                    )}
                  </Box>
                  
                  {dayPets.length > 0 ? (
                    <DragDropContext onDragEnd={(result) => handleDragEnd(result, day)}>
                      <Droppable droppableId={`week-day-${format(day, 'yyyy-MM-dd')}`}>
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef}>
                            {dayPets.map((pet, index) => renderPetCard(pet, index))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
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
      </Box>
    );
  };

  // Visualização por mês com arrastar e soltar
  const renderMonthView = () => {
    const weekDaysHeader = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const firstDayOfMonth = startOfMonth(selectedDate);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = eachDayOfInterval({
      start: firstDayOfMonth,
      end: endOfMonth(selectedDate)
    });

    const emptyStartDays = Array(startDayOfWeek).fill(null);
    const calendarDays = [...emptyStartDays, ...daysInMonth];
    const weeks = [];
    
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    const handleDragEndMonth = (result) => {
      if (!result.destination) return;

      const petId = result.draggableId;
      const sourceDay = result.source.droppableId.replace('month-day-', '');
      const destinationDay = result.destination.droppableId.replace('month-day-', '');

      if (sourceDay === destinationDay) return;

      const pet = pets.find(p => p.id === petId);
      if (!pet) return;

      const newDate = new Date(destinationDay);
      updatePetSchedule(petId, newDate);
    };

    return (
      <DragDropContext onDragEnd={handleDragEndMonth}>
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            {getHeaderTitle()}
          </Typography>
          
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {weekDaysHeader.map((day, index) => (
              <Grid item xs key={index} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" fontWeight="bold">
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {weeks.map((week, weekIndex) => (
            <Grid container spacing={1} key={weekIndex} sx={{ mb: 1 }}>
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <Grid item xs key={`empty-${dayIndex}`} sx={{ minHeight: 120 }}>
                      <Paper sx={{ 
                        height: '100%', 
                        backgroundColor: 'transparent', 
                        boxShadow: 'none',
                        border: `1px dashed ${theme.palette.grey[300]}`
                      }} />
                    </Grid>
                  );
                }
                
                const dayPets = pets.filter(pet => {
                  const petDate = normalizeDate(pet.scheduleDate);
                  return petDate && isSameDay(petDate, day);
                }).sort((a, b) => {
                  const dateA = normalizeDate(a.scheduleDate);
                  const dateB = normalizeDate(b.scheduleDate);
                  return dateA - dateB;
                });
                
                return (
                  <Grid item xs key={day} sx={{ minHeight: 120 }}>
                    <Droppable droppableId={`month-day-${format(day, 'yyyy-MM-dd')}`}>
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{ 
                            p: 1,
                            height: '100%',
                            border: isToday(day) ? `2px solid ${theme.palette.primary.main}` : 'none',
                            backgroundColor: isWeekend(day) ? '#F5F5F5' : 'white',
                            position: 'relative'
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
                          
                          <Box sx={{ 
                            maxHeight: 90, 
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                              width: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: theme.palette.grey[400],
                              borderRadius: '2px',
                            }
                          }}>
                            {dayPets.map((pet, index) => (
                              <Draggable key={pet.id} draggableId={pet.id} index={index}>
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => handlePetClick(pet)}
                                    sx={{
                                      mt: 0.5,
                                      p: 0.5,
                                      backgroundColor: statusColors[getPetStatus(pet)],
                                      color: 'white',
                                      borderRadius: 1,
                                      cursor: 'pointer',
                                      '&:hover': {
                                        opacity: 0.9
                                      }
                                    }}
                                  >
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                      {pet.name} ({format(normalizeDate(pet.scheduleDate), 'HH:mm')})
                                    </Typography>
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        </Paper>
                      )}
                    </Droppable>
                  </Grid>
                );
              })}
            </Grid>
          ))}
        </Box>
      </DragDropContext>
    );
  };

  // Manipulador de arrastar e soltar
  const handleDragEnd = (result, day) => {
    if (!result.destination) return;

    const petId = result.draggableId;
    const destinationDay = day || selectedDate;
    
    // Atualiza a data do pet
    updatePetSchedule(petId, destinationDay);
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