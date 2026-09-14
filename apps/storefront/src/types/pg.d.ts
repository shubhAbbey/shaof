declare module 'pg' {
  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
  }

  export class Pool {
    constructor(config?: any);
    query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
