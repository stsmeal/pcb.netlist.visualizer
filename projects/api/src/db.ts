import mongoose, { Connection, ConnectOptions } from 'mongoose';
import { config } from './config';

export const connectDb = (): Connection => {
  return mongoose.createConnection(`mongodb://${config.connectionString}`, <
    ConnectOptions
  >{
    dbName: config.dbName,
    serverSelectionTimeoutMS: 5000, // Give up initial connection after 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 1, // Maintain a minimum of 1 socket connection
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  });
};
