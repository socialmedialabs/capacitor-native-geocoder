// Simple queue/throttle for geocoding requests (CLGeocoder throttles; Android backends vary).
// Usage:
//   import { createGeocodeQueue } from './utils/geocodeQueue'
//   const queue = createGeocodeQueue({ intervalMs: 500, concurrency: 1 })
//   const res = await queue.enqueue(() => reverseGeocode(lat, lon))
export function createGeocodeQueue(options = {}) {
    const intervalMs = options.intervalMs ?? 500;
    const concurrency = Math.max(1, options.concurrency ?? 1);
    const maxQueue = options.maxQueue ?? Infinity;
    const queue = [];
    let running = 0;
    let lastStart = 0;
    let timer = null;
    function schedule() {
        if (running >= concurrency)
            return;
        const now = Date.now();
        const delta = now - lastStart;
        const delay = Math.max(0, intervalMs - delta);
        if (timer)
            return;
        timer = setTimeout(runNext, delay);
    }
    async function runNext() {
        timer = null;
        if (running >= concurrency)
            return;
        const item = queue.shift();
        if (!item)
            return;
        running++;
        lastStart = Date.now();
        try {
            const result = await item.task();
            item.resolve(result);
        }
        catch (e) {
            item.reject(e);
        }
        finally {
            running--;
            if (queue.length > 0)
                schedule();
        }
    }
    function enqueue(task) {
        if (queue.length >= maxQueue) {
            return Promise.reject(new Error('Geocode queue overflow'));
        }
        return new Promise((resolve, reject) => {
            const item = { task, resolve, reject };
            queue.push(item);
            schedule();
        });
    }
    function size() {
        return queue.length;
    }
    return { enqueue, size };
}
