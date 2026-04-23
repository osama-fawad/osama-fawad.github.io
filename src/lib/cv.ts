import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const CV_DIRECTORY = path.join(process.cwd(), 'public', 'cv');
const CV_FALLBACK = '/cv/CV.pdf';

export async function getLatestCvPath(): Promise<string> {
  try {
    const entries = await readdir(CV_DIRECTORY, { withFileTypes: true });

    const pdfFiles = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
        .map(async (entry) => {
          const fullPath = path.join(CV_DIRECTORY, entry.name);
          const { mtimeMs } = await stat(fullPath);
          return { name: entry.name, mtimeMs };
        })
    );

    if (pdfFiles.length === 0) {
      return CV_FALLBACK;
    }

    pdfFiles.sort((a, b) => b.mtimeMs - a.mtimeMs);
    return `/cv/${pdfFiles[0].name}`;
  } catch {
    return CV_FALLBACK;
  }
}
