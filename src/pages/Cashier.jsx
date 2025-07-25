import { useState } from "react";

const Cashier = () => {
    const [transactions, setTransactions] = useState([]);
    const [service, setService] = useState({ name: "", price: ""});

    const addTransaction = () => {
        setTransactions([...transactions, { ...service, id: Date.now() }]);
    };

    return (
        <div>
            <input
                placeholder="Serviço"
                onChange={(e) => setService({ ...service, name: e.target.value })}
            />
            <input
                placeholder="Preço"
                type="number"
                onChange={(e) => setService({ ...service, price: e.target.value})}
            />
            <button onClick={addTransaction}>Adicionar</button>
            <ul>
                {transactions.map((t) => (
                    <li key={t.id}>
                        {t.name} - R${t.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Cashier;