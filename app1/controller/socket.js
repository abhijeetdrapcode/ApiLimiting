const generateToken = require('../middleware/tokenGenerator');

const socketHandler = (io) => {
  const payload = process.env.PAYLOAD;
  const secret = process.env.SECRET;

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('buttonClick', (data) => {
      console.log('Button clicked:', data.buttonId);
      const newToken = generateToken(payload, secret); 
      io.emit('newToken', { token: newToken });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = socketHandler;
