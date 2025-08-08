import { createContext, useContext, useState } from 'react';

// Cria o contexto
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([
    {
      id: 1,
      email: 'proprietario@email.com',
      password: 'admin123',
      name: 'Proprietário',
      role: 'owner'
    },
    {
      id: 2,
      email: 'funcionario@email.com',
      password: 'func123',
      name: 'Funcionário',
      role: 'employee'
    }
  ]);

  const login = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const addUser = (newUser) => {
    const userWithId = {
      ...newUser,
      id: Date.now()
    };
    setUsers([...users, userWithId]);
  };

  const updateUser = (id, updatedUser) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updatedUser } : u));
  };

  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      login, 
      logout, 
      addUser, 
      updateUser, 
      deleteUser,
      petshopName: "Meu Petshop" 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};