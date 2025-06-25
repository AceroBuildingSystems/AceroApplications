import mongoose from "mongoose"
import * as models from '@/models'

const MONGODB_URI = process.env.environment === 'production' 
  ? process.env.NEXT_PUBLIC_PROD_MONGODB_URI 
  : process.env.NEXT_PUBLIC_DEV_MONGODB_URI

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

    // Register all models before connecting
    Object.values(models).forEach(model => {
      if (model.modelName && !mongoose.models[model.modelName]) {
        model.init()
      }
    })

    // @ts-ignore
    cached.promise = await mongoose.connect(MONGODB_URI!, opts).then(() => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export { mongoose, dbConnect }
