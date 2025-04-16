import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./contexts/AuthContext";
import { Suspense, lazy } from "react";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

// Lazy-loaded routes
const Customers = lazy(() => import("./pages/customers"));
const CreateCustomer = lazy(() => import("./pages/customers/create"));
const EditCustomer = lazy(() => import("./pages/customers/edit"));

const Products = lazy(() => import("./pages/products"));
const CreateProduct = lazy(() => import("./pages/products/create"));
const EditProduct = lazy(() => import("./pages/products/edit"));

const Sales = lazy(() => import("./pages/sales"));
const CreateSale = lazy(() => import("./pages/sales/create"));
const ViewSale = lazy(() => import("./pages/sales/view"));

const Returns = lazy(() => import("./pages/returns"));
const CreateReturn = lazy(() => import("./pages/returns/create"));
const ViewReturn = lazy(() => import("./pages/returns/view"));

const Finances = lazy(() => import("./pages/finances"));
const Payments = lazy(() => import("./pages/payments"));
const Users = lazy(() => import("./pages/users"));
const Settings = lazy(() => import("./pages/settings"));
const NotFound = lazy(() => import("./pages/not-found"));

function App() {
  const { currentUser } = useAuth();
  const [location] = useLocation();

  // Redirect to login if not authenticated
  if (!currentUser && location !== "/login") {
    return <Login />;
  }

  // Show login page only
  if (!currentUser) {
    return (
      <>
        <Route path="/login" component={Login} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainLayout>
        <Suspense fallback={<div className="w-full p-12 flex justify-center">Loading...</div>}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            
            <Route path="/customers" component={Customers} />
            <Route path="/customers/create" component={CreateCustomer} />
            <Route path="/customers/edit/:id" component={EditCustomer} />
            
            <Route path="/products" component={Products} />
            <Route path="/products/create" component={CreateProduct} />
            <Route path="/products/edit/:id" component={EditProduct} />
            
            <Route path="/sales" component={Sales} />
            <Route path="/sales/create" component={CreateSale} />
            <Route path="/sales/view/:id" component={ViewSale} />
            
            <Route path="/returns" component={Returns} />
            <Route path="/returns/create" component={CreateReturn} />
            <Route path="/returns/view/:id" component={ViewReturn} />
            
            <Route path="/finances" component={Finances} />
            <Route path="/payments" component={Payments} />
            <Route path="/users" component={Users} />
            <Route path="/settings" component={Settings} />
            
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </MainLayout>
      <Toaster />
    </>
  );
}

export default App;
