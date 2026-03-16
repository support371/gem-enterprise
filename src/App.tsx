import { useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { evaluateAccessRedirect, publicMenus, publicRoutes, readDb, writeDb } from "@/lib/platform";
import PortalDashboardPage from "@/pages/portal/PortalDashboardPage";

const queryClient = new QueryClient();

const navItems = ["Home", "Intel", "Services", "Community", "Hub", "Resources", "Company", "Contact", "Get Started"];
const navPaths: Record<string, string> = { Home: "/home", Intel: "/intel", Services: "/services", Community: "/community", Hub: "/hub", Resources: "/resources", Company: "/company", Contact: "/contact", "Get Started": "/get-started" };

function Shell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <Link to="/" className="font-semibold">GEM Enterprise</Link>
          <button className="md:hidden" onClick={() => setOpen((v) => !v)}>Menu</button>
          <nav className="hidden gap-4 md:flex">
            {navItems.map((item) => (
              <Link key={item} to={navPaths[item]} className="text-sm text-slate-300 hover:text-white">{item}</Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/kyc/status" className="text-sm">KYC Status</Link>
            <Link to="/client-login" className="text-sm">Client Login</Link>
            {user && <Button size="sm" variant="outline" onClick={() => signOut()}>Logout</Button>}
          </div>
        </div>
        {open && <div className="space-y-2 border-t border-slate-800 p-4 md:hidden">{navItems.map((item) => <Link className="block" to={navPaths[item]} key={item}>{item}</Link>)}</div>}
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
      <footer className="border-t border-slate-800 p-6 text-sm text-slate-400">© GEM Enterprise · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/compliance-notice">Compliance Notice</Link></footer>
    </div>
  );
}

function HomePage() {
  return <div className="space-y-6"><h1 className="text-4xl font-bold">Cybersecurity-first enterprise operations</h1><p className="text-slate-300">Unified platform across Intel, Services, Community, Hub, Resources, and Company operations.</p><div className="grid gap-4 md:grid-cols-3">{["Cybersecurity", "Financial", "Real Estate"].map((p) => <Card key={p}><CardHeader><CardTitle>{p}</CardTitle></CardHeader><CardContent>Operational division with governance and entitlement-aware access.</CardContent></Card>)}</div></div>;
}

function PublicPage() {
  const location = useLocation();
  const route = publicRoutes[location.pathname] ?? publicRoutes["/"];
  const sectionMenu = route.section in publicMenus ? publicMenus[route.section as keyof typeof publicMenus] : [];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{route.title}</h1>
      <p className="text-slate-300">{route.blurb}</p>
      {sectionMenu.length > 0 && <Card><CardHeader><CardTitle>{route.section} Menu</CardTitle></CardHeader><CardContent><ul className="grid gap-2 md:grid-cols-2">{sectionMenu.map((item) => <li key={item}>• {item}</li>)}</ul></CardContent></Card>}
      <Card><CardHeader><CardTitle>Operational Notes</CardTitle></CardHeader><CardContent>Production placeholder content designed for enterprise editing while preserving page hierarchy and navigation model.</CardContent></Card>
    </div>
  );
}

function ClientLogin() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("client@gem-enterprise.com");
  const [password, setPassword] = useState("client123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const run = async (mode: "in" | "up") => {
    setError("");
    const result = mode === "in" ? await signIn(email, password) : await signUp(email, password);
    if (result.error) setError(result.error.message);
    else navigate("/access/continue");
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader><CardTitle>Client Login</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-400">Demo users: client@gem-enterprise.com / client123 and admin@gem-enterprise.com / admin123</p>
        <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2"><Button onClick={() => run("in")}>Login</Button><Button variant="outline" onClick={() => run("up")}>Create Account</Button></div>
      </CardContent>
    </Card>
  );
}

function AccessContinue() {
  const { user } = useAuth();
  return <Navigate to={evaluateAccessRedirect(user)} replace />;
}

function KycStatusPage() {
  const { user, updateKycState } = useAuth();
  const states = ["started", "in_progress", "documents_uploaded", "under_review", "manual_review", "approved", "rejected"] as const;
  return <Card><CardHeader><CardTitle>KYC Status: {user?.kycState ?? "not_started"}</CardTitle></CardHeader><CardContent className="space-y-3"><p>Update KYC state to simulate review lifecycle.</p><div className="flex flex-wrap gap-2">{states.map((s) => <Button key={s} variant="outline" onClick={() => updateKycState(s)}>{s}</Button>)}</div><Button onClick={() => updateKycState("not_started")}>reset</Button></CardContent></Card>;
}

