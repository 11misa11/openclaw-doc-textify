import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export async function readUtf8(filePath: string): Promise<string> {
  return readFile(filePath, 'utf8')
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true })
}

export async function writeUtf8(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath))
  await writeFile(filePath, content, 'utf8')
}
