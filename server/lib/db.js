const mongoose = require('mongoose');

async function connectDB() {
  // Use localhost instead of 127.0.0.1 for better compatibility
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cardhavi';
  
  // Enable Mongoose debug mode
  mongoose.set('debug', true);
  
  // Connection options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    socketTimeoutMS: 45000, // 45 seconds before timing out
  };

  console.log('Attempting to connect to MongoDB at:', uri);

  let attempt = 0;
  const maxDelay = 30000; // 30s cap

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(uri, options);
      console.log('✅ MongoDB connected successfully');

      // Log successful connection
      mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to DB');
      });

      // Log connection errors after initial connection
      mongoose.connection.on('error', (err) => {
        console.error('Mongoose connection error:', err);
      });

      // Auto-retry when disconnected
      mongoose.connection.on('disconnected', () => {
        console.warn('Mongoose disconnected — retrying connection...');
        attempt = 0; // reset for backoff
        setTimeout(connectWithRetry, 1000);
      });

      return mongoose.connection;
    } catch (err) {
      attempt += 1;
      const delay = Math.min(1000 * Math.pow(2, attempt), maxDelay);
      console.error(`❌ MongoDB connection error (attempt ${attempt}):`, err.message);
      console.error('Retrying in', Math.round(delay / 1000), 'seconds...');
      setTimeout(connectWithRetry, delay);
      return null;
    }
  };

  return connectWithRetry();
}

module.exports = connectDB;
