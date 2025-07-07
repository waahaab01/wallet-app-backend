const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');



// Initialize environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON body


// Test route
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandler);

module.exports = app;
