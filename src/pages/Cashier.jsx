const themeColors = {
    primary: '#8c109cff',
    primaryDark: '#5a0a64ff',
    secondary: '#ecc6f1ff',
    text: '#5a0a64ff',
    background: '#f9f5ff',
    success: '#4caf50',
    warning: '#ff9800'
};

import { useState, useContext, useEffect } from "react";
import { PetsContext } from "../contexts/PetsContext";
import {
    Box, Typography, Paper, TextField, Button,
    Autocomplete, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, Alert, Grid, Card, CardContent, Avatar,
    Badge, IconButton
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import PetsIcon from '@mui/icons-material/Pets';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';

const Receipt = ({ client, cart, paymentMethod, receivedValue, change }) => {
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };

    return (
        <Box className="receipt-print" sx={{
            display: 'none',
            '@media print': {
                display: 'block',
                p: 3,
                width: '80mm',
                margin: '0 auto',
                fontFamily: 'monospace',
                fontSize: '14px'
            }
        }}>
            <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
                PETSHOP RECEIPT
            </Typography>
            <Divider sx={{ my: 1 }} />

            <Box sx={{ mb: 2 }}>
                <Typography><strong>Cliente:</strong> {client?.owner || 'N/A'}</Typography>
                <Typography><strong>Telefone:</strong> {client?.phone || 'N/A'}</Typography>
                <Typography><strong>Data:</strong> {new Date().toLocaleString()}</Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ mb: 2 }}>
                {cart.map((item, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                        <Typography>
                            {item.name} - {item.usingPlan ? "Grátis (Plano)" : `R$ ${item.price.toFixed(2)}`}
                        </Typography>
                        {item.pet && (
                            <Typography variant="caption">
                                Pet: {item.pet.name}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ mb: 2 }}>
                <Typography><strong>TOTAL:</strong> R$ {calculateTotal().toFixed(2)}</Typography>
                <Typography><strong>Pagamento:</strong> {paymentMethod}</Typography>
                {paymentMethod === 'dinheiro' && (
                    <>
                        <Typography><strong>Recebido:</strong> R$ {parseFloat(receivedValue).toFixed(2)}</Typography>
                        <Typography><strong>Troco:</strong> R$ {change.toFixed(2)}</Typography>
                    </>
                )}
            </Box>

            {cart.some(item => item.isPlan) && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption">
                        <strong>Plano válido até:</strong> {new Date(
                            new Date().setMonth(new Date().getMonth() + 1)
                        ).toLocaleDateString()}
                    </Typography>
                </Box>
            )}

            <Divider sx={{ my: 1 }} />
            <Typography align="center" sx={{ mt: 2 }}>
                Obrigado pela preferência!
            </Typography>
        </Box>
    );
};

