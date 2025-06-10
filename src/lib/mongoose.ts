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

    // Register all models by ensuring their modules are loaded.
    // The `import * as models from '@/models'` above, which imports `src/models/index.ts`,
    // should trigger the mongoose.model() calls in each model file, registering them.
    // The loop below can serve as an explicit way to iterate and ensure they are 'touched',
    // but the .init() call was non-standard and potentially problematic.
    Object.values(models).forEach(model => {
      // Accessing model properties like model.modelName (if they exist and are consistent)
      // or simply iterating through the imported 'models' object values ensures that Node.js
      // evaluates each model file. This, in turn, executes the mongoose.model() call within them,
      // which is the standard way Mongoose registers models.
      // If a model is correctly defined and exported via src/models/index.ts,
      // this loop helps ensure it's loaded.
      if (model && typeof model.modelName === 'string' && !mongoose.models[model.modelName]) {
        // This condition means a module was loaded, it appears to be a Mongoose model (has .modelName),
        // but it's not yet in mongoose.models. This is highly unlikely if the model file itself
        // calls mongoose.model('ModelName', schema) correctly, as that call registers it.
        // console.warn(`Model ${model.modelName} (from models object) was not found in mongoose.models. This is unexpected.`);
      }
    });

    // @ts-ignore
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(() => {
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
