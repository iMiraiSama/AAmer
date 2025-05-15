import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './ServiceChat.css';

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

const extractNameFromEmail = (email) => {
  if (!email) return '';
  return email.split('@')[0];
};

const ChatList = ({ chats, onSelectChat, activeChat }) => {
  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Chats</h2>
      </div>
      {chats.length === 0 ? (
        <div className="no-chats">No chats available</div>
      ) : (
        chats.map(chat => (
          <div 
            key={chat._id} 
            onClick={() => onSelectChat(chat)}
            className={`chat-list-item ${activeChat?._id === chat._id ? 'active-chat' : ''}`}
          >
            <div className="chat-list-item-content">
              <h3>{extractNameFromEmail(chat.providerUserId?.email || chat.userId?.email)}</h3>
              <p>Direct Chats</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const ChatWindow = ({ selectedChat, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      console.log(selectedChat)
    }
  }, [selectedChat]);

  const fetchMessages = async (chatId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5003/api/message/get-messages/${chatId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      let response = "";
      if (userType == 'user'){
        response = await fetch('http://localhost:5003/api/message/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          message: inputMessage,
          senderId: localStorage.getItem('userId'),
          receiverId: selectedChat.providerUserId
        })
      });
    }
    else{
        response = await fetch('http://localhost:5003/api/message/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          message: inputMessage,
          receiverId: selectedChat.userId._id,
          senderId: selectedChat.providerUserId
        })
      });
    }

      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!selectedChat) return null;

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-window-header">
        <div className="chat-window-header-info">
          <h2>Chat with {extractNameFromEmail(selectedChat.providerUserId?.email || selectedChat.userId?.email)}</h2>
          <span>Active</span>
        </div>
        <button 
          onClick={onClose} 
          className="close-button"
        >
          ✕
        </button>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.senderId === userId ? 'user-message' : 'other-message'}`}
            >
              <div className="message-content">
                {msg.message}
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <input 
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="message-input"
        />
        <button 
          onClick={sendMessage}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// Main Chat Application
const ChatApplication = () => {
  const [chats, setChats] = useState([]);
  
  const [selectedChat, setSelectedChat] = useState();

  const { chatId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const contactUserId = searchParams.get('userId');
    if(chatId){
      setSelectedChat({
        _id: chatId,
        userId: null,
        providerUserId: localStorage.getItem('userId')
      })
    }
    if (contactUserId) {
      initiateChat(contactUserId);
    } else {
      fetchChats();
    }
  }, [location.search]);

  const initiateChat = async (contactUserId) => {
    try {
      if (userType === 'provider'){
        setIsLoading(true);
        const response = await fetch('http://localhost:5003/api/chat/initiate-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: contactUserId,
            providerUserId: localStorage.getItem('userId')
          })
        });
        const chatData = await response.json();
        // Fetch chats to update the list
        await fetchChats();
        
        // Select the newly created chat
        setSelectedChat({
          _id: chatData._id,
          userId: contactUserId,
          providerUserId: localStorage.getItem('userId')
        });
        console.log(providerUserId)
      }
      else {
        setIsLoading(true);
        const response = await fetch('http://localhost:5003/api/chat/initiate-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: localStorage.getItem('userId'),
            providerUserId: contactUserId
          })
        });
        const chatData = await response.json();
        // Fetch chats to update the list
        await fetchChats();
        
        // Select the newly created chat
        setSelectedChat({
          _id: chatData._id,
          userId: contactUserId,
          providerUserId: localStorage.getItem('userId')
        });
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      if (userType === 'provider') {
        const response = await fetch(`http://localhost:5003/api/chat/get-chats/${localStorage.getItem('userId')}/provider`);
        const data = await response.json();
        setChats(data);
      }
      else {
        const response = await fetch(`http://localhost:5003/api/chat/get-chats/${localStorage.getItem('userId')}/user`);
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-application">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ChatList 
            chats={chats} 
            onSelectChat={setSelectedChat}
            activeChat={selectedChat}
          />
          {selectedChat ? (
            <ChatWindow 
              selectedChat={selectedChat} 
              onClose={() => setSelectedChat(null)} 
            />
          ) : (
            <div className="no-chat-selected">
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatApplication;