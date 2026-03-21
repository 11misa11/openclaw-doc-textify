export class UrlQueue {
  private readonly seen = new Set<string>()
  private readonly items: string[] = []

  add(url: string): boolean {
    if (this.seen.has(url)) {
      return false
    }
    this.seen.add(url)
    this.items.push(url)
    return true
  }

  addMany(urls: string[]): number {
    let added = 0
    for (const url of urls) {
      if (this.add(url)) {
        added += 1
      }
    }
    return added
  }

  next(): string | undefined {
    return this.items.shift()
  }

  size(): number {
    return this.items.length
  }

  snapshot(): string[] {
    return [...this.items]
  }
}
