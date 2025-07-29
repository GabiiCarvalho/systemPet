import { useState, useContext, useEffect } from "react";
import { PetsContext } from "../contexts/PetsContext";
import {
    Box, Typography, Paper, TextField, Button,
    Autocomplete, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, Alert, Grid, Card, CardContent, Avatar,
    Badge
} from "@mui/material";
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import PetsIcon from '@mui/icons-material/Pets';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventIcon from '@mui/icons-material/Event';
import MenuItem from '@mui/material/MenuItem';

// Cores temáticas
const themeColors = {
    primary: '#4a6baf',
    secondary: '#f5f7fa',
    success: '#4caf50',
    warning: '#ff9800',
    background: '#f0f2f5'
};

const servicePrices = {
    "Banho": 60,
    "Banho e Tosa": 80,
    "Tosa Higiênica": 75,
    "Tosa Completa": 90,
    "Plano Mensal": 180,
    "Renovação Plano Mensal": 180,
    "Aparar as unhas": 25,
    "Escovar os dentes": 25,
    "Hidratação de pelos": 45,
    "Matização de pelos claros": 50,
    "Sachês": 12,
    "Ração": 22,
    "Perfumes": 35
};

const serviceDescriptions = {
    "Banho": "Banho completo com produtos de qualidade",
    "Banho e Tosa": "Banho completo + tosa higiênica",
    "Tosa Higiênica": "Tosa nas áreas íntimas, patas e rosto",
    "Tosa Completa": "Tosa completa no corpo todo",
    "Plano Mensal": "4 banhos e 1 tosa higiênica por mês",
    "Renovação Plano Mensal": "Renovação do plano mensal (4 banhos + 1 tosa)",
    "Aparar as unhas": "Corte e lixamento das unhas",
    "Escovar os dentes": "Escovação dentária com produtos específicos",
    "Hidratação de pelos": "Hidratação profunda para pelos",
    "Matização de pelos claros": "Tratamento para pelos claros",
    "Sachês": "Alimentação em sachê",
    "Ração": "Ração premium para pets",
    "Perfumes": "Perfume específico para pets"
};

