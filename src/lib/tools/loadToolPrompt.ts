import fs from 'fs';
import path from 'path';

export function loadToolPrompt(toolName: string): string {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/tools/artifacts', `${toolName}.md`);
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.warn(`Tool prompt artifact not found for ${toolName}, using fallback`);
    return '';
  }
}
