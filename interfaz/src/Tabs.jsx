// src/components/TabsComponent.jsx
import { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useNavigate } from "react-router-dom";
import useWebSocket from "./services/webSocketService";

// Importa los assets necesarios y el componente del medidor
import logo from "./assets/fagorlogo.png";
import TechnicalGauge from "./components/TechnicalGauge";

// --- Iconos SVG (limpios y sin espacios irregulares) ---
const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
    </svg>
);

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

const TabsComponent = ({ onLogout, user }) => {
    const navigate = useNavigate();
    const [tabsData, setTabsData] = useState([]);
    const [plcStatus, setPlcStatus] = useState('Inicializando...');

    const [mainMenuOpen, setMainMenuOpen] = useState(false);
    const [tabsMenuOpen, setTabsMenuOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const isPlcConnected = plcStatus.toLowerCase() === 'ok' || plcStatus.toLowerCase().includes('recibidos');

    useEffect(() => {
        const initialTabs = [
            { id: 1, name: "Torre Fusora", temperature: "---" },
            { id: 2, name: "Linea 1", temperature: "---" },
            { id: 3, name: "Linea 2", temperature: "---" },
            { id: 4, name: "Linea 3", temperature: "---" },
            { id: 5, name: "Linea 4", temperature: "---" },
            { id: 6, name: "Linea 7", temperature: "---" },
            { id: 7, name: "Estacion 1", temperature: "---" },
            { id: 8, name: "Estacion 2", temperature: "---" },
        ];
        setTabsData(initialTabs);
    }, []);

    useWebSocket(setTabsData, setPlcStatus);

    const toggleMainMenu = () => setMainMenuOpen(!mainMenuOpen);
    const toggleTabsMenu = () => setTabsMenuOpen(!tabsMenuOpen);

    const handleNavigate = (path) => {
        navigate(path);
        setMainMenuOpen(false);
    };

    const handleLogoutClick = () => {
        onLogout();
        setMainMenuOpen(false);
    };

    const handleTabSelection = (index) => {
        setSelectedIndex(index);
        if (tabsMenuOpen) {
            setTabsMenuOpen(false);
        }
    };

    const handleViewHistory = (nombreEquipo) => {
        navigate(`/history/${nombreEquipo}`);
    };

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-100 text-gray-800">
            {/* ================= HEADER ================= */}
            <header className="bg-white p-4 shadow-md flex justify-between items-center fixed top-0 left-0 w-full z-30">
                <div className="flex items-center gap-2">
                    <button onClick={toggleTabsMenu} className="text-gray-600 focus:outline-none md:hidden p-2">
                        <MenuIcon />
                    </button>
                    <div className="flex flex-col items-start">
                        <img src={logo} alt="Logo Fagor" className="h-10 w-auto mr-20" />
                        <span className={`-mt-1 ml-1 px-2 py-0.5 rounded-full text-white font-semibold text-[10px] transition-colors sm:hidden ${isPlcConnected ? 'bg-slate-700' : 'bg-gray-700'}`}>
                            {isPlcConnected ? 'Conectado' : 'Desconectado'}
                        </span>
                    </div>
                </div>

                <div className="hidden sm:flex flex-grow justify-center">
                    <h1 className="text-xl font-bold">Monitoreo de Temperaturas</h1>
                </div>

                <div className="flex items-center gap-4">
                    <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-white font-semibold text-sm transition-colors ${isPlcConnected ? 'bg-slate-700' : 'bg-gray-700'}`}>
                        {plcStatus}
                    </span>
                    <nav className="hidden md:flex items-center gap-3">
                        <button onClick={() => handleNavigate("/settings")} className="bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-800">Ajustes</button>
                        {user?.admin && (
                            <button onClick={() => handleNavigate("/admin/users")} className="bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-800">Gestión</button>
                        )}
                        <button onClick={handleLogoutClick} className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800">Cerrar Sesión</button>
                    </nav>
                    <div className="md:hidden">
                        <button onClick={toggleMainMenu} className="text-gray-600 focus:outline-none p-2">
                            <MenuIcon />
                        </button>
                    </div>
                </div>
            </header>

            {/* --- Paneles de Menú Móvil --- */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${tabsMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleTabsMenu}></div>
            <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${tabsMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4">
                    <button onClick={toggleTabsMenu} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon /></button>
                    <h2 className="text-lg font-bold mb-6 mt-2">Secciones</h2>
                    <div className="flex flex-col gap-2">
                        {tabsData.map((tab, index) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabSelection(index)}
                                className={`w-full text-left p-3 font-semibold rounded-md transition-colors ${selectedIndex === index ? 'bg-slate-700 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${mainMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleMainMenu}></div>
            <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${mainMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4">
                    <button onClick={toggleMainMenu} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon /></button>
                    <h2 className="text-lg font-bold mb-6 mt-2">Menú</h2>
                    <nav className="flex flex-col gap-4">
                        <button onClick={() => handleNavigate("/settings")} className="w-full text-left bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-800">Ajustes</button>
                        {user?.admin && (
                            <button onClick={() => handleNavigate("/admin/users")} className="w-full text-left bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-800">Gestión</button>
                        )}
                        <button onClick={handleLogoutClick} className="w-full text-left bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800">Cerrar Sesión</button>
                    </nav>
                </div>
            </div>

            {/* ================= CONTENIDO PRINCIPAL ================= */}
            <main className="flex-1 w-full mt-20">
                <Tabs
                    className="flex flex-col md:flex-row h-full p-2 md:p-4 gap-4"
                    selectedIndex={selectedIndex}
                    onSelect={handleTabSelection}
                    selectedTabClassName="!bg-slate-700 !text-white shadow-md"
                    selectedTabPanelClassName="!block"
                >
                    <TabList className="flex-shrink-0 md:w-64 flex-col gap-2 p-4 bg-white rounded-lg shadow-md hidden md:flex">
                        {tabsData.map((tab) => (
                            <Tab key={tab.id} className="w-full text-left p-3 font-semibold text-gray-600 cursor-pointer rounded-md hover:bg-gray-200 focus:outline-none">
                                {tab.name}
                            </Tab>
                        ))}
                    </TabList>

                    <div className="flex-grow p-4 md:p-6 bg-white rounded-lg shadow-lg overflow-y-auto">
                        {tabsData.map((tab, idx) => (
                            <TabPanel key={tab.id} forceRender={true}>
                                {selectedIndex === idx ? (
                                    <div className="flex flex-col items-center justify-center gap-6 text-center h-full">
                                        <h2 className="text-3xl font-bold text-slate-800">{tab.name}</h2>
                                        <TechnicalGauge value={typeof tab.temperature === 'number' ? tab.temperature : (parseFloat(tab.temperature) || 0)} max={1000} />
                                        <button
                                            onClick={() => handleViewHistory(tab.name)}
                                            className="mt-4 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors"
                                        >
                                            Ver Historial
                                        </button>
                                    </div>
                                ) : null}
                            </TabPanel>
                        ))}
                    </div>
                </Tabs>
            </main>
        </div>
    );
};

export default TabsComponent;
