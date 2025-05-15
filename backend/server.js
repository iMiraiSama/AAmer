import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import Redis from 'ioredis';
import compression from 'compression';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import offeringRoutes from './routes/offeringRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config(); // ✅ تحميل المتغيرات البيئية من `.env`

const app = express();
const server = http.createServer(app);
// const io = new Server(server, {
//     cors: { origin: "*", methods: ["GET", "POST"] }
// });

app.use(express.json());
app.use(cors());

// const redis = new Redis();
// app.use(compression());

// Routes (API Endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/offering', offeringRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

//Mongodb connection

const MONGO_URI = 'mongodb+srv://aamerapp1:Aammer@cluster0.sstdt.mongodb.net/serviceProviderDB?retryWrites=true&w=majority';

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');

    //Reduce Middleware Overhead
    app.use('/api', express.json(), cors()); // Apply only to API routes

    // Optimize MongoDB Queries with Indexing
    // To speed up queries:
    // ServiceRequest.collection.createIndex({ title: 1 });
    // Offer.collection.createIndex({ requestId: 1 });
    // Message.collection.createIndex({ sender: 1, receiver: 1 });
  })
  .catch(err => console.error('MongoDB connection error:', err));

  const PORT = process.env.PORT || 5003;
  server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

export { app, server };

  
  // Store connected users
  const users = {};
  
  // io.on('connection', (socket) => {
  //   console.log('New client connected');
  
  //   // User registration
  //   socket.on('register', (username) => {
  //     users[socket.id] = username;
      
  //     // Broadcast new user connection
  //     io.emit('user_connected', {
  //       username: username,
  //       id: socket.id
  //     });
  //   });
  
  //   // Sending a message
  //   socket.on('send_message', (message, callback) => {
  //     // Broadcast message to all connected clients
  //     io.emit('receive_message', {
  //       ...message,
  //       senderId: socket.id
  //     });
  
  //     // Acknowledge message receipt
  //     callback({ status: 'ok' });
  //   });
  
  //   // Typing indicators
  //   socket.on('user_typing', (username) => {
  //     socket.broadcast.emit('user_typing', username);
  //   });
  
  //   socket.on('user_stopped_typing', () => {
  //     socket.broadcast.emit('user_stopped_typing');
  //   });
  
  //   // Handle disconnection
  //   socket.on('disconnect', () => {
  //     const username = users[socket.id];
  //     delete users[socket.id];
      
  //     if (username) {
  //       io.emit('user_disconnected', {
  //         username: username,
  //         id: socket.id
  //       });
  //     }
  //   });
  // });