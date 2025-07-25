import { useContext } from "react";
import { PetsContext } from "../contexts/PetsContext";
import  ServiceFlow  from "../components/ServiceFlow";

const Dashboard = () => {
    const { pets } = useContext(PetsContext);

    return (
        <div>
            <h1>Pets em Serviço</h1>
            {pets.map((pet) => (
                <ServiceFlow key={pet.id} pet={pet} />
            ))}
        </div>
    );
};

export default Dashboard;