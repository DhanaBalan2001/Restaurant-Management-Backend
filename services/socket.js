import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Kitchen connected:', socket.id);

    socket.on('joinKitchen', (branchId) => {
      socket.join(`kitchen_${branchId}`);
      console.log(`Joined kitchen room: kitchen_${branchId}`);
    });

    socket.on('orderStatusUpdate', (data) => {
      io.to(`kitchen_${data.branchId}`).emit('statusUpdated', data);
    });

    socket.on('newOrder', (order) => {
      console.log('New order received:', order);
      displayNewOrder(order);
      playAlertSound();
    });

    socket.on('orderStatusChanged', (update) => {
      console.log('Order status updated:', update);
      updateOrderStatus(update);
    });

    socket.on('disconnect', () => {
      console.log('Kitchen disconnected:', socket.id);
    });
  });

  return io;
};

export const notifyKitchen = (order) => {
  io.emit('newOrder', {
    orderId: order._id,
    items: order.items,
    status: order.status,
    timestamp: new Date(),
    priority: order.priority || 'normal'
  });
};

export const notifyOrderUpdate = (orderId, status) => {
  io.emit('orderStatusChanged', {
    orderId,
    status,
    updatedAt: new Date()
  });
};