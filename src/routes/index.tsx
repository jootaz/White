import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Gastos } from '../pages/Gastos';
import { Bots } from '../pages/Bots'; 
import { createNewRemarketingMessage } from '../Remarketing/type';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login/task';
import { Bloqueado } from '../pages/Bloqueado/Bloqueado';
import RemarketingPage from '../Remarketing/RemarketingPage';


export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/gastos"
        element={
          <DashboardLayout>
            <Gastos />
          </DashboardLayout>
        }
      />
      <Route
        path="/bots"
        element={
          <DashboardLayout>
            <Bots />
          </DashboardLayout>
        }
      /> 
      <Route
        path="/Remarketing"
        element={
          <DashboardLayout>
            <RemarketingPage />
          </DashboardLayout>
        }
      /> 
      <Route
        path="/settings"
        element={
          <DashboardLayout>
            <div>Configurações</div>
          </DashboardLayout>
        }
      />
      <Route path="/" element={<Login onLogin={() => console.log("Logado")} />} />
        <Route path="/bloqueado" element={<Bloqueado />} />

 <Route
       path="/login" element={<Login onLogin={function (): void {
          throw new Error('Function not implemented.');
        } } />} />

    </Routes>
  );
}