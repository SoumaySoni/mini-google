/**
 * URL Frontier / Queue Module
 *
 * Responsibilities:
 * 1. Maintain a FIFO queue of URLs waiting to be crawled.
 * 2. Track all seen/discovered URLs to prevent duplicates (even after a URL has been dequeued).
 * 3. Provide methods to add URLs, fetch the next URL, check emptiness, and inspect queue status.
 */

export class UrlFrontier {
  private queue: string[] = [];
  private head: number = 0;
  private seen: Set<string> = new Set();

  /**
   * Adds a URL to the queue if it has not been seen before.
   *
   * @param url - The URL string to add.
   * @returns true if the URL was newly added, false if it was already seen or invalid.
   */
  add(url: string): boolean {
    if (!url || typeof url !== "string") {
      return false;
    }

    const trimmed = url.trim();
    if (!trimmed) {
      return false;
    }

    // Prevent duplicate URLs from ever being queued again
    if (this.seen.has(trimmed)) {
      return false;
    }

    this.seen.add(trimmed);
    this.queue.push(trimmed);
    return true;
  }

  /**
   * Adds multiple URLs to the queue, skipping duplicates.
   *
   * @param urls - Array of URL strings to add.
   * @returns The count of newly added URLs.
   */
  addMany(urls: string[]): number {
    if (!Array.isArray(urls)) {
      return 0;
    }

    let addedCount = 0;
    for (const url of urls) {
      if (this.add(url)) {
        addedCount++;
      }
    }
    return addedCount;
  }

  /**
   * Retrieves and removes the next URL from the front of the queue (FIFO).
   *
   * @returns The next URL string, or null if the queue is empty.
   */
  next(): string | null {
    if (this.isEmpty()) {
      return null;
    }

    const nextUrl = this.queue[this.head++];

    // Memory cleanup: compact array when head offset grows large
    if (this.head > 1000 && this.head >= this.queue.length / 2) {
      this.queue = this.queue.slice(this.head);
      this.head = 0;
    }

    return nextUrl;
  }

  /**
   * Returns true if there are no URLs currently waiting to be crawled.
   */
  isEmpty(): boolean {
    return this.head >= this.queue.length;
  }

  /**
   * Returns the number of URLs currently waiting in the queue.
   */
  size(): number {
    return Math.max(0, this.queue.length - this.head);
  }

  /**
   * Returns the total number of unique URLs ever added to the frontier.
   */
  totalSeen(): number {
    return this.seen.size;
  }

  /**
   * Checks whether a URL has already been queued or processed.
   */
  hasSeen(url: string): boolean {
    if (!url || typeof url !== "string") return false;
    return this.seen.has(url.trim());
  }

  /**
   * Returns a snapshot of URLs currently waiting in the queue without removing them.
   */
  getQueue(): string[] {
    return this.queue.slice(this.head);
  }

  /**
   * Resets the queue and seen history.
   */
  clear(): void {
    this.queue = [];
    this.head = 0;
    this.seen.clear();
  }

  /**
   * Returns frontier summary statistics.
   */
  getStats() {
    return {
      queued: this.size(),
      processed: this.head,
      totalSeen: this.seen.size,
      isEmpty: this.isEmpty(),
    };
  }
}

// Convenient alias
export { UrlFrontier as UrlQueue };
