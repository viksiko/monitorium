import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/errors/ErrorBoundary';

import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Map from './pages/Map';
import Representatives from './pages/Representatives';
import RepresentativeProfile from './pages/RepresentativeProfile';
import TaskCreate from './pages/TaskCreate';
import Balance from './pages/Balance';
import NotFound from './pages/NotFound';
import Help from './pages/Help';
import ServerError from './pages/ServerError';

// New pages
import Dashboard from './pages/Dashboard';
import Blog from './pages/Blog';
import MessageCenter from './pages/MessageCenter';
import RepresentativeDashboard from './pages/RepresentativeDashboard';
import RepresentativeRegister from './pages/RepresentativeRegister';
import GosuslugiCallback from './pages/GosuslugiCallback';
import SberCallback from './pages/SberCallback';
import TinkoffCallback from './pages/TinkoffCallback';
import RepresentativeTasks from './pages/RepresentativeTasks';
import RepresentativeStatistics from './pages/RepresentativeStatistics';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import DistrictDetails from './pages/DistrictDetails';
import ConfirmRegistration from './pages/ConfirmRegistration';
import ConfirmRegistrationFailed from './pages/ConfirmRegistrationFailed';
import { AuthInit } from './hooks/useAuthInit';
import PrivateRoute from './guards/PrivateRoute';
import PublicRoute from './guards/PublicRoute';
import { TaskDetails } from './components/dashboard';
import ScrollToTop from './components/ui/ScrollToTop';
import { RoleRoute } from './guards/RoleRoute';
import TaskEdit from './pages/TaskEdit';

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <AuthProvider>
                <ErrorBoundary>
                    <Toaster />
                    <Sonner />
                    <AuthInit>
                        <BrowserRouter>
                            <ScrollToTop />
                            <Routes>
                                {/* ================== PUBLIC (доступны всем) ================== */}
                                <Route
                                    path="/"
                                    element={<Index />}
                                />
                                <Route
                                    path="/help"
                                    element={<Help />}
                                />
                                <Route
                                    path="/blog"
                                    element={<Blog />}
                                />
                                <Route
                                    path="/blog/:id"
                                    element={<Blog />}
                                />
                                <Route
                                    path="/districts/:id"
                                    element={<DistrictDetails />}
                                />

                                {/* ================== PUBLIC ONLY (только для НЕавторизованных) ================== */}
                                <Route element={<PublicRoute />}>
                                    <Route
                                        path="/login"
                                        element={<Login />}
                                    />
                                    <Route
                                        path="/register"
                                        element={<Register />}
                                    />
                                    <Route
                                        path="/register/representative"
                                        element={<RepresentativeRegister />}
                                    />
                                </Route>

                                {/* ================== PRIVATE (только для авторизованных) ================== */}
                                <Route element={<PrivateRoute />}>
                                    <Route
                                        path="/map"
                                        element={<Map />}
                                    />
                                    <Route
                                        path="/dashboard"
                                        element={<Dashboard />}
                                    />
                                    <Route
                                        path="/messages"
                                        element={<MessageCenter />}
                                    />
                                    <Route
                                        path="/analytics"
                                        element={<Analytics />}
                                    />
                                    <Route
                                        path="/tasks"
                                        element={<Tasks />}
                                    />
                                    <Route
                                        path="/tasks/create"
                                        element={<TaskCreate />}
                                    />
                                    <Route
                                        path="/tasks/:taskId"
                                        element={<TaskDetails />}
                                    />

                                    <Route element={<RoleRoute allowedRoles={['REPRESENTATIVE']} />}>
                                        <Route
                                            path="/tasks/:taskId/edit"
                                            element={<TaskEdit />}
                                        />
                                    </Route>
                                    <Route
                                        path="/balance"
                                        element={<Balance />}
                                    />
                                    {/* Representative */}
                                    <Route
                                        path="/representative/dashboard"
                                        element={<RepresentativeDashboard />}
                                    />
                                    <Route
                                        path="/representative/tasks"
                                        element={<RepresentativeTasks />}
                                    />
                                    <Route
                                        path="/representative/statistics"
                                        element={<RepresentativeStatistics />}
                                    />

                                    <Route
                                        path="/representatives"
                                        element={<Representatives />}
                                    />
                                    <Route
                                        path="/representative/profile/:id"
                                        element={<RepresentativeProfile />}
                                    />
                                </Route>

                                {/* ================== CALLBACKS (без guard’ов) ================== */}
                                <Route
                                    path="/gosuslugi/callback"
                                    element={<GosuslugiCallback />}
                                />
                                <Route
                                    path="/sber/auth"
                                    element={<SberCallback />}
                                />
                                <Route
                                    path="/tinkoff/auth"
                                    element={<TinkoffCallback />}
                                />

                                {/* ================== SERVICE ================== */}
                                <Route
                                    path="/confirm-registration"
                                    element={<ConfirmRegistration />}
                                />
                                <Route
                                    path="/confirm-registration-failed"
                                    element={<ConfirmRegistrationFailed />}
                                />

                                {/* ================== ERRORS ================== */}
                                <Route
                                    path="/server-error"
                                    element={<ServerError />}
                                />
                                <Route
                                    path="*"
                                    element={<NotFound />}
                                />
                            </Routes>
                        </BrowserRouter>
                    </AuthInit>
                </ErrorBoundary>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
