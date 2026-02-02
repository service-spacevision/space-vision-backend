declare module 'node-routeros' {
  interface IRosOptions {
    host: string;
    user: string;
    password: string;
    port: number;
    timeout?: number;
  }

  type Callback<T = any> = (err: Error | null, result?: T) => void;

  class RouterOSAPI {
    constructor(options: IRosOptions);
    
    on(event: 'error', callback: (error: Error) => void): void;
    connect(callback?: () => void): void;
    close(): void;
    write(command: string | string[], callback: Callback<any[]>): void;
  }

  export = RouterOSAPI;
}
