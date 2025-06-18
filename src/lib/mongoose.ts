import mongoose from "mongoose"
import * as models from '@/models'

const MONGODB_URI = process.env.environment === 'production' 
  ? process.env.NEXT_PUBLIC_PROD_MONGODB_URI 
  : process.env.NEXT_PUBLIC_DEV_MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Check your environment variables.');
  throw new Error('MONGODB_URI is not set.');
}

// Log the MongoDB URI (mask password for safety)
try {
  const uriToLog = MONGODB_URI.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@)/, '$1****$2');
  console.log('Connecting to MongoDB URI:', uriToLog);
} catch (e) {
  console.log('Connecting to MongoDB URI (could not mask password):', MONGODB_URI);
}

// Define types for global mongoose cache
declare global {
  var mongoose: {
    Types: any; 
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  }
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { 
    Types: mongoose.Types,
    conn: null, 
    promise: null 
  }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    // Register all models by ensuring their modules are loaded.
    Object.values(models).forEach(model => {
      if (model && typeof model.modelName === 'string' && !mongoose.models[model.modelName]) {
        // This condition means a module was loaded, it appears to be a Mongoose model (has .modelName),
        // but it's not yet in mongoose.models. This is highly unlikely if the model file itself
        // calls mongoose.model('ModelName', schema) correctly, as that call registers it.
        // console.warn(`Model ${model.modelName} (from models object) was not found in mongoose.models. This is unexpected.`);
      }
    });

    // Assign the promise directly, do not await here
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => mongoose)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.conn = null
    cached.promise = null
    throw e
  }

  return cached.conn
}

export { mongoose, dbConnect }
