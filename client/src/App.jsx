import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import Navbar from "./components/Navbar";
import api from "./utils/api";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSystemData } from './redux/systemSlice';
import { fetchAllClusters } from "./redux/clusterSlice";
import { fetchAllUsers } from "./redux/userSlice";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user) {
      dispatch(fetchSystemData());
      dispatch(fetchAllUsers()).unwrap()
      dispatch(fetchAllClusters()).unwrap()
    }
  }, [user, dispatch]);

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
