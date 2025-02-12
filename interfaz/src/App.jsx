
import Tabs from "./Tabs";
import "./styles.css";
import logo from "./assets/fagorlogo.png";

function App() {
  return (
    <div className="App">
      <img src={logo} alt="Logo Fagor" height="50px" />
      <h2>Monitoreo Térmico</h2>
      <Tabs />
    </div>
  );
}

export default App;