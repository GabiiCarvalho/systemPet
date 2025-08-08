import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [petshopName, setPetshopName] = useState('Meu Petshop');
  const [isLoading, setIsLoading] = useState(false);

  const login = (email, password) => {
    setIsLoading(true);
    // Simulação de autenticação
    setTimeout(() => {
      if (email === 'proprietario@email.com') {
        setUser({ email, role: 'owner' });
      } else if (email === 'funcionario@email.com') {
        setUser({ email, role: 'employee' });
      }
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  const updatePetshopName = (name) => {
    setPetshopName(name);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      petshopName,
      isLoading,
      login, 
      logout,
      updatePetshopName
    }}>
      {children}
    </AuthContext.Provider>
  );
};