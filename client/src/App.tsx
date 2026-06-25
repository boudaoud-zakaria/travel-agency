import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/Home";
import Packages from "@/pages/Packages";
import PackageDetails from "@/pages/PackageDetails";
import Auth from "@/pages/Auth";
import Reserve from "@/pages/Reserve";
import MyReservation from "@/pages/MyReservation";

// Admin Pages
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminReservations from "@/pages/admin/AdminReservations";
import AdminPackages from "@/pages/admin/AdminPackages";
import AdminEmployees from "@/pages/admin/AdminEmployees";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminSchedule from "@/pages/admin/AdminSchedule";
import AdminCustomRequests from "@/pages/admin/AdminCustomRequests";

// Employee Pages
import EmployeeLayout from "@/pages/employee/EmployeeLayout";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import EmployeeReservations from "@/pages/employee/EmployeeReservations";
import EmployeeProfile from "@/pages/employee/EmployeeProfile";
import EmployeeStats from "@/pages/employee/EmployeeStats";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/packages" component={Packages} />
      <Route path="/packages/:id" component={PackageDetails} />
      <Route path="/reserve" component={Reserve} />
      <Route path="/reserve/:packageId" component={Reserve} />
      <Route path="/auth" component={Auth} />
      <Route path="/login" component={Auth} />
      <Route path="/my-reservation" component={MyReservation} />

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/reservations">
        <AdminLayout>
          <AdminReservations />
        </AdminLayout>
      </Route>
      <Route path="/admin/packages">
        <AdminLayout>
          <AdminPackages />
        </AdminLayout>
      </Route>
      <Route path="/admin/employees">
        <AdminLayout>
          <AdminEmployees />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      </Route>
      <Route path="/admin/schedule">
        <AdminLayout>
          <AdminSchedule />
        </AdminLayout>
      </Route>
      <Route path="/admin/custom-requests">
        <AdminLayout>
          <AdminCustomRequests />
        </AdminLayout>
      </Route>

      {/* Employee Routes */}
      <Route path="/employee">
        <EmployeeLayout>
          <EmployeeDashboard />
        </EmployeeLayout>
      </Route>
      <Route path="/employee/reservations">
        <EmployeeLayout>
          <EmployeeReservations />
        </EmployeeLayout>
      </Route>
      <Route path="/employee/profile">
        <EmployeeLayout>
          <EmployeeProfile />
        </EmployeeLayout>
      </Route>
      <Route path="/employee/stats">
        <EmployeeLayout>
          <EmployeeStats />
        </EmployeeLayout>
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
