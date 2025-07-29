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
            scheduleDate: new Date('2023-05-15T10:00:00'),
            scheduleEndDate: new Date('2023-05-15T12:00:00')
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
            serviceType: "Plano Mensal",
            observations: "Gosta de ser escovada",
            monthlyBathsRemaining: 4,
            scheduleDate: new Date('2023-05-15T14:00:00')
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
            scheduleDate: new Date('2023-05-15T09:00:00'),
            scheduleEndDate: new Date('2023-05-15T11:00:00')
        }
    ]);

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

    const updateServiceProgress = (petId, progress) => {
        setPets(pets.map(pet =>
            pet.id === petId ? { ...pet, serviceProgress: progress } : pet
        ));
    };

    const completeService = (petId) => {
        setPets(pets.map(pet => {
            if (pet.id !== petId) return pet;

            const isMonthlyPlan = pet.serviceType === "Plano Mensal";
            const updatedPet = {
                ...pet,
                completedToday: true,
                inService: false,
                serviceProgress: pet.serviceType.includes("Tosa") ? 4 : 3,
                serviceEndTime: new Date()
            };

            if (isMonthlyPlan) {
                updatedPet.monthlyBathsRemaining = Math.max(0, (pet.monthlyBathsRemaining || 0) - 1);
            }

            return updatedPet;
        }));
    };

    const renewMonthlyPlan = (clientPhone, bathsCount) => {
        setPets(prevPets => prevPets.map(pet => {
            if (pet.phone === clientPhone && pet.serviceType === "Plano Mensal") {
                return {
                    ...pet,
                    monthlyBathsRemaining: bathsCount
                };
            }
            return pet;
        }));
    };

    const addPet = (newPet) => {
        const scheduleDate = new Date(newPet.scheduleDate);
        let scheduleEndDate = null;

        if (newPet.duration) {
            scheduleEndDate = new Date(scheduleDate.getTime() + newPet.duration * 60 * 60 * 1000);
        }

        setPets([...pets, {
            ...newPet,
            id: Date.now(),
            inService: false,
            serviceProgress: 0,
            completedToday: false,
            scheduleDate,
            scheduleEndDate,
            monthlyBathsRemaining: newPet.serviceType === "Plano Mensal" ? 4 : null
        }]);
    };

    const updatePetSchedule = (petId, newDateString) => {
        setPets(pets.map(pet => {
            if (pet.id === petId) {
                const newDate = new Date(newDateString);
                const originalDate = new Date(pet.scheduleDate);

                newDate.setHours(
                    originalDate.getHours(),
                    originalDate.getMinutes(),
                    originalDate.getSeconds()
                );

                let newEndDate = null;
                if (pet.scheduleEndDate) {
                    const duration = pet.scheduleEndDate - originalDate;
                    newEndDate = new Date(newDate.getTime() + duration);
                }

                return {
                    ...pet,
                    scheduleDate: newDate,
                    scheduleEndDate: newEndDate
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
            renewMonthlyPlan,
            updatePetSchedule
        }}>
            {children}
        </PetsContext.Provider>
    );
};