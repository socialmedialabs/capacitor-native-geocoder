// Simple queue/throttle for geocoding requests (CLGeocoder throttles; Android backends vary).
// Usage:
//   import { createGeocodeQueue } from './utils/geocodeQueue'
//   const queue = createGeocodeQueue({ intervalMs: 500, concurrency: 1 })
//   const res = await queue.enqueue(() => reverseGeocode(lat, lon))

export type Task<T> = () => Promise<T>

export interface GeocodeQueueOptions {
  intervalMs?: number // min time between task starts
  concurrency?: number // parallel tasks (keep at 1 for CLGeocoder)
  maxQueue?: number // optional: drop new tasks if queue too long
}

interface QueueItem<T> {
  task: Task<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

export function createGeocodeQueue(options: GeocodeQueueOptions = {}) {
  const intervalMs: number = options.intervalMs ?? 500
  const concurrency: number = Math.max(1, options.concurrency ?? 1)
  const maxQueue: number = options.maxQueue ?? Infinity

  const queue: Array<QueueItem<unknown>> = []
  let running = 0
  let lastStart = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  function schedule(): void {
    if (running >= concurrency) return
    const now = Date.now()
    const delta = now - lastStart
    const delay = Math.max(0, intervalMs - delta)
    if (timer) return
    timer = setTimeout(runNext, delay)
  }

  async function runNext(): Promise<void> {
    timer = null
    if (running >= concurrency) return
    const item = queue.shift()
    if (!item) return
    running++
    lastStart = Date.now()
    try {
      const result = await (item.task as Task<unknown>)()
      item.resolve(result)
    } catch (e) {
      item.reject(e)
    } finally {
      running--
      if (queue.length > 0) schedule()
    }
  }

  function enqueue<T>(task: Task<T>): Promise<T> {
    if (queue.length >= maxQueue) {
      return Promise.reject(new Error('Geocode queue overflow'))
    }
    return new Promise<T>((resolve, reject) => {
      const item: QueueItem<T> = { task, resolve, reject }
      queue.push(item as unknown as QueueItem<unknown>)
      schedule()
    })
  }

  function size(): number {
    return queue.length
  }

  return { enqueue, size }
}