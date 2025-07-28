import { useState, useContext, useMemo } from "react";
import { PetsContext } from "../contexts/PetsContext";
import {
  Box, Typography, Paper, Chip,
  Tabs, Tab, Button, ButtonGroup,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, useTheme, TextField, MenuItem
} from "@mui/material";
import { Grid } from '@mui/material'; // Importação atualizada do Grid
import {
  format, isSameDay, isSameWeek, isSameMonth,
  parseISO, eachDayOfInterval, startOfWeek,
  endOfWeek, startOfMonth, endOfMonth, addDays,
  isToday, isWeekend, addMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Calendar = () => {
  const { pets, startService, completeService, updatePetSchedule } = useContext(PetsContext);
  const [viewMode, setViewMode] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPet, setSelectedPet] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editDate, setEditDate] = useState(new Date());
  const [editTime, setEditTime] = useState(new Date());
  const theme = useTheme();

  // Cores para status
  const statusColors = {
    'pending': '#ff9900ff',
    'inProgress': '#29cf98ff',
    'completed': '#439104ff',
    'default': '#ff0055ff'
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

  const serviceTypes = [
    'Banho Completo',
    'Banho e Tosa',
    'Tosa Higiênica',
    'Tosa Completa',
    'Plano Mensal',
    'Banho',
    'Outros'
  ];

  const normalizeDate = (date) => {
    if (!date) return null;
    try {
      if (date instanceof Date) return new Date(date);
      if (typeof date === 'string') {
        const isoString = date.endsWith('Z') ? date : `${date}Z`;
        return parseISO(isoString);
      }
      if (typeof date === 'number') return new Date(date);
      return new Date(date);
    } catch (error) {
      console.error('Erro ao normalizar data:', error, date);
      return null;
    }
  };

  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      const petDate = normalizeDate(pet.scheduleDate);
      if (!petDate) return false;

      switch (viewMode) {
        case 'day': return isSameDay(petDate, selectedDate);
        case 'week': return isSameWeek(petDate, selectedDate, { weekStartsOn: 1 });
        case 'month': return isSameMonth(petDate, selectedDate);
        default: return true;
      }
    });
  }, [pets, viewMode, selectedDate]);

  const getPetStatus = (pet) => {
    if (pet.completedToday) return 'completed';
    if (pet.inService) return 'inProgress';
    return 'pending';
  };

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

  const renderPetCard = (pet, index) => {
    const status = getPetStatus(pet);
    const statusText = {
      'pending': 'Agendado',
      'inProgress': 'Em andamento',
      'completed': 'Finalizado'
    }[status];

    return (
      <Draggable key={pet.id.toString()} draggableId={pet.id.toString()} index={index}>
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

  const renderDayView = () => {
    const dayPets = [...filteredPets].sort((a, b) => {
      const dateA = normalizeDate(a.scheduleDate);
      const dateB = normalizeDate(b.scheduleDate);
      return dateA - dateB;
    });

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
        </Typography>

        <Droppable droppableId="day-view">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {dayPets.length > 0 ? (
                dayPets.map((pet, index) => renderPetCard(pet, index))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Nenhum serviço agendado para este dia.
                </Typography>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Box>
    );
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();

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
              <Grid key={day.toString()} xs={12} sm={6} md={4}>
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

                  <Droppable droppableId={`week-day-${format(day, 'yyyy-MM-dd')}`}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {dayPets.length > 0 ? (
                          dayPets.map((pet, index) => renderPetCard(pet, index))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Nenhum serviço agendado
                          </Typography>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderMonthView = () => {
    const weekDaysHeader = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const firstDayOfMonth = startOfMonth(selectedDate);
    const lastDayOfMonth = endOfMonth(selectedDate);

    const weeks = [];
    let currentDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });

    for (let i = 0; i < 4; i++) {
      const week = eachDayOfInterval({
        start: currentDate,
        end: endOfWeek(currentDate, { weekStartsOn: 0 })
      });
      weeks.push(week);
      currentDate = addDays(currentDate, 7);
    }

    return (
      <Box sx={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {weekDaysHeader.map((day, index) => (
            <Grid key={index} xs={1} sx={{ textAlign: 'center', padding: '8px 0', margin: 'auto' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {weeks.map((week, weekIndex) => (
          <Grid container spacing={1} key={weekIndex} sx={{ mb: 2 }}>
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, selectedDate);
              const dayNumber = format(day, 'd');
              const dayPets = pets.filter(pet => {
                const petDate = normalizeDate(pet.scheduleDate);
                return petDate && isSameDay(petDate, day);
              }).sort((a, b) => {
                const dateA = normalizeDate(a.scheduleDate);
                const dateB = normalizeDate(b.scheduleDate);
                return dateA - dateB;
              });

              return (
                <Grid key={day.toString()} xs={1} sx={{
                  height: '150px',
                  minWidth: 'calc(92%/7)',
                  position: 'relative',
                  marginBottom: '15px'
                }}>
                  <Droppable droppableId={`month-day-${format(day, 'yyyy-MM-dd')}`}>
                    {(provided) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          p: 1,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: isToday(day) ? `2px solid ${theme.palette.primary.main}` : 'none',
                          backgroundColor: isWeekend(day) ? '#F5F5F5' : 'white',
                          opacity: isCurrentMonth ? 1 : 0.6,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: 3
                          }
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: isToday(day) ? 'bold' : 'normal',
                            color: isToday(day) ? 'primary.main' : 'text.primary',
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            mb: 1
                          }}
                        >
                          {dayNumber}
                        </Typography>

                        <Box sx={{
                          flex: 1,
                          overflowY: 'auto',
                          '&::-webkit-scrollbar': {
                            width: '6px',
                            borderRadius: '4px'
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.grey[400],
                            borderRadius: '4px',
                          }
                        }}>
                          {dayPets.map((pet, index) => (
                            <Draggable
                              key={pet.id.toString()}
                              draggableId={pet.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => handlePetClick(pet)}
                                  sx={{
                                    mt: 0.5,
                                    p: 1,
                                    backgroundColor: statusColors[getPetStatus(pet)],
                                    color: 'white',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      opacity: 0.9,
                                      transform: 'translateX(2px)'
                                    }
                                  }}
                                >
                                  <Typography variant="caption" sx={{
                                    fontSize: '0.75rem',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {pet.name} ({format(normalizeDate(pet.scheduleDate), 'HH:mm')})
                                  </Typography>
                                  <Typography variant="caption" sx={{
                                    fontSize: '0.65rem',
                                    display: 'block',
                                    opacity: 0.8
                                  }}>
                                    {pet.serviceType}
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
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const petId = result.draggableId;
    const pet = pets.find(p => p.id.toString() === petId);

    if (!pet) return;

    let newDate;
    const originalDate = normalizeDate(pet.scheduleDate);

    if (result.destination.droppableId.startsWith('month-day-')) {
      const dateStr = result.destination.droppableId.replace('month-day-', '');
      newDate = parseISO(dateStr);
    } else if (result.destination.droppableId.startsWith('week-day-')) {
      const dateStr = result.destination.droppableId.replace('week-day-', '');
      newDate = parseISO(dateStr);
    } else {
      newDate = new Date(selectedDate);
    }

    const updatedDate = new Date(newDate);
    updatedDate.setHours(originalDate.getHours());
    updatedDate.setMinutes(originalDate.getMinutes());

    updatePetSchedule(pet.id, updatedDate);
    setSelectedDate(new Date(updatedDate));
  };

  const handlePetClick = (pet) => {
    setSelectedPet(pet);
    setOpenDialog(true);
  };

  const handleEditClick = (pet) => {
    const petDate = normalizeDate(pet.scheduleDate);
    setEditDate(petDate);
    setEditTime(petDate);
    setSelectedPet(pet);
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPet) return;

    const newDate = new Date(editDate);
    newDate.setHours(editTime.getHours());
    newDate.setMinutes(editTime.getMinutes());

    updatePetSchedule(selectedPet.id, newDate);
    setOpenEditDialog(false);
    setOpenDialog(false);

    if (viewMode === 'day') {
      setSelectedDate(newDate);
    }
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ p: 3 }}>
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
                    <Grid xs={6}>
                      <Typography variant="body1">
                        <strong>Serviço:</strong> {selectedPet.serviceType}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="body1">
                        <strong>Horário:</strong> {format(normalizeDate(selectedPet.scheduleDate), 'HH:mm')}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="body1">
                        <strong>Data:</strong> {format(normalizeDate(selectedPet.scheduleDate), 'dd/MM/yyyy')}
                      </Typography>
                    </Grid>
                    <Grid xs={12}>
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
              <Button
                onClick={() => handleEditClick(selectedPet)}
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                Editar
              </Button>
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

          <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
              Editar Agendamento
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
                    <Grid xs={12} sm={6}>
                      <DatePicker
                        label="Data do Serviço"
                        value={editDate}
                        onChange={(newValue) => setEditDate(newValue)}
                        format="dd/MM/yyyy"
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <TimePicker
                        label="Horário"
                        value={editTime}
                        onChange={(newValue) => setEditTime(newValue)}
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <TextField
                        select
                        label="Tipo de Serviço"
                        value={selectedPet.serviceType}
                        onChange={(e) => setSelectedPet({ ...selectedPet, serviceType: e.target.value })}
                        fullWidth
                      >
                        {serviceTypes.map((service) => (
                          <MenuItem key={service} value={service}>
                            {service}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid xs={12}>
                      <TextField
                        label="Observações"
                        multiline
                        rows={3}
                        value={selectedPet.observations || ''}
                        onChange={(e) => setSelectedPet({ ...selectedPet, observations: e.target.value })}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
              <Button
                onClick={handleSaveEdit}
                variant="contained"
                color="primary"
              >
                Salvar Alterações
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DragDropContext>
    </LocalizationProvider>
  );
};

export default Calendar;