import "./App.css";
import { useEffect } from "react";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Switch, Route, useLocation } from "wouter";
import { Box, useColorModeValue } from "@chakra-ui/react";

function App() {
  const [_location, setLocation] = useLocation();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/config");
      const resData = await res.json();
      const serverAuthConfigured = resData?.serverAuthConfigured;
      if (!serverAuthConfigured) {
        setLocation("/dashboard");
      } else {
        const res = await fetch("/api/auth");
        if (res.status === 200) {
          setLocation("/dashboard");
        } else {
          setLocation("/login");
        }
      }
    })();
  }, []);

  const bgColor = useColorModeValue("white", "black");

  return (
    <Box bg={bgColor} minH="100vh">
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route>Route not found.</Route>
      </Switch>
    </Box>
  );
}

export default App;
