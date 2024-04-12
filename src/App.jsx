import "./App.css";
import { useEffect, useState } from "react";
import { Auth } from "./components/ui/Auth";
import Cookies from "universal-cookie";
import { ThemeProvider } from "./components/misc/ThemeProvider";
import HomeDashboard from "./components/ui/HomeDashboard";


const cookies = new Cookies();
function App() {
  const [isAuth, _] = useState(cookies.get("auth-token"));
  const [themeMode, setThemeMode] = useState(cookies.get("themeMode") || "light");

  useEffect(() => {
    if(!cookies.get("themeMode")) cookies.set("themeMode", "light");
  }, []);

  const handleChangeThemeMode = (str) => {
    cookies.set("themeMode", str);
    setThemeMode(str);
  }

  if(!isAuth) return <ThemeProvider.Provider value={{ themeMode, handleChangeThemeMode }}><Auth /></ThemeProvider.Provider>;
  return (
    <ThemeProvider.Provider value={{ themeMode, handleChangeThemeMode }}>
      <HomeDashboard cookies={cookies} />
    </ThemeProvider.Provider>
  );
}

export default App;

