import { createContext, useState } from "react";

export const PetsContext = createContext();

export const PetsProvider = ({ children }) => {
    const [pets, setPets] = useState([
        {
            id: 1,
            name: "Rex",
            owner: "João Silva",
            breed: "Golden Retriever",
            phone: "+5511999999999",
            inService: false,  // Alterado para false para demonstrar a funcionalidade
            serviceProgress: 0,
            completedToday: false,
            serviceType: "Banho Completo",
            observations: "Cuidado com as orelhas",
            scheduleDate: new Date(),
            scheduleEndDate: new Date(new Date().setHours(new Date().getHours() + 2))
        },
        {
            id: 2,
            name: "Luna",
            owner: "Maria Souza",
            breed: "Poodle",
            phone: "+5511888888888",
            inService: false,  // Alterado para false para demonstrar a funcionalidade
            serviceProgress: 0,
            completedToday: false,
            serviceType: "Tosa Higiênica",
            observations: "Gosta de ser escovada",
            monthlyBathsRemaining: 4,
            monthlyHygienicGrooming: true,
            scheduleDate: new Date(new Date().setHours(new Date().getHours() + 2))
        },
        {
            id: 3,
            name: "Thor",
            owner: "Carlos Oliveira",
            breed: "Bulldog",
            phone: "+5511777777777",
            inService: false,
            serviceProgress: 0,
            completedToday: false,
            serviceType: "Banho e Tosa",
            observations: "",
            scheduleDate: new Date(new Date().setHours(new Date().getHours() - 3)),
            scheduleEndDate: new Date(new Date().setHours(new Date().getHours() - 1))
        }
    ]);

    // Função para iniciar serviço
    const startService = (petId) => {
        setPets(pets.map(pet => {
            if (pet.id === petId) {
                return { 
                    ...pet, 
                    inService: true,
                    serviceProgress: 0,
                    serviceStartTime: new Date()  // Adiciona horário de início do serviço
                };
            }
            return pet;
        }));
    };

    // Função para atualizar progresso do serviço
    const updateServiceProgress = (petId, progress) => {
        setPets(pets.map(pet =>
            pet.id === petId ? { ...pet, serviceProgress: progress } : pet
        ));
    };

    // Função para completar serviço
    const completeService = (petId) => {
        setPets(pets.map(pet => {
            if (pet.id !== petId) return pet;

            let monthlyBathsRemaining = pet.monthlyBathsRemaining;
            if (pet.serviceType === "Plano Mensal" && pet.serviceProgress === 0) {
                monthlyBathsRemaining = Math.max(0, (pet.monthlyBathsRemaining || 0) - 1);
            }

            return {
                ...pet,
                serviceProgress: 3,
                completedToday: true,
                inService: false,
                monthlyBathsRemaining,
                serviceEndTime: new Date()  // Adiciona horário de término do serviço
            };
        }));
    };

    // Função para adicionar novo pet
    const addPet = (newPet) => {
        setPets([...pets, {
            ...newPet,
            id: Date.now(),
            inService: false,
            serviceProgress: 0,
            completedToday: false,
            scheduleDate: new Date(newPet.scheduleDate)
        }]);
    };

    return (
        <PetsContext.Provider value={{
            pets,
            setPets,
            addPet,
            startService,
            updateServiceProgress,
            completeService
        }}>
            {children}
        </PetsContext.Provider>
    );
};