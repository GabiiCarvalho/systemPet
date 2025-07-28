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
            inService: false,
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
            inService: false,
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
                    serviceStartTime: new Date()
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
            if (pet.serviceType === "Plano Mensal") {
                monthlyBathsRemaining = Math.max(0, (pet.monthlyBathsRemaining || 0) - 1);
            }

            return {
                ...pet,
                serviceProgress: 3,
                completedToday: true,
                inService: false,
                monthlyBathsRemaining,
                serviceEndTime: new Date()
            };
        }));
    };

    const renewMonthlyPlan = (phone, baths) => {
        setPets(pets.map(pet => {
            if (pet.phone === phone && pet.serviceType === "Plano Mensal") {
                return {
                    ...pet,
                    monthlyBathsRemaining: baths
                };
            }
            return pet;
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

    // Função para atualizar a data de agendamento de um pet
    const updatePetSchedule = (petId, newDate) => {
        setPets(pets.map(pet => {
            if (pet.id === petId) {
                // Mantém a mesma hora do agendamento original, apenas muda a data
                const originalDate = new Date(pet.scheduleDate);
                const updatedDate = new Date(newDate);

                // Atualiza a data mantendo o horário original
                updatedDate.setHours(
                    originalDate.getHours(),
                    originalDate.getMinutes(),
                    originalDate.getSeconds()
                );

                // Calcula a nova data de término (se existir)
                let newEndDate = null;
                if (pet.scheduleEndDate) {
                    const duration = new Date(pet.scheduleEndDate) - originalDate;
                    newEndDate = new Date(updatedDate.getTime() + duration);
                }

                return {
                    ...pet,
                    scheduleDate: updatedDate,
                    scheduleEndDate: newEndDate || pet.scheduleEndDate
                };
            }
            return pet;
        }));
    };

    return (
        <PetsContext.Provider value={{
            pets,
            setPets,
            addPet,
            startService,
            updateServiceProgress,
            completeService,
            updatePetSchedule
        }}>
            {children}
        </PetsContext.Provider>
    );
};