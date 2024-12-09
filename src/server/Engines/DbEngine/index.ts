import { MongooseAdapter } from './Mongoose.adapter';
import { User } from '@/models'; // Adjust import path as needed

// Singleton instance tracker
let dbEngineInstance: MongooseAdapter | null = null;

function getMongooseAdapter(): MongooseAdapter {
  if (!dbEngineInstance) {
    dbEngineInstance = new MongooseAdapter({
      User:User as any
    });
  }
  return dbEngineInstance;
}

export const dbEngine = {
    mongooose:getMongooseAdapter()
};
