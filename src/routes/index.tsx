import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard";
import { Gastos } from "../pages/Gastos";
import { Bots } from "../pages/Bots";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { Login } from "../pages/Login/task";
import { Bloqueado } from "../pages/Bloqueado/Bloqueado";
import RemarketingPage from "../Remarketing/BotsPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route
        path="/"
        element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        }
      />

      {/* Gastos */}
      <Route
        path="/gastos"
        element={
          <DashboardLayout>
            <Gastos />
          </DashboardLayout>
        }
      />

      {/* Bots */}
      <Route
        path="/bots"
        element={
          <DashboardLayout>
            <Bots />
          </DashboardLayout>
        }
      />

      {/* Remarketing */}
      <Route
        path="/remarketing"
        element={
          <DashboardLayout>
            <RemarketingPage />
          </DashboardLayout>
        }
      />

      {/* Configurações */}
      <Route
        path="/settings"
        element={
          <DashboardLayout>
            <div>Configurações</div>
          </DashboardLayout>
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={<Login onLogin={() => console.log("Logado")} />}
      />

      {/* Bloqueado */}
      <Route path="/bloqueado" element={<Bloqueado />} />
    </Routes>
  );
}
