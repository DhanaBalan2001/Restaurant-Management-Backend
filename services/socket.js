import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      // Allow all origins
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const notifyKitchen = (order) => {
  const io = getIO();
  io.to('kitchen').emit('new_order', {
    id: order._id,
    items: order.items,
    status: order.status,
    createdAt: order.createdAt
  });
};

export const notifyOrderUpdate = (orderId, status) => {
  const io = getIO();
  io.emit('order_update', {
    id: orderId,
    status,
    updatedAt: new Date()
  });
};