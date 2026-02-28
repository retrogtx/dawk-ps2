export interface Chunk {
  content: string;
  chunkIndex: number;
  pageNumber?: number;
  sectionTitle?: string;
}

const CHUNK_SIZE = 1500; // characters (~375 tokens)
const OVERLAP = 200;

export function chunkText(text: string, metadata?: { fileName?: string }): Chunk[] {
  const chunks: Chunk[] = [];

  // Split by double newlines first (paragraphs/sections)
  const sections = text.split(/\n{2,}/);
  let buffer = "";
  let chunkIndex = 0;

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    if (buffer.length + trimmed.length > CHUNK_SIZE && buffer.length > 0) {
      chunks.push({
        content: buffer.trim(),
        chunkIndex: chunkIndex++,
        sectionTitle: extractSectionTitle(buffer),
      });

      // Keep overlap from end of previous chunk
      const overlapText = buffer.slice(-OVERLAP);
      buffer = overlapText + "\n\n" + trimmed;
    } else {
      buffer += (buffer ? "\n\n" : "") + trimmed;
    }
  }

  // Don't forget the last buffer
  if (buffer.trim()) {
    chunks.push({
      content: buffer.trim(),
      chunkIndex: chunkIndex++,
      sectionTitle: extractSectionTitle(buffer),
    });
  }

  // If the text is very short, just return it as one chunk
  if (chunks.length === 0 && text.trim()) {
    chunks.push({
      content: text.trim(),
      chunkIndex: 0,
    });
  }

  return chunks;
}

function extractSectionTitle(text: string): string | undefined {
  // Try to extract a heading from markdown-style headers
  const match = text.match(/^#+\s+(.+)/m);
  if (match) return match[1].trim();

  // Try first line if it's short enough to be a title
  const firstLine = text.split("\n")[0]?.trim();
  if (firstLine && firstLine.length < 100 && !firstLine.endsWith(".")) {
    return firstLine;
  }

  return undefined;
}
