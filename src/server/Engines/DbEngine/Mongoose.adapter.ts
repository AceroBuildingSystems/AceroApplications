import { ERROR } from '@/shared/constants';
import { SUCCESS } from '@/shared/constants';
import { DatabaseAdapter, FindOptions, CreateOptions, UpdateOptions, DeleteOptions } from './types';
import { QueryResult } from './types';
import { Model, Document } from 'mongoose';

interface MultiQuery {
  action: 'find' | 'create' | 'update' | 'delete';
  modelName: string;
  options: FindOptions | CreateOptions | UpdateOptions | DeleteOptions;
}

export class MongooseAdapter implements DatabaseAdapter {
  private models: { [key: string]: Model<Document> };

  /**
   * Example usage:
   * const adapter = new MongooseAdapter({
   *   User: UserModel,
   *   Order: OrderModel,
   *   Product: ProductModel
   * });
   */
  constructor(models: { [key: string]: Model<Document> }) {
    this.models = models;
  }

  /**
   * Find documents with advanced querying options
   * 
   * Example usage:
   * const result = await adapter.find('User', {
   *   // Basic filter
   *   filter: { age: { $gt: 18 } },
   *   
   *   // Search functionality
   *   searchTerm: "john",
   *   searchFields: ["firstName", "lastName", "email"],
   *   
   *   // Get distinct values
   *   distinct: "role",
   *   
   *   // Sorting
   *   sort: { createdAt: "desc", lastName: "asc" },
   *   
   *   // Field selection
   *   select: ["firstName", "lastName", "email", "role"],
   *   
   *   // Populate relations
   *   populate: ["orders", "profile"],
   *   
   *   // Pagination
   *   page: 1,
   *   limit: 10
   * });
   */
  async find(modelName: string, options: FindOptions): Promise<QueryResult> {
    const model = this.models[modelName];
    if (!model) return { status: ERROR, message: `Model ${modelName} not found` };

    let query = model.find(options.filter || {});

    // Search
    if (options.searchTerm && options.searchFields && options.searchFields.length > 0) {
      const searchConditions = options.searchFields.map(field => ({
        [field]: { $regex: options.searchTerm, $options: 'i' }
      }));
      query = query.or(searchConditions);
    }

    // Distinct
    if (options.distinct) {
      const distinctValues = await model.distinct(options.distinct, options.filter);
      return {
        status: SUCCESS,
        data: distinctValues,
        pagination: {
          total: distinctValues.length,
          page: 1,
          limit: distinctValues.length,
          pages: 1
        }
      };
    }

    // Sorting
    if (options.sort) {
      const sortObj: any = {};
      for (const k in options.sort) {
        sortObj[k] = options.sort[k] === 'asc' ? 1 : -1;
      }
      query = query.sort(sortObj);
    }

    // Select
    if (options.select && options.select.length > 0) {
      query = query.select(options.select.join(' '));
    }

    // Populate
    if (options.populate && options.populate.length > 0) {
        // If populate options are explicitly given, use them
        options.populate.forEach(p => {
          query = query.populate(p);
        });
      } else {
        // Auto-populate all ref fields
        const modelPaths = model.schema.paths;
        const populateFields = Object.keys(modelPaths)
          .filter(path => modelPaths[path].options && modelPaths[path].options.ref)
          .map(path => ({ path }));
    
        if (populateFields.length > 0) {
        query = query.populate(populateFields);
      }
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const countQuery = model.countDocuments(options.filter || {});
    query = query.skip(skip).limit(limit);

    const [docs, total] = await Promise.all([query.exec(), countQuery]);

    return {
      status: SUCCESS,
      data: docs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create a new document
   * 
   * Example usage:
   * const result = await adapter.create('User', {
   *   data: {
   *     firstName: "John",
   *     lastName: "Doe",
   *     email: "john@example.com",
   *     age: 25,
   *     role: "user"
   *   }
   * });
   */
  async create(modelName: string, options: CreateOptions): Promise<QueryResult> {
    const model = this.models[modelName];
    if (!model) return { status: ERROR, message: `Model ${modelName} not found` };

    const doc = await model.create(options.data);
    if (!doc) return { status: ERROR, message: 'Failed to create document' };

    return { status: SUCCESS, data: doc };
  }

  /**
   * Update documents matching a filter
   * 
   * Example usage:
   * const result = await adapter.update('User', {
   *   filter: { email: "john@example.com" },
   *   data: {
   *     age: 26,
   *     lastName: "Smith",
   *     lastUpdated: new Date()
   *   }
   * });
   */
  async update(modelName: string, options: UpdateOptions): Promise<QueryResult> {
    const model = this.models[modelName];
    if (!model) return { status: ERROR, message: `Model ${modelName} not found` };

    const doc = await model.findOneAndUpdate(options.filter || {}, options.data, { new: true, runValidators: true });
    if (!doc) return { status: ERROR, message: 'Document not found' };

    return { status: SUCCESS, data: doc };
  }

  /**
   * Delete documents matching a filter
   * 
   * Example usage:
   * const result = await adapter.delete('User', {
   *   filter: { 
   *     age: { $lt: 18 },
   *     status: 'inactive'
   *   }
   * });
   */
  async delete(modelName: string, options: DeleteOptions): Promise<QueryResult> {
    const model = this.models[modelName];
    if (!model) return { status: ERROR, message: `Model ${modelName} not found` };

    const result = await model.deleteMany(options.filter || {});
    return {
      status: SUCCESS,
      data: { deletedCount: result.deletedCount }
    };
  }

  /**
   * Run multiple operations in parallel
   * 
   * Example usage:
   * const results = await adapter.runMultiple([
   *   {
   *     action: 'find',
   *     modelName: 'User',
   *     options: {
   *       filter: { role: 'admin' },
   *       select: ['email', 'firstName']
   *     }
   *   },
   *   {
   *     action: 'create',
   *     modelName: 'Order',
   *     options: {
   *       data: { 
   *         userId: '123',
   *         total: 99.99,
   *         items: ['item1', 'item2']
   *       }
   *     }
   *   },
   *   {
   *     action: 'update',
   *     modelName: 'Product',
   *     options: {
   *       filter: { id: 'prod123' },
   *       data: { stock: 50 }
   *     }
   *   }
   * ]);
   */
  async runMultiple(queries: MultiQuery[]): Promise<QueryResult[]> {
    const results = await Promise.all(
      queries.map(async q => {
        switch (q.action) {
          case 'find':
            return this.find(q.modelName, q.options as FindOptions);
          case 'create':
            return this.create(q.modelName, q.options as CreateOptions);
          case 'update':
            return this.update(q.modelName, q.options as UpdateOptions);
          case 'delete':
            return this.delete(q.modelName, q.options as DeleteOptions);
          default:
            return { status: ERROR, message: `Unknown action ${q.action}` };
        }
      })
    );

    return results;
  }
}
