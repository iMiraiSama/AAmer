import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Homepage({ onLogout }) {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem("token") !== null;
    const userType = localStorage.getItem("userType");

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.heroSection}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={styles.heroContent}
                >
                    <h1 style={styles.title}>Welcome to AAMER</h1>
                    <p style={styles.subtitle}>Connecting users with top service providers seamlessly.</p>
                    <div style={styles.buttonContainer}>
                        {!isAuthenticated ? (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/signup")}
                                    style={styles.buttonPrimary}
                                >
                                    Get Started
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/login")}
                                    style={styles.buttonSecondary}
                                >
                                    Login
                                </motion.button>
                            </>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(userType === "user" ? "/userdashboard" : "/providerdashboard")}
                                style={styles.buttonPrimary}
                            >
                                Go to Dashboard
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>

            <div style={styles.featuresSection}>
                <h2 style={styles.sectionTitle}>Why Choose AAMER?</h2>
                <div style={styles.featuresGrid}>
                    <motion.div
                        whileHover={{ y: -10 }}
                        style={styles.featureCard}
                    >
                        <div style={styles.featureIcon}>🔒</div>
                        <h3 style={styles.featureTitle}>Secure Platform</h3>
                        <p style={styles.featureText}>Your data is protected with industry-standard security measures</p>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -10 }}
                        style={styles.featureCard}
                    >
                        <div style={styles.featureIcon}>⭐</div>
                        <h3 style={styles.featureTitle}>Verified Providers</h3>
                        <p style={styles.featureText}>All service providers are thoroughly vetted and verified</p>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -10 }}
                        style={styles.featureCard}
                    >
                        <div style={styles.featureIcon}>💬</div>
                        <h3 style={styles.featureTitle}>24/7 Support</h3>
                        <p style={styles.featureText}>Round-the-clock customer support for your convenience</p>
                    </motion.div>
                </div>
            </div>
            
            {/* <div style={styles.servicesSection}>
                <h2 style={styles.sectionTitle}>Explore Our Provider Products</h2>
                <div style={styles.serviceGrid}>
                    <motion.div
                        whileHover={{ y: -10, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                        style={styles.serviceCard}
                    >
                        <img src="/sketch_dress.jpg" alt="Elegant Dresses" style={styles.serviceImage} />
                        <h3 style={styles.serviceTitle}>Elegant Dresses</h3>
                        <p style={styles.serviceCardText}>اكتشف أحدث تصاميم الفساتين التي تناسب جميع المناسبات.</p>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -10, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                        style={styles.serviceCard}
                    >
                        <img src="/sketch_clothes.jpg" alt="Trendy Clothes" style={styles.serviceImage} />
                        <h3 style={styles.serviceTitle}>Trendy Clothes</h3>
                        <p style={styles.serviceCardText}>ملابس عصرية بأحدث الصيحات العالمية، مثالية لكل الأذواق.</p>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -10, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                        style={styles.serviceCard}
                    >
                        <img src="/sketch_vacuum.jpg" alt="Smart Vacuums" style={styles.serviceImage} />
                        <h3 style={styles.serviceTitle}>Smart Vacuums</h3>
                        <p style={styles.serviceCardText}>مكانس كهربائية ذكية لتنظيف أسرع وأكثر كفاءة.</p>
                    </motion.div>
                    <motion.div
                        whileHover={{ y: -10, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                        style={styles.serviceCard}
                    >
                        <img src="/sketch_laptop.jpg" alt="High-Performance Laptops" style={styles.serviceImage} />
                        <h3 style={styles.serviceTitle}>High-Performance Laptops</h3>
                        <p style={styles.serviceCardText}>أجهزة لابتوب بأداء قوي لمساعدتك في العمل والدراسة.</p>
                    </motion.div>
                </div>
            </div> */}

            <div style={styles.ctaSection}>
                <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
                <p style={styles.ctaText}>Join thousands of satisfied customers who trust AAMER for their service needs.</p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/signup")}
                    style={styles.ctaButton}
                >
                    Create Your Account
                </motion.button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#ffffff",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: "hidden",
    },
    heroSection: {
        width: "100%",
        minHeight: "80vh",
        background: "linear-gradient(135deg, #0056b3 0%, #007bff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 5%",
        position: "relative",
        overflow: "hidden",
    },
    heroContent: {
        textAlign: "center",
        color: "#ffffff",
        maxWidth: "800px",
        zIndex: 1,
    },
    logo: {
        width: "180px",
        height: "auto",
        marginBottom: "40px",
        dislay: "none",
    },
    title: {
        fontSize: "clamp(2.5rem, 5vw, 4rem)",
        fontWeight: "800",
        margin: "0 0 20px",
        lineHeight: 1.2,
        background: "linear-gradient(to right, #ffffff, #e0e0e0)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    subtitle: {
        fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
        color: "rgba(255, 255, 255, 0.9)",
        margin: "0 0 40px",
        lineHeight: 1.6,
    },
    buttonContainer: {
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    buttonPrimary: {
        backgroundColor: "#ffffff",
        color: "#0056b3",
        padding: "16px 40px",
        fontSize: "1.1rem",
        borderRadius: "50px",
        cursor: "pointer",
        fontWeight: "600",
        border: "none",
        transition: "all 0.3s ease-in-out",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    },
    buttonSecondary: {
        backgroundColor: "transparent",
        color: "#ffffff",
        padding: "16px 40px",
        fontSize: "1.1rem",
        borderRadius: "50px",
        cursor: "pointer",
        fontWeight: "600",
        border: "2px solid #ffffff",
        transition: "all 0.3s ease-in-out",
    },
    featuresSection: {
        width: "100%",
        padding: "80px 5%",
        background: "#f8f9fa",
    },
    featuresGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 0",
    },
    featureCard: {
        background: "#ffffff",
        padding: "30px",
        borderRadius: "15px",
        textAlign: "center",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease-in-out",
    },
    featureIcon: {
        fontSize: "2.5rem",
        marginBottom: "20px",
    },
    featureTitle: {
        fontSize: "1.5rem",
        fontWeight: "600",
        color: "#0056b3",
        margin: "0 0 15px",
    },
    featureText: {
        fontSize: "1rem",
        color: "#666666",
        lineHeight: 1.6,
    },
    servicesSection: {
        width: "100%",
        padding: "80px 5%",
        background: "#ffffff",
    },
    sectionTitle: {
        fontSize: "clamp(2rem, 4vw, 2.5rem)",
        fontWeight: "700",
        color: "#0056b3",
        marginBottom: "40px",
        textAlign: "center",
    },
    serviceGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    serviceCard: {
        background: "#ffffff",
        padding: "20px",
        borderRadius: "15px",
        textAlign: "center",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease-in-out",
    },
    serviceImage: {
        width: "100%",
        height: "200px",
        objectFit: "cover",
        borderRadius: "10px",
        marginBottom: "20px",
    },
    serviceTitle: {
        fontSize: "1.2rem",
        fontWeight: "600",
        color: "#0056b3",
        margin: "0 0 10px",
    },
    serviceCardText: {
        color: "#666666",
        fontSize: "1rem",
        lineHeight: 1.6,
    },
    ctaSection: {
        width: "100%",
        padding: "80px 5%",
        background: "linear-gradient(135deg, #0056b3 0%, #007bff 100%)",
        textAlign: "center",
        color: "#ffffff",
    },
    ctaTitle: {
        fontSize: "clamp(2rem, 4vw, 2.5rem)",
        fontWeight: "700",
        margin: "0 0 20px",
    },
    ctaText: {
        fontSize: "1.2rem",
        color: "rgba(255, 255, 255, 0.9)",
        margin: "0 0 40px",
        maxWidth: "600px",
    },
    ctaButton: {
        backgroundColor: "#ffffff",
        color: "#0056b3",
        padding: "16px 40px",
        fontSize: "1.1rem",
        borderRadius: "50px",
        cursor: "pointer",
        fontWeight: "600",
        border: "none",
        transition: "all 0.3s ease-in-out",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    },
};

export default Homepage;
