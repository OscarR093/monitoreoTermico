// src/App.jsx
//import React from "react";
import Tabs from "./Tabs";
import "./styles.css";
import logo from "./assets/fagorlogo.png" 
function App() {
  return (
    <div className="App">
      <img src={logo} height="50px"/>
      <h2>Monitoreo Termico</h2>
      <Tabs />
    </div>
  );
}

export default App;