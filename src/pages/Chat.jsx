import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isAssistantTyping, setIsAssistantTyping] = useState(false);
    const [allLoaded, setAllLoaded] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);

    // Predefined questions and responses
    const predefinedContent = {
        en: {
            questions: [
                "What services do you offer?",
                "How much does it cost?",
                "How can I book a service?",
                "What are your working hours?",
                "Do you offer emergency services?",
                "How long does a service usually take?",
                "What payment methods do you accept?"
            ],
            responses: {
                "What services do you offer?": "We offer home cleaning, plumbing, electrical repairs, appliance maintenance, painting, and gardening services.",
                "How much does it cost?": "Our services start from 50 SAR. Specific pricing depends on the service type and scope. We can provide a detailed quote after understanding your requirements.",
                "How can I book a service?": "You can book a service through our website, mobile app, or by calling our customer service at 800-123-4567.",
                "What are your working hours?": "We operate from 8:00 AM to 8:00 PM, seven days a week. Emergency services are available 24/7.",
                "Do you offer emergency services?": "Yes, we offer 24/7 emergency services for plumbing, electrical, and locksmith needs. Emergency services have a 15% premium on regular rates.",
                "How long does a service usually take?": "Service duration varies based on the type and complexity. Basic services typically take 1-2 hours, while more complex jobs may require 3-4 hours or more.",
                "What payment methods do you accept?": "We accept cash, credit/debit cards, bank transfers, and mobile payment solutions like Apple Pay and Google Pay."
            }
        },
        ar: {
            questions: [
                "ما هي الخدمات التي تقدمونها؟",
                "كم تكلفة الخدمة؟",
                "كيف يمكنني حجز خدمة؟",
                "ما هي ساعات العمل لديكم؟",
                "هل تقدمون خدمات طوارئ؟",
                "كم من الوقت تستغرق الخدمة عادة؟",
                "ما هي طرق الدفع المقبولة؟"
            ],
            responses: {
                "ما هي الخدمات التي تقدمونها؟": "نقدم خدمات تنظيف المنازل، السباكة، إصلاح الكهرباء، صيانة الأجهزة، الطلاء، وخدمات البستنة.",
                "كم تكلفة الخدمة؟": "تبدأ خدماتنا من 50 ريالاً. تعتمد الأسعار المحددة على نوع الخدمة ونطاقها. يمكننا تقديم عرض سعر مفصل بعد فهم متطلباتك.",
                "كيف يمكنني حجز خدمة؟": "يمكنك حجز خدمة من خلال موقعنا الإلكتروني، تطبيق الجوال، أو بالاتصال بخدمة العملاء على الرقم 4567-123-800.",
                "ما هي ساعات العمل لديكم؟": "نعمل من الساعة 8:00 صباحًا حتى 8:00 مساءً، طوال أيام الأسبوع. خدمات الطوارئ متاحة على مدار الساعة.",
                "هل تقدمون خدمات طوارئ؟": "نعم، نقدم خدمات طوارئ على مدار الساعة طوال أيام الأسبوع للسباكة والكهرباء وفتح الأقفال. تتضمن خدمات الطوارئ زيادة بنسبة 15% على الأسعار العادية.",
                "كم من الوقت تستغرق الخدمة عادة؟": "تختلف مدة الخدمة حسب النوع والتعقيد. تستغرق الخدمات الأساسية عادة من 1-2 ساعة، بينما قد تتطلب المهام الأكثر تعقيدًا 3-4 ساعات أو أكثر.",
                "ما هي طرق الدفع المقبولة؟": "نقبل الدفع النقدي، بطاقات الائتمان/الخصم، التحويلات المصرفية، وحلول الدفع عبر الجوال مثل Apple Pay و Google Pay."
            }
        }
    };

    // Add responsive check on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Function to show welcome message
    const showWelcomeMessage = () => {
        setIsAssistantTyping(true);
        setTimeout(() => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { 
                    username: "Assistant", 
                    text: "👋 Hello! I'm your service assistant. How can I help you today? You can select one of the suggested questions below.",
                    timestamp: formatTimestamp(), 
                    direction: "ltr"
                }
            ]);
            setIsAssistantTyping(false);
            setShowSuggestions(true);
            autoScroll();
        }, 1000);
    };

    useEffect(() => {
        // Fetch chat history
        setIsLoading(true);
        fetch("http://localhost:5003/api/chat-history?limit=10")
            .then((response) => response.json())
            .then((data) => {
                console.log("✅ Loaded latest messages:", data);
                setMessages(data);
                
                // Only show welcome message if no messages were retrieved and welcome message hasn't been shown
                if (data.length === 0 && !welcomeMessageShown) {
                    setTimeout(() => {
                        showWelcomeMessage();
                        setWelcomeMessageShown(true);
                    }, 500);
                } else {
                    // If messages exist, still show suggestions
                    setShowSuggestions(true);
                }
            })
            .catch((error) => {
                console.error("Error fetching chat history:", error);
                // Show welcome message on error as fallback only if it hasn't been shown
                if (!welcomeMessageShown) {
                    setTimeout(() => {
                        showWelcomeMessage();
                        setWelcomeMessageShown(true);
                    }, 500);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [welcomeMessageShown]);

    useEffect(() => {
        autoScroll();
    }, [messages]);

    const autoScroll = () => {
        const chatBox = document.getElementById("chatBox");
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    };

    const loadMoreMessages = () => {
        if (allLoaded) return;

        fetch(`http://localhost:5003/api/chat-history?limit=10&offset=${messages.length}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.length === 0) {
                    setAllLoaded(true);
                } else {
                    setMessages((prevMessages) => [...data, ...prevMessages]);
                }
            })
            .catch((error) => console.error("Error loading more messages:", error));
    };

    const formatTimestamp = () => {
        const now = new Date();
        return `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;
    };

    const detectLanguage = (message) => {
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(message) ? "ar" : "en";
    };

    const sendMessage = (messageText = inputMessage) => {
        if (!messageText.trim()) return;

        setIsSending(true);
        const userMessage = { username: "You", text: messageText, timestamp: formatTimestamp() };

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInputMessage("");

        // Assistant response logic
        setTimeout(() => {
            setIsAssistantTyping(true);
            
            const messageLang = detectLanguage(messageText);
            let responseText = "";
            
            // Check if the message is one of the predefined questions
            if (predefinedContent[messageLang].responses[messageText]) {
                responseText = predefinedContent[messageLang].responses[messageText];
            } else {
                // Default response if not a predefined question
                responseText = messageLang === "ar" 
                    ? "يرجى اختيار سؤال من القائمة أدناه لمساعدتك بشكل أفضل."
                    : "Please select a question from the list below to help you better.";
            }
            
            setTimeout(() => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { 
                        username: "Assistant", 
                        text: responseText, 
                        timestamp: formatTimestamp(), 
                        direction: messageLang === "ar" ? "rtl" : "ltr" 
                    }
                ]);
                setIsAssistantTyping(false);
                setShowSuggestions(true);
                autoScroll();
            }, 1000);
        }, 1000);
    };

    const handleSuggestionClick = (question) => {
        sendMessage(question);
    };

    const toggleLanguage = () => {
        // Determine current language from last assistant message
        const lastAssistantMsg = [...messages].reverse().find(msg => msg.username === "Assistant");
        const currentLang = lastAssistantMsg && lastAssistantMsg.direction === "rtl" ? "en" : "ar";
        
        // Send language switch message
        const switchMsg = currentLang === "ar" ? "تبديل اللغة إلى العربية" : "Switch language to English";
        
        setMessages((prevMessages) => [
            ...prevMessages,
            { 
                username: "You", 
                text: switchMsg, 
                timestamp: formatTimestamp()
            }
        ]);
        
        // Send assistant response
        setTimeout(() => {
            setIsAssistantTyping(true);
            setTimeout(() => {
                const responseText = currentLang === "ar" 
                    ? "تم تغيير اللغة إلى العربية. كيف يمكنني مساعدتك؟" 
                    : "Language changed to English. How can I help you?";
                
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { 
                        username: "Assistant", 
                        text: responseText, 
                        timestamp: formatTimestamp(), 
                        direction: currentLang === "ar" ? "rtl" : "ltr" 
                    }
                ]);
                setIsAssistantTyping(false);
                setShowSuggestions(true);
                autoScroll();
            }, 1000);
        }, 500);
    };

    if (isLoading) {
        return (
            <div style={styles.container}>
                <LoadingSpinner message="Loading chat history..." />
            </div>
        );
    }

    return (
        <div style={{
            ...styles.container, 
            width: isMobile ? '100%' : '600px',
            padding: isMobile ? '10px' : '20px',
            maxWidth: '100%'
        }}>
            <h2 style={styles.responsiveHeading}>Service Chat</h2>

            {!allLoaded && messages.length > 10 && (
                <button 
                    onClick={loadMoreMessages} 
                    style={{
                        ...styles.loadMoreButton,
                        width: isMobile ? '100%' : 'auto'
                    }}
                >
                    Load More Messages
                </button>
            )}

            <div 
                id="chatBox" 
                style={{
                    ...styles.chatBox,
                    height: isMobile ? '300px' : '400px',
                    width: isMobile ? '100%' : '100%'
                }}
            >
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        style={{
                            ...(msg.username === "Assistant" ? styles.assistantMessage : styles.userMessage),
                            direction: msg.direction || "ltr",
                            maxWidth: isMobile ? '90%' : '80%',
                            alignSelf: msg.username === "Assistant" ? 'flex-start' : 'flex-end'
                        }}
                    >
                        <strong>{msg.username}: </strong> {msg.text}
                        <span style={styles.timestamp}>{msg.timestamp}</span>
                    </div>
                ))}
                {isAssistantTyping && <div style={styles.typingIndicator}>Assistant is typing...</div>}
            </div>

            {showSuggestions && (
                <div 
                    style={{
                        ...styles.suggestionsContainer,
                        width: isMobile ? '100%' : '100%'
                    }}
                >
                    <p style={styles.suggestionsTitle}>
                        {detectLanguage(messages[messages.length - 1]?.text || "") === "ar" 
                            ? "اختر سؤالاً:" 
                            : "Choose a question:"}
                    </p>
                    <div 
                        style={{
                            ...styles.suggestions,
                            flexDirection: isMobile ? 'column' : 'column'
                        }}
                    >
                        {predefinedContent[detectLanguage(messages[messages.length - 1]?.text || "") === "ar" ? "ar" : "en"].questions.map((question, index) => (
                            <button 
                                key={index} 
                                onClick={() => handleSuggestionClick(question)}
                                style={{
                                    ...styles.suggestionButton,
                                    width: isMobile ? '100%' : '100%'
                                }}
                            >
                                {question}
                            </button>
                        ))}
                        <button 
                            onClick={toggleLanguage}
                            style={{
                                ...styles.suggestionButton, 
                                backgroundColor: "#555",
                                width: isMobile ? '100%' : '100%'
                            }}
                        >
                            {detectLanguage(messages[messages.length - 1]?.text || "") === "ar" 
                                ? "Switch to English" 
                                : "تغيير إلى العربية"}
                        </button>
                    </div>
                </div>
            )}

            <div 
                style={{
                    ...styles.inputContainer,
                    flexDirection: isMobile ? 'column' : 'row'
                }}
            >
                <input
                    type="text"
                    placeholder="Please use the suggested questions..."
                    value={inputMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && inputMessage.trim()) {
                            sendMessage();
                        }
                    }}
                    style={{
                        ...styles.input,
                        width: isMobile ? '100%' : '80%',
                        marginBottom: isMobile ? '10px' : '0'
                    }}
                    disabled={true}
                />
                <button 
                    onClick={() => sendMessage()} 
                    disabled={true} 
                    style={{
                        ...styles.sendButton, 
                        opacity: 0.5, 
                        cursor: "not-allowed",
                        width: isMobile ? '100%' : 'auto'
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        width: "100%",
        maxWidth: "100%",
        margin: "auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        textAlign: "center",
        paddingTop: "60px", 
        boxSizing: "border-box",
        marginTop: "100px"
    },
    responsiveHeading: {
        fontSize: "1.5rem",
        marginBottom: "15px"
    },
    chatBox: {
        height: "400px",
        overflowY: "auto",
        padding: "10px",
        border: "1px solid #ddd",
        marginBottom: "10px",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box"
    },
    loadMoreButton: {
        backgroundColor: "#0056b3",
        color: "#fff",
        padding: "8px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginBottom: "10px",
        transition: "0.3s",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#0056b3",
        color: "white",
        padding: "10px",
        borderRadius: "10px",
        marginBottom: "5px",
        maxWidth: "80%",
        textAlign: "left",
    },
    assistantMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#E3F2FD",
        padding: "10px",
        borderRadius: "10px",
        marginBottom: "5px",
        maxWidth: "80%",
        textAlign: "left",
        whiteSpace: "pre-wrap",
    },
    timestamp: {
        fontSize: "12px",
        color: "gray",
        marginLeft: "10px",
    },
    inputContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "10px",
    },
    input: {
        flex: 1,
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        marginRight: "10px",
    },
    sendButton: {
        backgroundColor: "#0056b3",
        color: "white",
        padding: "10px 15px",
        fontSize: "16px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    typingIndicator: {
        fontStyle: "italic",
        color: "gray",
        marginTop: "5px",
        textAlign: "left",
        paddingLeft: "10px",
    },
    suggestionsContainer: {
        marginTop: "10px",
        marginBottom: "15px",
        width: "100%",
        backgroundColor: "#f0f0f0",
        padding: "10px",
        borderRadius: "5px",
    },
    suggestionsTitle: {
        margin: "0 0 10px 0",
        fontWeight: "bold",
        textAlign: "left",
    },
    suggestions: {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "8px",
    },
    suggestionButton: {
        backgroundColor: "#0056b3",
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        textAlign: "left",
        transition: "background-color 0.2s",
    },
};

export default Chat;