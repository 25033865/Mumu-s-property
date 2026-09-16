import PublicLayout from "./components/PublicLayout";
import PortalLayout from "./components/PortalLayout";
import AdminLayout from "./components/AdminLayout";
import Home from "./legacy-pages/Home";
import About from "./legacy-pages/About";
import Offerings from "./legacy-pages/Offerings";
import Industries from "./legacy-pages/Industries";
import Hse from "./legacy-pages/Hse";
import Suppliers from "./legacy-pages/Suppliers";
import Contact from "./legacy-pages/Contact";
import Login from "./legacy-pages/auth/Login";
import AdminLogin from "./legacy-pages/auth/AdminLogin";
import Register from "./legacy-pages/auth/Register";
import Forgot from "./legacy-pages/auth/Forgot";
import ResetPassword from "./legacy-pages/auth/ResetPassword";
import Verify from "./legacy-pages/auth/Verify";
import Dashboard from "./legacy-pages/portal/Dashboard";
import NewRequest from "./legacy-pages/portal/NewRequest";
import ServiceRequests from "./legacy-pages/portal/ServiceRequests";
import Quotes from "./legacy-pages/portal/Quotes";
import Accommodation from "./legacy-pages/portal/Accommodation";
import Documents from "./legacy-pages/portal/Documents";
import Messages from "./legacy-pages/portal/Messages";
import AdminHome from "./legacy-pages/admin/AdminHome";
import AdminClients from "./legacy-pages/admin/AdminClients";
import AdminRequests from "./legacy-pages/admin/AdminRequests";
import AdminRoster from "./legacy-pages/admin/AdminRoster";
import AdminMessages from "./legacy-pages/admin/AdminMessages";
import NotFound from "./legacy-pages/NotFound";

export const routeConfig = [
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "offerings", Component: Offerings },
      { path: "industries", Component: Industries },
      { path: "hse", Component: Hse },
      { path: "suppliers", Component: Suppliers },
      { path: "contact", Component: Contact },
      { path: "*", Component: NotFound },
    ],
  },
  { path: "/login", Component: Login },
  { path: "/admin-login", Component: AdminLogin },
  { path: "/register", Component: Register },
  { path: "/forgot", Component: Forgot },
  { path: "/reset-password", Component: ResetPassword },
  { path: "/verify", Component: Verify },
  {
    path: "/portal",
    Component: PortalLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "new-request", Component: NewRequest },
      { path: "requests", Component: ServiceRequests },
      { path: "quotes", Component: Quotes },
      { path: "accommodation", Component: Accommodation },
      { path: "documents", Component: Documents },
      { path: "messages", Component: Messages },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminHome },
      { path: "clients", Component: AdminClients },
      { path: "requests", Component: AdminRequests },
      { path: "roster", Component: AdminRoster },
      { path: "messages", Component: AdminMessages },
    ],
  },
  { path: "*", Component: NotFound },
];
