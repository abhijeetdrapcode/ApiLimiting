const generateToken = require('../middleware/tokenGenerator');

const socketHandler = (io) => {

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('buttonClick', (data) => {
      console.log('Button clicked:', data.buttonId);
      const newToken = generateToken(); 
      io.emit('newToken', { token: newToken });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = socketHandler;
