// src/components/UserManagement.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// --- Iconos SVG ---
const AddUserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="22" x2="16" y1="11" y2="11" /><line x1="19" x2="19" y1="8" y2="14" /></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
);
const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);

function UserManagement({ user: currentUser }) {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ username: "", password: "", email: "", fullName: "", admin: false });

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await api.get("/users");
                // **CAMBIO:** Ahora cargamos todos los usuarios pero filtramos al admin actual
                const filteredUsers = response.filter((u) => u.username !== currentUser.username);
                setUsers(filteredUsers);
            } catch (err) {
                setNotification({ message: "Error al cargar usuarios.", type: 'error' });
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [currentUser.username]);
    
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: '', type: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await api.post("/register", formData);
            setUsers([...users, { ...response.user, id: response.id }]);
            setFormData({ username: "", password: "", email: "", fullName: "", admin: false });
            setNotification({ message: 'Usuario agregado correctamente.', type: 'success' });
        } catch (error) {
            setNotification({ message: 'Error al agregar usuario.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete || userToDelete.admin) return; // Doble seguridad
        setIsSubmitting(true);
        try {
            await api.del(`/users/${userToDelete.id}`);
            setUsers(users.filter((user) => user.id !== userToDelete.id));
            setNotification({ message: 'Usuario eliminado correctamente.', type: 'success' });
        } catch (error) {
            setNotification({ message: 'Error al eliminar usuario.', type: 'error' });
        } finally {
            setIsSubmitting(false);
            setUserToDelete(null);
        }
    };
    
    const notificationColors = {
        success: 'bg-teal-600',
        error: 'bg-amber-600'
    };
    
    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-100 text-xl font-semibold">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Gestión de Usuarios</h1>
                    <button onClick={() => navigate('/')} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Volver</button>
                </div>
                
                {notification.message && (
                    <div className={`fixed top-5 right-5 z-50 rounded-lg p-4 text-white font-medium shadow-lg ${notificationColors[notification.type]}`}>
                        {notification.message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-xl shadow-md sticky top-6">
                            <h2 className="text-xl font-bold text-slate-700 border-b pb-3 mb-6 flex items-center gap-2"><AddUserIcon /> Agregar Nuevo Usuario</h2>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <InputField label="Nombre de usuario" name="username" value={formData.username} onChange={handleInputChange} />
                                <InputField label="Contraseña" name="password" type="password" value={formData.password} onChange={handleInputChange} />
                                <InputField label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                                <InputField label="Nombre Completo" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" name="admin" checked={formData.admin} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500" />
                                    <label className="text-sm font-medium text-gray-700">Conceder permisos de Administrador</label>
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 mt-2 px-6 py-3 font-bold text-white bg-slate-700 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all duration-200 disabled:bg-slate-400">
                                    {isSubmitting ? <><SpinnerIcon /> Agregando...</> : 'Agregar Usuario'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-slate-700 border-b pb-3 mb-4">Usuarios Registrados</h2>
                        {users.length === 0 ? (
                            <p className="text-gray-500 mt-4">No hay otros usuarios registrados.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {users.map((u) => (
                                    <li key={u.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4">
                                        <div className="flex-grow text-left mb-2 sm:mb-0">
                                            <p className="font-semibold text-slate-800 flex items-center gap-2">
                                                {u.fullName}
                                                {/* **CAMBIO:** Etiqueta para identificar administradores */}
                                                {u.admin && <span className="text-xs font-bold text-white bg-slate-500 px-2 py-0.5 rounded-full">Admin</span>}
                                            </p>
                                            <p className="text-sm text-gray-500">{u.email} ({u.username})</p>
                                        </div>
                                        {/* **CAMBIO:** Botón deshabilitado si el usuario es admin */}
                                        <button 
                                            onClick={() => setUserToDelete(u)} 
                                            disabled={u.admin}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full sm:w-auto disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-amber-700 bg-amber-100 hover:bg-amber-200"
                                        >
                                            <TrashIcon /> Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-slate-800">Confirmar Eliminación</h3>
                        <p className="text-gray-600 my-4">¿Estás seguro de que quieres eliminar al usuario <strong>{userToDelete.fullName}</strong>? Esta acción es irreversible.</p>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setUserToDelete(null)} disabled={isSubmitting} className="px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50">
                                Cancelar
                            </button>
                            <button onClick={handleDeleteUser} disabled={isSubmitting} className="flex justify-center items-center gap-2 px-4 py-2 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-amber-400 w-32">
                                {isSubmitting ? <SpinnerIcon /> : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" />
    </div>
);

export default UserManagement;