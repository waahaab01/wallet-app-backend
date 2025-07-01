const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Initialize environment variables
dotenv.config();
// Connect Database
connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
