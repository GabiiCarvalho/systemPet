import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PetsProvider } from "./contexts/PetsContext";
import MainTabs from "./pages/MainTabs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "./contexts/AuthContext";

const theme = createTheme({
  palette: {
    primary: { main: '#4a148c' },
    secondary: { main: '#ff6f00' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
      <PetsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<MainTabs />} />
          </Routes>
        </BrowserRouter>
      </PetsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;