function ProtectedRoute({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/client-login" replace />;
  if (!user.sessionExpiresAt || user.sessionExpiresAt < Date.now()) return <Navigate to="/client-login?reason=session-expired" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/app/dashboard?reason=forbidden" replace />;
  return <>{children}</>;
}

function AppPage({ title }: { title: string }) {
  const { user } = useAuth();
  const { portfolioId } = useParams();
  const db = useMemo(() => readDb(), [user]);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-slate-300">User: {user?.email} ({user?.role})</p>
      {portfolioId && <p>Portfolio: {portfolioId}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Support Tickets</CardTitle></CardHeader><CardContent>{db.supportTickets.filter((t) => t.userId === user?.id).length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Requests</CardTitle></CardHeader><CardContent>{db.requests.filter((r) => r.userId === user?.id).length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Notifications</CardTitle></CardHeader><CardContent>{db.notifications.filter((n) => n.userId === user?.id).length}</CardContent></Card>
      </div>
    </div>
  );
}

function SupportPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  return <Card><CardHeader><CardTitle>Support</CardTitle></CardHeader><CardContent className="space-y-3"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Issue title" /><Button onClick={() => {
    if (!user || !title) return;
    const db = readDb();
    db.supportTickets.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), userId: user.id, title, status: "open" });
    db.notifications.push({ id: crypto.randomUUID(), userId: user.id, message: `Support ticket created: ${title}`, createdAt: new Date().toISOString(), read: false });
    writeDb(db);
    setTitle("");
  }}>Create ticket</Button></CardContent></Card>;
}

function RequestPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  return <Card><CardHeader><CardTitle>Requests</CardTitle></CardHeader><CardContent className="space-y-3"><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Request type" /><Button onClick={() => {
    if (!user || !category) return;
    const db = readDb();
    db.requests.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), userId: user.id, category, status: "pending" });
    writeDb(db);
    setCategory("");
  }}>Submit request</Button></CardContent></Card>;
}

function AdminPage({ mode }: { mode: "kyc" | "approvals" | "users" | "allocations" | "index" }) {
  const db = readDb();
  return <Card><CardHeader><CardTitle>Admin: {mode}</CardTitle></CardHeader><CardContent><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(db.users.map((u) => ({ email: u.email, role: u.role, kycState: u.kycState, entitlements: u.entitlements })), null, 2)}</pre></CardContent></Card>;
}

const protectedRoutes = [
  "/app", "/app/products", "/app/products/cyber", "/app/products/financial", "/app/products/real-estate", "/app/portfolios", "/app/documents", "/app/compliance", "/app/profile", "/app/settings", "/app/security", "/app/notifications", "/app/messages"
];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Shell><HomePage /></Shell>} />
      {Object.keys(publicRoutes).filter((p) => p !== "/").map((path) => (
        <Route key={path} path={path} element={<Shell>{path === "/client-login" ? <ClientLogin /> : path === "/access/continue" ? <AccessContinue /> : path === "/kyc/status" ? <KycStatusPage /> : <PublicPage />}</Shell>} />
      ))}

      {protectedRoutes.map((path) => <Route key={path} path={path} element={<Shell><ProtectedRoute><AppPage title={path} /></ProtectedRoute></Shell>} />)}

      <Route path="/portal/dashboard" element={<Shell><ProtectedRoute><PortalDashboardPage /></ProtectedRoute></Shell>} />
      <Route path="/app/dashboard" element={<Shell><ProtectedRoute><PortalDashboardPage /></ProtectedRoute></Shell>} />
      <Route path="/app/portfolios/:portfolioId" element={<Shell><ProtectedRoute><AppPage title="Portfolio Detail" /></ProtectedRoute></Shell>} />
      <Route path="/app/support" element={<Shell><ProtectedRoute><SupportPage /></ProtectedRoute></Shell>} />
      <Route path="/app/requests" element={<Shell><ProtectedRoute><RequestPage /></ProtectedRoute></Shell>} />
      <Route path="/app/admin" element={<Shell><ProtectedRoute adminOnly><AdminPage mode="index" /></ProtectedRoute></Shell>} />
      <Route path="/app/admin/kyc" element={<Shell><ProtectedRoute adminOnly><AdminPage mode="kyc" /></ProtectedRoute></Shell>} />
      <Route path="/app/admin/approvals" element={<Shell><ProtectedRoute adminOnly><AdminPage mode="approvals" /></ProtectedRoute></Shell>} />
      <Route path="/app/admin/users" element={<Shell><ProtectedRoute adminOnly><AdminPage mode="users" /></ProtectedRoute></Shell>} />
      <Route path="/app/admin/allocations" element={<Shell><ProtectedRoute adminOnly><AdminPage mode="allocations" /></ProtectedRoute></Shell>} />

      <Route path="*" element={<Shell><h1 className="text-2xl">404 - Not Found</h1></Shell>} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
