import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import Navbar from "./components/Navbar";

function App() {
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
