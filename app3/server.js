// server.js
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDatabase = require('./db/db');
const tokenValidator = require('./middleware/tokenValidator');
const testRoutes = require('./routes/testRoutes');
const cors = require('cors');

const app = express();
// app.use(cors());
app.use(
    cors({
      origin: "*",
      credentials: true, 
    })
);

app.use(express.json());
app.use(cookieParser());

connectDatabase();

app.use(tokenValidator); 

app.use('/api', testRoutes);

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
