import { readUtf8 } from '../utils/fs.js'

export async function fetchFromUrl(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

export async function fetchFromFile(filePath: string): Promise<string> {
  return readUtf8(filePath)
}
