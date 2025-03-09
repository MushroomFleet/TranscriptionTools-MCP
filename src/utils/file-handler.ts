import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Utility class for handling file operations
 */
export class FileHandler {
  /**
   * Read text from a file
   * @param filePath - Path to the file
   * @returns Promise resolving to the file contents as string
   */
  static async readTextFile(filePath: string): Promise<string> {
    try {
      return await readFileAsync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Write text to a file, creating directories if needed
   * @param filePath - Path to the file
   * @param content - Content to write
   * @returns Promise resolving when the file is written
   */
  static async writeTextFile(filePath: string, content: string): Promise<void> {
    try {
      const dir = path.dirname(filePath);
      await mkdirAsync(dir, { recursive: true });
      await writeFileAsync(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if text content is a file path and read the file if it is
   * @param content - Text content or file path
   * @param isFilePath - Whether the content is a file path
   * @returns Promise resolving to the text content
   */
  static async resolveTextContent(content: string, isFilePath: boolean): Promise<string> {
    if (isFilePath) {
      return await FileHandler.readTextFile(content);
    }
    return content;
  }

  /**
   * Generate a timestamped session ID
   * @returns A session ID based on current timestamp
   */
  static generateSessionId(): string {
    const now = new Date();
    return now.toISOString().replace(/[-:.]/g, '').slice(0, 14);
  }
}