const Cashier = () => {
    const { pets, updatePetPlan } = useContext(PetsContext);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedPet, setSelectedPet] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("dinheiro");
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [receivedValue, setReceivedValue] = useState("");
    const [clientPlans, setClientPlans] = useState({});

    // Carrega os planos dos clientes ao iniciar
    useEffect(() => {
        const plans = {};
        pets.forEach(pet => {
            if (pet.planExpiration && new Date(pet.planExpiration) > new Date()) {
                plans[pet.phone] = {
                    expiration: pet.planExpiration,
                    remaining: pet.remainingServices
                };
            }
        });
        setClientPlans(plans);
    }, [pets]);

    // Agrupar clientes por telefone
    const clients = pets.reduce((acc, pet) => {
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

    // Filtrar clientes para busca
    const filteredClients = clients.filter(client =>
        client.owner.toLowerCase().includes(searchInput.toLowerCase()) ||
        client.phone.includes(searchInput)
    );

    const addToCart = (service) => {
        // Verifica se é renovação de plano e se o cliente tem plano ativo
        if (service === "Renovação Plano Mensal") {
            const hasActivePlan = selectedClient?.pets.some(pet => {
                if (!pet.planExpiration) return false;

                const expirationDate = new Date(pet.planExpiration);
                const today = new Date();
                return expirationDate > today;
            });

            if (!hasActivePlan) {
                alert("Este cliente não tem um plano ativo para renovar!");
                return;
            }
        }

        setCart([...cart, {
            id: Date.now(),
            name: service,
            price: servicePrices[service],
            description: serviceDescriptions[service],
            isPlan: service.includes("Plano Mensal")
        }]);
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };

    const calculateChange = () => {
        if (paymentMethod === "dinheiro" && receivedValue) {
            return parseFloat(receivedValue) - calculateTotal();
        }
        return 0;
    };

    const handlePayment = async () => {
        // Processar pagamento
        setPaymentSuccess(true);

        // Atualizar planos se houver compra/renovação de plano
        const planItems = cart.filter(item => item.isPlan);

        if (planItems.length > 0 && selectedClient) {
            const expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + 1);

            // Atualiza todos os pets do cliente
            for (const pet of selectedClient.pets) {
                const currentRemaining = pet.remainingServices || 0;
                const newRemaining = cart.some(item => item.name === "Renovação Plano Mensal")
                    ? currentRemaining + 4
                    : 4;
                await updatePetPlan(pet.id, {
                    planExpiration: expirationDate.toISOString(),
                    remainingServices: newRemaining
                });
            }

            // Atualiza o estado local
            setClientPlans(prev => ({
                ...prev,
                [selectedClient.phone]: {
                    expiration: expirationDate.toISOString(),
                    remaining: cart.some(item => item.name === "Renovação Plano Mensal")
                        ? (clientPlans[selectedClient.phone]?.remaining || 0) + 4 : 4
                }
            }));
        }

        setTimeout(() => {
            setOpenPaymentDialog(false);
            setPaymentSuccess(false);
            setCart([]);
            setReceivedValue("");
        }, 2000);
    };

    const printReceipt = () => {
        const receiptContent = `
      =========================
      PETSHOP RECEIPT
      =========================
      Cliente: ${selectedClient?.owner || 'N/A'}
      Telefone: ${selectedClient?.phone || 'N/A'}
      Data: ${new Date().toLocaleString()}
      -------------------------
      ${cart.map(item => `
      ${item.name} - R$ ${item.price.toFixed(2)}
      ${item.description}
      `).join('')}
      -------------------------
      TOTAL: R$ ${calculateTotal().toFixed(2)}
      Pagamento: ${paymentMethod}
      ${paymentMethod === 'dinheiro' ? `
      Recebido: R$ ${parseFloat(receivedValue).toFixed(2)}
      Troco: R$ ${calculateChange().toFixed(2)}
      ` : ''}
      ${cart.some(item => item.isPlan) ? `
      -------------------------
      Plano válido até: ${new Date(
            new Date().setMonth(new Date().getMonth() + 1)
        ).toLocaleDateString()}
      ` : ''}
      =========================
      Obrigado pela preferência!
    `;

        alert("Recibo impresso com sucesso!\n\n" + receiptContent);
    };

    // Verifica se o cliente tem plano ativo
    const hasActivePlan = (client) => {
        return clientPlans[client.phone] &&
            new Date(clientPlans[client.phone].expiration) > new Date();
    };

    return (
        <Box sx={{
            p: 3,
            backgroundColor: themeColors.background,
            minHeight: '100vh'
        }}>
            {/* Cabeçalho */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
                backgroundColor: 'white',
                p: 2,
                borderRadius: 2,
                boxShadow: 1
            }}>
                <PointOfSaleIcon sx={{
                    fontSize: 40,
                    color: themeColors.primary,
                    mr: 2
                }} />
                <Typography variant="h4" sx={{
                    fontWeight: 'bold',
                    color: themeColors.primary
                }}>
                    Sistema de Caixa
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Seção do Cliente */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{
                        p: 3,
                        height: '100%',
                        boxShadow: 2
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 3
                        }}>
                            <PeopleIcon sx={{
                                mr: 1,
                                color: themeColors.primary
                            }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Selecionar Cliente
                            </Typography>
                        </Box>

                        <Autocomplete
                            options={filteredClients}
                            getOptionLabel={(option) => `${option.owner} (${option.phone})`}
                            inputValue={searchInput}
                            onInputChange={(e, newValue) => setSearchInput(newValue)}
                            onChange={(e, newValue) => {
                                setSelectedClient(newValue);
                                setSelectedPet(null);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Buscar cliente por nome ou telefone"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                hasActivePlan(option) ? (
                                                    <EventIcon sx={{
                                                        fontSize: 16,
                                                        color: themeColors.success
                                                    }} />
                                                ) : null
                                            }
                                        >
                                            <Avatar sx={{
                                                bgcolor: themeColors.primary,
                                                mr: 2,
                                                width: 32,
                                                height: 32
                                            }}>
                                                {option.owner.charAt(0)}
                                            </Avatar>
                                        </Badge>
                                        <Box>
                                            <Typography>{option.owner}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {option.phone} • {option.pets.length} pet(s)
                                            </Typography>
                                        </Box>
                                    </Box>
                                </li>
                            )}
                        />

                        {selectedClient && (
                            <Box sx={{
                                mt: 3,
                                p: 2,
                                backgroundColor: themeColors.secondary,
                                borderRadius: 1
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {selectedClient.owner}
                                    </Typography>
                                    {hasActivePlan(selectedClient) && (
                                        <Chip
                                            label="Plano Ativo"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {selectedClient.phone}
                                </Typography>

                                <Divider sx={{ my: 1 }} />

                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Pets:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedClient.pets.map(pet => (
                                        <Chip
                                            key={pet.id}
                                            label={`${pet.name} (${pet.breed})`}
                                            variant={selectedPet?.id === pet.id ? "filled" : "outlined"}
                                            color={selectedPet?.id === pet.id ? "primary" : "default"}
                                            size="small"
                                            icon={<PetsIcon fontSize="small" />}
                                            onClick={() => setSelectedPet(pet)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </Box>

                                {hasActivePlan(selectedClient) && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                Plano Mensal
                                            </Typography>
                                            <Typography variant="body2">
                                                Banhos restantes: {clientPlans[selectedClient.phone]?.remaining || 0}/4
                                            </Typography>
                                            <Typography variant="body2">
                                                Válido até: {new Date(clientPlans[selectedClient.phone]?.expiration).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Seção de Produtos/Serviços */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{
                        p: 3,
                        height: '100%',
                        boxShadow: 2
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 3
                        }}>
                            <ShoppingCartIcon sx={{
                                mr: 1,
                                color: themeColors.primary
                            }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Serviços e Produtos
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {Object.entries(servicePrices).map(([service, price]) => (
                                <Grid item xs={6} sm={4} key={service}>
                                    <Card
                                        variant="outlined"
                                        onClick={() => addToCart(service)}
                                        sx={{
                                            cursor: 'pointer',
                                            transition: '0.3s',
                                            borderColor: service.includes("Plano") ? themeColors.warning : undefined,
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: 2,
                                                borderColor: themeColors.primary
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {service}
                                                </Typography>
                                                {service.includes("Plano") && (
                                                    <EventIcon fontSize="small" color="warning" />
                                                )}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{
                                                mb: 1,
                                                fontSize: '0.75rem',
                                                minHeight: '40px'
                                            }}>
                                                {serviceDescriptions[service]}
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                fontWeight: 'bold',
                                                color: themeColors.primary
                                            }}>
                                                R$ {price.toFixed(2)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Seção do Carrinho */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{
                        p: 3,
                        boxShadow: 2
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 3
                        }}>
                            <ShoppingCartIcon sx={{
                                mr: 1,
                                color: themeColors.primary
                            }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Carrinho
                            </Typography>
                        </Box>

                        {cart.length > 0 ? (
                            <>
                                <TableContainer sx={{ maxHeight: 300 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Preço</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Ação</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {cart.map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {item.isPlan && (
                                                                <EventIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                                                            )}
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                    {item.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {item.description}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        R$ {item.price.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            color="error"
                                                            size="small"
                                                            onClick={() => removeFromCart(item.id)}
                                                            sx={{ minWidth: 0 }}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{
                                    p: 2,
                                    backgroundColor: themeColors.secondary,
                                    borderRadius: 1,
                                    mb: 2
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 1
                                    }}>
                                        <Typography variant="body1">Subtotal:</Typography>
                                        <Typography variant="body1">
                                            R$ {calculateTotal().toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 1
                                    }}>
                                        <Typography variant="body1">Descontos:</Typography>
                                        <Typography variant="body1">R$ 0.00</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Typography variant="h6">Total:</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            R$ {calculateTotal().toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AttachMoneyIcon />}
                                    onClick={() => setOpenPaymentDialog(true)}
                                    disabled={!selectedClient}
                                    sx={{ mb: 1 }}
                                >
                                    Finalizar Venda
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<LocalPrintshopIcon />}
                                    onClick={printReceipt}
                                    disabled={cart.length === 0}
                                >
                                    Imprimir Recibo
                                </Button>
                            </>
                        ) : (
                            <Box sx={{
                                textAlign: 'center',
                                p: 4,
                                backgroundColor: themeColors.secondary,
                                borderRadius: 1
                            }}>
                                <ShoppingCartIcon sx={{
                                    fontSize: 40,
                                    color: 'text.disabled',
                                    mb: 1
                                }} />
                                <Typography variant="body1" color="text.secondary">
                                    Carrinho vazio
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Adicione itens ao carrinho
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Diálogo de Pagamento */}
            <Dialog
                open={openPaymentDialog}
                onClose={() => setOpenPaymentDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{
                    backgroundColor: themeColors.primary,
                    color: 'white'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon sx={{ mr: 1 }} />
                        Finalizar Pagamento
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {paymentSuccess ? (
                        <Box sx={{
                            textAlign: 'center',
                            p: 4
                        }}>
                            <CheckCircleOutlineIcon sx={{
                                fontSize: 60,
                                color: themeColors.success,
                                mb: 2
                            }} />
                            <Typography variant="h5" sx={{ mb: 1 }}>
                                Pagamento Concluído!
                            </Typography>
                            <Typography variant="body1">
                                Obrigado pela preferência.
                            </Typography>
                            {cart.some(item => item.isPlan) && (
                                <Box sx={{
                                    mt: 3,
                                    p: 2,
                                    backgroundColor: themeColors.secondary,
                                    borderRadius: 1
                                }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        Plano Mensal Ativado
                                    </Typography>
                                    <Typography variant="body2">
                                        Válido até: {new Date(
                                            new Date().setMonth(new Date().getMonth() + 1)
                                        ).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <>
                            <Box sx={{
                                backgroundColor: themeColors.secondary,
                                p: 2,
                                borderRadius: 1,
                                mb: 3
                            }}>
                                <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                                    Total: R$ {calculateTotal().toFixed(2)}
                                </Typography>
                            </Box>

                            <TextField
                                select
                                label="Método de Pagamento"
                                fullWidth
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                sx={{ mb: 3 }}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="dinheiro">Dinheiro</MenuItem>
                                <MenuItem value="pix">PIX</MenuItem>
                                <MenuItem value="cartao-debito">Cartão de Débito</MenuItem>
                                <MenuItem value="cartao-credito">Cartão de Crédito</MenuItem>
                            </TextField>

                            {paymentMethod === "dinheiro" && (
                                <>
                                    <TextField
                                        label="Valor Recebido"
                                        type="number"
                                        fullWidth
                                        value={receivedValue}
                                        onChange={(e) => setReceivedValue(e.target.value)}
                                        sx={{ mb: 2 }}
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                                        }}
                                    />
                                    {receivedValue && parseFloat(receivedValue) > 0 && (
                                        <Box sx={{
                                            backgroundColor: themeColors.secondary,
                                            p: 1.5,
                                            borderRadius: 1,
                                            mb: 2
                                        }}>
                                            <Typography variant="body1">
                                                Troco: R$ {calculateChange().toFixed(2)}
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </DialogContent>
                {!paymentSuccess && (
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setOpenPaymentDialog(false)}
                            variant="outlined"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handlePayment}
                            variant="contained"
                            color="primary"
                            disabled={
                                (paymentMethod === "dinheiro" &&
                                    (!receivedValue || parseFloat(receivedValue) < calculateTotal()))
                            }
                            sx={{ ml: 2 }}
                        >
                            Confirmar Pagamento
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
        </Box>
    );
};

export default Cashier;