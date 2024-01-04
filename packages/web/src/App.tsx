import "./App.css";
import { useEffect } from "react";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Switch, Route } from "wouter";
import { Box, useToast, useColorModeValue } from "@chakra-ui/react";

function App() {
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/health");
      if (res.status !== 200) {
        toast({
          title: "Server error",
          description: "Couldn't connect to backend.",
          status: "error",
          isClosable: true,
        });
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
