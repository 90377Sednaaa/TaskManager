import { useEffect, useState } from "react";
import Layout, { type AdminPage, type EmployeePage } from "./components/Layout";
import AdminDashboardStats from "./pages/AdminDashboardStats";
import CreateTaskPage from "./pages/CreateTaskPage";
import ViewTasksPage from "./pages/ViewTasksPage";
import EmployeeBoard from "./pages/Employeeboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import { getUsers } from "./api/tasks";
import type { User } from "./types";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuth } from "./context/AuthContext";

function App() {
  const [view, setView] = useState<"admin" | "employee">("admin");
  const [adminPage, setAdminPage] = useState<AdminPage>("dashboard");
  const [employeePage, setEmployeePage] = useState<EmployeePage>("dashboard");
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const { user } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const currentUserId = user?.id ?? "";

  useEffect(() => {
    getUsers().then((data) => {
      setEmployees(data);
    });
  }, []);

  useEffect(() => {
    if (user?.roles?.includes("admin")) {
      setView("admin");
    } else if (user) {
      setView("employee");
    }
  }, [user]);

  const currentUser = employees.find((e) => e.id === user?.id);

  if (!user) {
    if (authView === "signup") {
      return <SignupPage onSwitchToLogin={() => setAuthView("login")} />;
    }

    return <LoginPage onSwitchToSignup={() => setAuthView("signup")} />;
  }

  return (
    <Layout
      view={view}
      onViewChange={setView}
      adminPage={adminPage}
      onAdminPageChange={setAdminPage}
      employeePage={employeePage}
      onEmployeePageChange={setEmployeePage}
    >
      {view === "admin" && adminPage === "dashboard" && (
        <AdminDashboardStats onViewAllTasks={() => setAdminPage("view")} />
      )}
      {view === "admin" && adminPage === "create" && <CreateTaskPage />}
      {view === "admin" && adminPage === "view" && <ViewTasksPage />}

      {view === "employee" && employeePage === "dashboard" && (
        <EmployeeDashboard currentUser={currentUser ?? user ?? undefined} />
      )}
      {view === "employee" && employeePage === "my-work" && (
        <EmployeeBoard employees={employees} currentUserId={currentUserId} />
      )}
    </Layout>
  );
}

export default App;
