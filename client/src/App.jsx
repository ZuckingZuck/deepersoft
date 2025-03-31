import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import Navbar from "./components/Navbar";
import api from "./utils/api";
import { useEffect } from "react";

function App() {
  const fetchRequirements = async () => {
    try {
     const response = await api.get('/api/req/sys');
     console.log(response.data); 
    } catch (error) {
      console.log(error);      
    }
  }

  useEffect(() => {
    fetchRequirements();
  }, [])
  return (
    <Router>
      <div>
        <Navbar />
        <main>
          <AppRouter />
        </main>
      </div>
    </Router>
  );
}

export default App;
