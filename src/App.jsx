import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PetsProvider } from "./contexts/PetsContext";
import MainTabs from "./pages/MainTabs";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: '#4a148c' },
    secondary: { main: '#ff6f00' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <PetsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<MainTabs />} />
          </Routes>
        </BrowserRouter>
      </PetsProvider>
    </ThemeProvider>
  );
}

export default App;