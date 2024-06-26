require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const tokenValidator = require('./middleware/tokenValidator');
const testRoutes = require('./routes/testRoutes');
const cors = require('cors');

const app = express();

app.use(
    cors({
      origin: "*",
      credentials: true,

    })
);

app.use(express.json());
app.use(cookieParser());

app.use(tokenValidator); 
app.use('/api', testRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
