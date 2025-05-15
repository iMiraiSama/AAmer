import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/login";
import Requests from "./pages/Requests";
import ForgotPassword from "./pages/ForgotPassword";
import Search from "./pages/Search";
import ProviderDashboard from "./pages/ProviderDashboard";
import UserDashboard from "./pages/UserDashboard";
import SubmitOffer from "./pages/SubmitOffer";
import ViewOffers from "./pages/ViewOffers";
import EditProfile from "./pages/EditProfile";
import Chat from "./pages/Chat";
import RequestDetails from "./pages/RequestDetails";
import Offerings from "./pages/Offering";
import ServiceChat from "./pages/ServiceChat/ServiceChat";
import OfferDetails from "./pages/OfferDetails";
import BookingDetails from "./pages/BookingDetails";
import ConfirmBooking from "./pages/ConfirmBooking";
import CompletedServices from "./pages/CompletedServices";
import MyServices from "./pages/MyServices";
import OfferRequests from "./pages/OfferRequests";
import UserBookings from "./pages/UserBookings";
import ProviderBookings from "./pages/ProviderBookings";

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUserType = localStorage.getItem("userType");

        if (token && storedUserType) {
            setIsAuthenticated(true);
            setUserType(storedUserType);
        } else {
            setIsAuthenticated(false);
            setUserType("");
        }
        setLoading(false);
    }, [location.pathname]); // Update auth state when route changes

    const handleLogin = (type) => {
        const token = localStorage.getItem("token");
        const storedUserType = localStorage.getItem("userType");
        
        if (token && storedUserType) {
            setIsAuthenticated(true);
            setUserType(storedUserType);
            const dashboardPath = storedUserType.toLowerCase() === "user" ? "/UserDashboard" : "/ProviderDashboard";
            navigate(dashboardPath);
        } else {
            navigate("/login");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
        setUserType("");
        navigate("/", { replace: true });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '20%' }}>
                <p>🔄 Loading, please wait...</p>
            </div>
        );
    }

    return (
        <div>
            <Navbar isAuthenticated={isAuthenticated} userType={userType} onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Home onLogout={handleLogout} />} />
                <Route path="/SignUp" element={<SignUp />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                
                {/* Protected Routes */}
                <Route path="/Requests" element={isAuthenticated ? <Requests /> : <Navigate to="/login" />} />
                <Route path="/Search" element={isAuthenticated ? <Search /> : <Navigate to="/login" />} />
                <Route path="/UserDashboard" element={isAuthenticated && userType === "user" ? <UserDashboard /> : <Navigate to="/login" />} />
                <Route path="/ProviderDashboard" element={isAuthenticated && userType === "provider" ? <ProviderDashboard /> : <Navigate to="/login" />} />
                <Route path="/SubmitOffer" element={isAuthenticated && userType === "provider" ? <SubmitOffer /> : <Navigate to="/login" />} />
                <Route path="/ViewOffers" element={isAuthenticated ? <ViewOffers /> : <Navigate to="/login" />} />
                <Route path="/EditProfile" element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} />
                <Route path="/Chat" element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} />
                <Route path="/RequestDetails/:requestId" element={isAuthenticated ? <RequestDetails /> : <Navigate to="/login" />} />
                <Route path="/Offering" element={isAuthenticated && userType === "provider" ? <Offerings /> : <Navigate to="/login" />} />
                <Route path="/ServiceChat/:chatId?" element={isAuthenticated ? <ServiceChat /> : <Navigate to="/login" />} />
                <Route path="/OfferDetails/:offerId" element={isAuthenticated ? <OfferDetails /> : <Navigate to="/login" />} />
                <Route path="/BookingDetails/:serviceId" element={isAuthenticated ? <BookingDetails /> : <Navigate to="/login" />} />
                <Route path="/ConfirmBooking/:bookingId" element={isAuthenticated ? <ConfirmBooking /> : <Navigate to="/login" />} />
                <Route path="/CompletedServices" element={isAuthenticated ? <CompletedServices /> : <Navigate to="/login" />} />
                <Route path="/MyServices" element={isAuthenticated && userType === "provider" ? <MyServices /> : <Navigate to="/login" />} />
                <Route path="/ServiceBookingDetails/:offerId" element={isAuthenticated && userType === "provider" ? <OfferRequests /> : <Navigate to="/login" />} />
                <Route path="/user-bookings" element={isAuthenticated && userType === "user" ? <UserBookings /> : <Navigate to="/login" />} />
                <Route path="/provider-bookings" element={isAuthenticated && userType === "provider" ? <ProviderBookings /> : <Navigate to="/login" />} />
                
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;