const Cashier = () => {
    const {
        pets,
        setPets,
        renewMonthlyPlan,
    } = useContext(PetsContext);
    const [schedule, setSchedule] = useState([]);

    const addToSchedule = (service) => {
        setSchedule([...schedule, service]);
    };

    const [servicePrices, setServicePrices] = useState({
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
    });

    const [serviceDescriptions, setServiceDescriptions] = useState({
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
    });

    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [discountValue, setDiscountValue] = useState(0);
    const [applyDiscount, setApplyDiscount] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedPet, setSelectedPet] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("dinheiro");
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [receivedValue, setReceivedValue] = useState("");
    const [clientPlans, setClientPlans] = useState({});
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price: 0
    });
    const [editingService, setEditingService] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    useEffect(() => {
        const plans = {};
        pets.forEach(pet => {
            if (pet.planExpiration && new Date(pet.planExpiration) > new Date()) {
                plans[pet.phone] = {
                    expiration: pet.planExpiration,
                    remaining: pet.monthlyBathsRemaining
                };
            }
        });
        setClientPlans(plans);
    }, [pets]);

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

    const filteredClients = clients.filter(client =>
        client.owner.toLowerCase().includes(searchInput.toLowerCase()) ||
        client.phone.includes(searchInput)
    );

    useEffect(() => {
        const pendingPet = JSON.parse(localStorage.getItem('pendingPetRegistration'));
        const pendingRenewal = JSON.parse(localStorage.getItem('pendingPlanRenewal'));
        const pendingSchedule = JSON.parse(localStorage.getItem('pendingServiceSchedule'));

        if (pendingPet) {
            setSearchInput(pendingPet.phone);

            const client = clients.find(c => c.phone === pendingPet.phone);
            if (client) {
                setSelectedClient(client);

                const existingPet = client.pets.find(p =>
                    p.name === pendingPet.name &&
                    p.breed === pendingPet.breed
                );

                if (existingPet) {
                    setSelectedPet(existingPet);
                }

                addToCart({
                    name: pendingPet.serviceType,
                    price: pendingPet.servicePrice,
                    description: pendingPet.serviceDescription,
                    pet: existingPet || client.pets[0]
                });
            }

            localStorage.removeItem('pendingPetRegistration');
        }

        if (pendingRenewal) {
            setSearchInput(pendingRenewal.client.phone);

            const client = clients.find(c => c.phone === pendingRenewal.client.phone);
            if (client) {
                setSelectedClient(client);
                addToCart({
                    name: "Renovação Plano Mensal",
                    price: 180,
                    description: "Renovação do plano mensal (4 banhos + 1 tosa)",
                    pet: client.pets[0]
                });
            }

            localStorage.removeItem('pendingPlanRenewal');
        }

        if (pendingSchedule && !pendingSchedule.usingPlan) {
            setSearchInput(pendingSchedule.client.phone);

            const client = clients.find(c => c.phone === pendingSchedule.client.phone);
            if (client) {
                setSelectedClient(client);

                const scheduledPet = client.pets.find(p => p.name === pendingSchedule.petName);
                if (scheduledPet) {
                    setSelectedPet(scheduledPet);
                }

                addToCart({
                    name: pendingSchedule.serviceType,
                    price: servicePrices[pendingSchedule.serviceType],
                    description: serviceDescriptions[pendingSchedule.serviceType],
                    pet: scheduledPet || client.pets[0]
                });
            }

            localStorage.removeItem('pendingServiceSchedule');
        }
    }, [clients]);

    const addToCart = (item) => {
        if (item.name === "Banho" || item.name === "Banho e Tosa") {
            const petToUse = item.pet || selectedPet || selectedClient?.pets[0];
            const hasActivePlanWithBaths = petToUse?.serviceType === "Plano Mensal" &&
                petToUse.monthlyBathsRemaining > 0 &&
                (!petToUse.planExpiration || new Date(petToUse.planExpiration) > new Date());

            if (hasActivePlanWithBaths) {
                setCart([...cart, {
                    id: Date.now(),
                    name: item.name,
                    price: 0,
                    description: item.description,
                    isPlan: false,
                    pet: petToUse,
                    usingPlan: true
                }]);
                return;
            }
        }

        if (item.name === "Renovação Plano Mensal") {
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
            name: item.name,
            price: item.price,
            description: item.description,
            isPlan: item.name.includes("Plano Mensal"),
            pet: item.pet || selectedPet || selectedClient?.pets[0],
            usingPlan: false
        }]);
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleAddNewService = () => {
        if (newService.name && newService.price > 0) {
            setServicePrices(prev => ({
                ...prev,
                [newService.name]: newService.price
            }));

            setServiceDescriptions(prev => ({
                ...prev,
                [newService.name]: newService.description
            }));

            setNewService({
                name: '',
                description: '',
                price: 0
            });
        }
    };

    const handleEditService = (serviceName) => {
        setEditingService({
            name: serviceName,
            price: servicePrices[serviceName],
            description: serviceDescriptions[serviceName],
            originalName: serviceName
        });
        setOpenEditDialog(true);
    };

    const handleSaveEditedService = () => {
        if (editingService) {
            if (editingService.originalName && editingService.originalName !== editingService.name) {
                const { [editingService.originalName]: _, ...newPrices } = servicePrices;
                const { [editingService.originalName]: __, ...newDescriptions } = serviceDescriptions;

                setServicePrices({
                    ...newPrices,
                    [editingService.name]: editingService.price
                });

                setServiceDescriptions({
                    ...newDescriptions,
                    [editingService.name]: editingService.description
                });
            } else {
                setServicePrices(prev => ({
                    ...prev,
                    [editingService.name]: editingService.price
                }));

                setServiceDescriptions(prev => ({
                    ...prev,
                    [editingService.name]: editingService.description
                }));
            }

            setOpenEditDialog(false);
            setEditingService(null);
        }
    };

    const handleDeleteService = (serviceName) => {
        setServiceToDelete(serviceName);
        setOpenDeleteDialog(true);
    };

    const confirmDeleteService = () => {
        const { [serviceToDelete]: _, ...newPrices } = servicePrices;
        const { [serviceToDelete]: __, ...newDescriptions } = serviceDescriptions;

        setServicePrices(newPrices);
        setServiceDescriptions(newDescriptions);
        setOpenDeleteDialog(false);
        setServiceToDelete(null);
    };

    const calculateTotal = () => {
        const subtotal = cart.reduce((total, item) => total + item.price, 0);
        if (applyDiscount && discountPercentage > 0) {
            return subtotal - (subtotal * (discountPercentage / 100));
        }
        return subtotal;
    };

    useEffect(() => {
        const subtotal = cart.reduce((total, item) => total + item.price, 0);
        if (applyDiscount && discountPercentage > 0) {
            setDiscountValue(subtotal * (discountPercentage / 100));
        } else {
            setDiscountValue(0);
        }
    }, [cart, applyDiscount, discountPercentage]);

    const calculateChange = () => {
        if (paymentMethod === "dinheiro" && receivedValue) {
            return parseFloat(receivedValue) - calculateTotal();
        }
        return 0;
    };

    const handlePayment = async () => {
        const isUsingPlan = cart.some(item =>
            item.usingPlan &&
            (item.name === "Banho" || item.name === "Banho e Tosa")
        );

        if (isUsingPlan) {
            cart.forEach(item => {
                if (item.usingPlan && (item.name === "Banho" || item.name === "Banho e Tosa")) {
                    setPets(prevPets => prevPets.map(pet => {
                        if (pet.id === item.pet.id) {
                            return {
                                ...pet,
                                monthlyBathsRemaining: Math.max(0, pet.monthlyBathsRemaining - 1)
                            };
                        }
                        return pet;
                    }));

                    addToSchedule({
                        client: selectedClient,
                        pet: item.pet || selectedPet || selectedClient.pets[0],
                        serviceType: item.name,
                        serviceDescription: item.description,
                        date: new Date().toISOString(),
                        status: 'pending'
                    });
                }
            });

            setOpenPaymentDialog(false);
            setCart([]);
            alert("Serviço agendado com sucesso usando o plano mensal!");
            return;
        }

        cart.forEach(item => {
            if (!item.isPlan && !["Sachês", "Ração", "Perfumes"].includes(item.name)) {
                addToSchedule({
                    client: selectedClient,
                    pet: item.pet || selectedPet || selectedClient.pets[0],
                    serviceType: item.name,
                    serviceDescription: item.description,
                    date: new Date().toISOString(),
                    status: 'pending'
                });
            }
        });

        setPaymentSuccess(true);

        const planItems = cart.filter(item => item.isPlan);
        if (planItems.length > 0 && selectedClient) {
            const isRenewal = cart.some(item => item.name === "Renovação Plano Mensal");
            const bathsToAdd = isRenewal ? 4 : 4;
            renewMonthlyPlan(selectedClient.phone, bathsToAdd);
        }

        setTimeout(() => {
            window.print();
        }, 500);

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
            ${item.name} - ${item.usingPlan ? "Grátis (Plano)" : `R$ ${item.price.toFixed(2)}`}
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

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Recibo PetShop</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            width: 80mm;
                            margin: 0 auto;
                            padding: 10px;
                            font-size: 14px;
                        }
                        .receipt-header {
                            text-align: center;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .receipt-item {
                            margin-bottom: 5px;
                        }
                        .receipt-total {
                            font-weight: bold;
                            margin-top: 10px;
                        }
                        .receipt-footer {
                            text-align: center;
                            margin-top: 15px;
                            font-style: italic;
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-header">PETSHOP RECEIPT</div>
                    <div><strong>Cliente:</strong> ${selectedClient?.owner || 'N/A'}</div>
                    <div><strong>Telefone:</strong> ${selectedClient?.phone || 'N/A'}</div>
                    <div><strong>Data:</strong> ${new Date().toLocaleString()}</div>
                    <hr>
                    ${cart.map(item => `
                        <div class="receipt-item">
                            ${item.name} - ${item.usingPlan ? "Grátis (Plano)" : `R$ ${item.price.toFixed(2)}`}
                            ${item.pet ? `<br><small>Pet: ${item.pet.name}</small>` : ''}
                        </div>
                    `).join('')}
                    <hr>
                    <div class="receipt-total">TOTAL: R$ ${calculateTotal().toFixed(2)}</div>
                    <div><strong>Pagamento:</strong> ${paymentMethod}</div>
                    ${paymentMethod === 'dinheiro' ? `
                        <div><strong>Recebido:</strong> R$ ${parseFloat(receivedValue).toFixed(2)}</div>
                        <div><strong>Troco:</strong> R$ ${calculateChange().toFixed(2)}</div>
                    ` : ''}
                    ${cart.some(item => item.isPlan) ? `
                        <div><small><strong>Plano válido até:</strong> ${new Date(
            new Date().setMonth(new Date().getMonth() + 1)
        ).toLocaleDateString()}</small></div>
                    ` : ''}
                    <div class="receipt-footer">Obrigado pela preferência!</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const hasActivePlan = (client) => {
        if (!client) return false;
        return client.pets.some(pet => {
            if (pet.planExpiration) {
                const expirationDate = new Date(pet.planExpiration);
                const today = new Date();
                return expirationDate > today;
            }
            return false;
        });
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
                        boxShadow: 2,
                        backgroundColor: 'white'
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
                            renderOption={(props, option) => {
                                const planPet = option.pets.find(p => p.serviceType === "Plano Mensal");
                                const bathsRemaining = planPet?.monthlyBathsRemaining || 0;
                                const hasActivePlan = planPet && (!planPet.planExpiration || new Date(planPet.planExpiration) > new Date());

                                return (
                                    <li {...props}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                badgeContent={
                                                    hasActivePlan ? (
                                                        <Typography variant="caption" sx={{ color: themeColors.success }}>
                                                            {bathsRemaining} banhos
                                                        </Typography>
                                                    ) : null
                                                }
                                            >
                                                <Avatar sx={{ bgcolor: themeColors.primary, mr: 2 }}>
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
                                )
                            }}
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
                                                Banhos restantes: {selectedClient.pets.find(p => p.serviceType === "Plano Mensal")?.monthlyBathsRemaining || 0}/4
                                            </Typography>
                                            <Typography variant="body2">
                                                Válido até: {new Date(selectedClient.pets.find(p => p.serviceType === "Plano Mensal")?.planExpiration).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Seção de Serviços */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{
                        p: 3,
                        height: '100%',
                        boxShadow: 2,
                        backgroundColor: 'white'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 3
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ShoppingCartIcon sx={{
                                    mr: 1,
                                    color: themeColors.primary
                                }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Serviços e Produtos
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            {Object.entries(servicePrices).map(([service, price]) => (
                                <Grid item xs={6} sm={4} key={service}>
                                    <Card
                                        variant="outlined"
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
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start'
                                            }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {service}
                                                </Typography>
                                                <Box>
                                                    {service.includes("Plano") && (
                                                        <EventIcon fontSize="small" color="warning" />
                                                    )}
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditService(service);
                                                        }}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteService(service);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" color="error" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 1,
                                                    fontSize: '0.75rem',
                                                    minHeight: '40px'
                                                }}
                                            >
                                                {serviceDescriptions[service]}
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: themeColors.primary
                                                }}
                                            >
                                                R$ {price.toFixed(2)}
                                            </Typography>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="small"
                                                onClick={() => addToCart({
                                                    name: service,
                                                    price: price,
                                                    description: serviceDescriptions[service],
                                                    pet: selectedPet || selectedClient?.pets[0]
                                                })}
                                                sx={{ mt: 1 }}
                                                disabled={!selectedClient}
                                            >
                                                Adicionar
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Adicionar Novo Serviço */}
                        <Box sx={{ mt: 3, p: 2, border: `1px dashed ${themeColors.primary}`, borderRadius: 1 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: themeColors.primary }}>
                                {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
                            </Typography>
                            <TextField
                                label="Nome do Serviço"
                                fullWidth
                                value={editingService?.name || newService.name}
                                onChange={(e) => editingService
                                    ? setEditingService({ ...editingService, name: e.target.value })
                                    : setNewService({ ...newService, name: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Descrição"
                                fullWidth
                                value={editingService?.description || newService.description}
                                onChange={(e) => editingService
                                    ? setEditingService({ ...editingService, description: e.target.value })
                                    : setNewService({ ...newService, description: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Preço"
                                type="number"
                                fullWidth
                                value={editingService?.price || newService.price}
                                onChange={(e) => editingService
                                    ? setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })
                                    : setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={editingService ? handleSaveEditedService : handleAddNewService}
                                sx={{
                                    backgroundColor: themeColors.primary,
                                    '&:hover': { backgroundColor: themeColors.primaryDark }
                                }}
                                disabled={
                                    editingService
                                        ? !editingService.name || editingService.price <= 0
                                        : !newService.name || newService.price <= 0
                                }
                            >
                                {editingService ? 'Salvar Alterações' : 'Adicionar Serviço'}
                            </Button>
                            {editingService && (
                                <Button
                                    variant="outlined"
                                    sx={{ ml: 2 }}
                                    onClick={() => {
                                        setEditingService(null);
                                        setNewService({
                                            name: '',
                                            description: '',
                                            price: 0
                                        });
                                    }}
                                >
                                    Cancelar
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Diálogo de Confirmação para Exclusão */}
                <Dialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                >
                    <DialogTitle>Confirmar Exclusão</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Tem certeza que deseja excluir o serviço "{serviceToDelete}"?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
                        <Button
                            onClick={confirmDeleteService}
                            color="error"
                            variant="contained"
                        >
                            Excluir
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Seção do Carrinho */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{
                        p: 3,
                        boxShadow: 2,
                        backgroundColor: 'white'
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
                                                            {item.usingPlan && (
                                                                <Chip label="Usando Plano" size="small" color="success" sx={{ mr: 1 }} />
                                                            )}
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                    {item.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {item.description}
                                                                </Typography>
                                                                {item.pet && (
                                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                                        Pet: {item.pet.name}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {item.usingPlan ? (
                                                            <Typography color="success.main">Grátis (Plano)</Typography>
                                                        ) : (
                                                            <Typography>R$ {item.price.toFixed(2)}</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            color="error"
                                                            size="small"
                                                            onClick={() => removeFromCart(item.id)}
                                                            startIcon={<DeleteIcon />}
                                                        >
                                                            Remover
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
                                        mb: 2
                                    }}>
                                        <Typography>Subtotal:</Typography>
                                        <Typography fontWeight="bold">
                                            R$ {cart.reduce((total, item) => total + item.price, 0).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography>Desconto:</Typography>
                                            {applyDiscount && (
                                                <Typography variant="caption" sx={{ ml: 1 }}>
                                                    ({discountPercentage}%)
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography fontWeight="bold">
                                            - R$ {discountValue.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Typography variant="h6">Total:</Typography>
                                        <Typography variant="h6" fontWeight="bold">
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
                maxWidth="md"
                sx={{
                    '& .MuiTypography-root': {
                        color: themeColors.text
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: themeColors.primary,
                    color: 'white',
                    fontWeight: 'bold'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon sx={{ mr: 1 }} />
                        Finalizar Pagamento
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    {paymentSuccess ? (
                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <CheckCircleOutlineIcon sx={{
                                fontSize: 60,
                                color: themeColors.success,
                                mb: 2
                            }} />
                            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Pagamento Concluído!
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                Obrigado pela preferência. O recibo será impresso automaticamente.
                            </Typography>

                            {/* Componente de recibo para impressão */}
                            <Receipt
                                client={selectedClient}
                                cart={cart}
                                paymentMethod={paymentMethod}
                                receivedValue={receivedValue}
                                change={calculateChange()}
                            />

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
                        <Grid container spacing={3}>
                            {/* Seção de Itens do Carrinho */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    Itens Selecionados
                                </Typography>

                                <Paper sx={{ p: 2, mb: 3 }}>
                                    <TableContainer>
                                        <Table size="small">
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
                                                                {item.usingPlan && (
                                                                    <Chip label="Usando Plano" size="small" color="success" sx={{ mr: 1 }} />
                                                                )}
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 'bold' }}>
                                                                        {item.name}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {item.description}
                                                                    </Typography>
                                                                    {item.pet && (
                                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                                            Pet: {item.pet.name}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {item.usingPlan ? (
                                                                <Typography color="success.main">Grátis (Plano)</Typography>
                                                            ) : (
                                                                <Typography sx={{ fontWeight: 'bold' }}>
                                                                    R$ {item.price.toFixed(2)}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                color="error"
                                                                size="small"
                                                                onClick={() => removeFromCart(item.id)}
                                                                startIcon={<DeleteIcon />}
                                                            >
                                                                Remover
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                        setOpenPaymentDialog(false);
                                        setSearchInput(selectedClient?.phone || "");
                                    }}
                                    sx={{ mb: 2 }}
                                >
                                    Adicionar Mais Itens
                                </Button>
                            </Grid>

                            {/* Seção de Forma de Pagamento */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    Resumo do Pedido
                                </Typography>

                                <Paper sx={{ p: 2, mb: 3 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 2
                                    }}>
                                        <Typography>Subtotal:</Typography>
                                        <Typography fontWeight="bold">
                                            R$ {cart.reduce((total, item) => total + item.price, 0).toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography>Desconto:</Typography>
                                            {applyDiscount && (
                                                <Typography variant="caption" sx={{ ml: 1 }}>
                                                    ({discountPercentage}%)
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography fontWeight="bold">
                                            - R$ {discountValue.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 2
                                    }}>
                                        <Typography variant="h6">Total:</Typography>
                                        <Typography variant="h6" fontWeight="bold">
                                            R$ {calculateTotal().toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Paper>

                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    Forma de Pagamento
                                </Typography>

                                <Paper sx={{ p: 2 }}>
                                    <TextField
                                        select
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
                                                    <Typography>
                                                        Troco: R$ {calculateChange().toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </Paper>

                                {/* Seção de Desconto */}
                                <Box sx={{ mt: 2, p: 2, border: `1px dashed ${themeColors.primary}`, borderRadius: 1 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                                        Aplicar Desconto
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <TextField
                                            label="Porcentagem de Desconto"
                                            type="number"
                                            value={discountPercentage}
                                            onChange={(e) => {
                                                const value = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                                setDiscountPercentage(value);
                                            }}
                                            disabled={!selectedClient}
                                            sx={{ width: 120 }}
                                            InputProps={{
                                                endAdornment: <Typography>%</Typography>,
                                            }}
                                        />
                                        <Button
                                            variant={applyDiscount ? "contained" : "outlined"}
                                            onClick={() => setApplyDiscount(!applyDiscount)}
                                            disabled={!discountPercentage || !selectedClient}
                                        >
                                            {applyDiscount ? "Remover" : "Aplicar"}
                                        </Button>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>

                {!paymentSuccess && (
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setOpenPaymentDialog(false)}
                            variant="outlined"
                            sx={{
                                color: themeColors.primary,
                                borderColor: themeColors.primary
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handlePayment}
                            variant="contained"
                            sx={{
                                backgroundColor: themeColors.primary,
                                '&:hover': {
                                    backgroundColor: themeColors.primaryDark
                                }
                            }}
                            disabled={
                                (paymentMethod === "dinheiro" &&
                                    (!receivedValue || parseFloat(receivedValue) < calculateTotal()))
                            }
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