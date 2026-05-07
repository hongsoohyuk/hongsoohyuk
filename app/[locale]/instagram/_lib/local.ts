import {readFile} from 'node:fs/promises';
import path from 'node:path';

const INSTAGRAM_STATIC_DIR = path.join(process.cwd(), 'public', 'instagram');

export async function readInstagramStaticJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(INSTAGRAM_STATIC_DIR, fileName);
  try {
    const contents = await readFile(filePath, 'utf8');
    return JSON.parse(contents) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Missing Instagram static data at ${filePath}. Run \`pnpm run instagram:sync\`.\n${message}`);
  }
}
