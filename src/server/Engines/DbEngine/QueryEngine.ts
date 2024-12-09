import { DSLQuery, QueryResult } from './types';
import { DatabaseAdapter } from './types';
import { buildFilter } from './filterBuilder';
import { ERROR } from '@/shared/constants';

export class QueryEngine {
  private adapters: { [key: string]: DatabaseAdapter };

  constructor(adapters: { [key: string]: DatabaseAdapter }) {
    this.adapters = adapters;
  }

  async run(query: DSLQuery): Promise<QueryResult> {
    const { database, model, action = 'find' } = query;
    const adapter = this.adapters[database];
    if (!adapter) return { status: ERROR, message: `Database adapter ${database} not found` };

    const filter = query.conditions ? buildFilter(query.conditions) : {};

    switch (action) {
      case 'find':
        return adapter.find(model, {
          filter,
          select: query.select,
          sort: query.sort,
          limit: query.limit,
          page: query.page,
          distinct: query.distinct,
          searchTerm: query.searchTerm,
          searchFields: query.searchFields,
          populate: query.populate
        });
      case 'create':
        return adapter.create(model, { data: query.data });
      case 'update':
        return adapter.update(model, { filter, data: query.data });
      case 'delete':
        return adapter.delete(model, { filter });
      default:
        return { status: ERROR, message: `Unknown action ${action}` };
    }
  }

  /**
   * Run a pipeline of queries in sequence. 
   * Each query can use placeholders referencing previous results.
   * 
   * Example usage:
   * const pipeline = [
   *   {
   *     stepName: 'findUser',
   *     database: 'mongo',
   *     model: 'User',
   *     action: 'find',
   *     conditions: [
   *       { field: 'age', operator: '>', value: 30 }
   *     ],
   *     select: ['username', 'age'],
   *     limit: 1
   *   },
   *   {
   *     stepName: 'findOrders', 
   *     database: 'mongo',
   *     model: 'Order',
   *     action: 'find',
   *     conditions: [
   *       { field: 'username', operator: 'is', value: '{{findUser.0.username}}' }
   *     ],
   *     select: ['orderId', 'amount']
   *   },
   *   {
   *     stepName: 'createSummary',
   *     database: 'mongo', 
   *     model: 'Summary',
   *     action: 'create',
   *     data: {
   *       username: '{{findUser.0.username}}',
   *       orderCount: '{{findOrders.length}}',
   *       totalAmount: '{{findOrders.0.amount}}'
   *     }
   *   }
   * ];
   * 
   * const result = await engine.runPipeline(pipeline);
   */
  async runPipeline(queries: DSLQuery[]): Promise<{ status: string; steps: { [key: string]: QueryResult } }> {
    const pipelineResults: { [key: string]: QueryResult } = {};
    const dataMap: { [stepName: string]: any[] } = {};

    for (const query of queries) {
      const stepName = query.stepName || `step_${Date.now()}_${Math.random()}`;

      // Resolve placeholders before running this step
      if (query.conditions) {
        this.resolvePlaceholders(query.conditions, dataMap);
      }

      if (query.data) {
        query.data = this.resolveValuePlaceholders(query.data, dataMap);
      }

      const result = await this.run(query);
      pipelineResults[stepName] = result;

      if (result.status === ERROR) {
        // If error occurs, we return what we have
        return { status: ERROR, steps: pipelineResults };
      }

      // Store the result data for reference in next steps
      if (result.data) {
        dataMap[stepName] = Array.isArray(result.data) ? result.data : [result.data];
      } else {
        dataMap[stepName] = [];
      }
    }

    return { status: 'success', steps: pipelineResults };
  }

  private resolvePlaceholders(conditions: any[], dataMap: { [stepName: string]: any[] }) {
    for (const cond of conditions) {
      if (cond.field && cond.value && typeof cond.value === 'string') {
        cond.value = this.resolveValuePlaceholder(cond.value, dataMap);
      }
    }
  }

  private resolveValuePlaceholders(obj: any, dataMap: { [stepName: string]: any[] }): any {
    if (typeof obj === 'string') {
      return this.resolveValuePlaceholder(obj, dataMap);
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = this.resolveValuePlaceholders(obj[key], dataMap);
      }
    }
    return obj;
  }

  /**
   * Resolve a single placeholder, format: "{{stepName.index.field}}"
   * 
   * Example:
   * "{{findUser.0.username}}" -> "john.doe"
   * "{{findOrders.0.amount}}" -> 99.99
   * "{{findOrders.length}}" -> 5
   */
  private resolveValuePlaceholder(value: string, dataMap: { [stepName: string]: any[] }): any {
    if (!value.includes('{{') || !value.includes('}}')) return value;
    const placeholder = value.substring(value.indexOf('{{') + 2, value.indexOf('}}')).trim();

    // Example: getOlderUser.0.username
    const parts = placeholder.split('.');
    if (parts.length < 2) return value; // invalid format
    const stepName = parts[0];
    const index = parseInt(parts[1], 10);
    const field = parts[2];

    const stepData = dataMap[stepName];
    if (!stepData || !stepData[index]) return null;
    return field ? stepData[index][field] : stepData[index];
  }
}
