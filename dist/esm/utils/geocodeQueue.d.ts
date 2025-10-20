export type Task<T> = () => Promise<T>;
export interface GeocodeQueueOptions {
    intervalMs?: number;
    concurrency?: number;
    maxQueue?: number;
}
export declare function createGeocodeQueue(options?: GeocodeQueueOptions): {
    enqueue: <T>(task: Task<T>) => Promise<T>;
    size: () => number;
};
