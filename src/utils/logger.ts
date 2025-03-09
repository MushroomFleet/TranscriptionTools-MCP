import fs from 'fs';
import path from 'path';
import { FileHandler } from './file-handler.js';

/**
 * Logger class for handling system and processing logs
 */
export class Logger {
  private sessionId: string;
  private baseLogDir: string;

  /**
   * Create a new logger
   * @param sessionId - Session ID for the current process
   * @param baseLogDir - Base directory for logs
   */
  constructor(sessionId?: string, baseLogDir = '/logs') {
    this.sessionId = sessionId || FileHandler.generateSessionId();
    this.baseLogDir = baseLogDir;
  }

  /**
   * Log repair information
   * @param originalFilename - The original transcript filename
   * @param corrections - Array of correction objects
   * @param stats - Processing statistics
   * @returns The path to the log file
   */
  async logRepairProcess(
    originalFilename: string,
    corrections: Array<{
      original: string;
      corrected: string;
      confidence: number;
      context: string;
      evidence: string[];
    }>,
    stats: {
      totalWords: number;
      correctionsMade: number;
      averageConfidence: number;
    }
  ): Promise<string> {
    const logDir = path.join(this.baseLogDir, 'repairs');
    const logPath = path.join(logDir, `${this.sessionId}.log`);
    
    let logContent = `Session: ${this.sessionId}\n`;
    logContent += `Source: ${originalFilename}\n`;
    logContent += '---\n';
    
    // Log each correction
    for (const correction of corrections) {
      logContent += `[Original]: ${correction.original}\n`;
      logContent += `[Corrected]: ${correction.corrected}\n`;
      logContent += `[Confidence]: ${correction.confidence}%\n`;
      logContent += `[Context]: "${correction.context}"\n`;
      logContent += '[Evidence]:\n';
      
      for (const evidence of correction.evidence) {
        logContent += `- ${evidence}\n`;
      }
      
      logContent += '---\n';
    }
    
    // Log summary statistics
    logContent += 'Summary:\n';
    logContent += `Total words processed: ${stats.totalWords}\n`;
    logContent += `Corrections made: ${stats.correctionsMade}\n`;
    logContent += `Average confidence: ${stats.averageConfidence}%\n`;
    
    await FileHandler.writeTextFile(logPath, logContent);
    return logPath;
  }

  /**
   * Log summary process information
   * @param constraint - The constraint applied to the summary
   * @param stats - Processing statistics and tracking information
   * @returns The path to the log file
   */
  async logSummaryProcess(
    constraint: {
      type: string | null;
      target: number | null;
      achieved: number;
    },
    stats: {
      primingFactors: string[];
      comprehensionMetrics: Record<string, any>;
      contextMaps: Record<string, any>;
      expansionIterations: number;
      recursiveOptimizations: number;
    }
  ): Promise<string> {
    const logDir = path.join(this.baseLogDir, 'summary');
    const logPath = path.join(logDir, `${this.sessionId}.log`);
    
    let logContent = `ACE Process Tracking:\n`;
    logContent += `- Priming Factors: ${JSON.stringify(stats.primingFactors)}\n`;
    logContent += `- Comprehension Metrics: ${JSON.stringify(stats.comprehensionMetrics)}\n`;
    logContent += `- Context Maps: ${JSON.stringify(stats.contextMaps)}\n`;
    logContent += `- Expansion Iterations: ${stats.expansionIterations}\n`;
    logContent += `- Recursive Optimizations: ${stats.recursiveOptimizations}\n\n`;
    
    logContent += `Constraint Details:\n`;
    logContent += `- Type: ${constraint.type || 'default'}\n`;
    logContent += `- Target: ${constraint.target || 'N/A'}\n`;
    logContent += `- Achieved: ${constraint.achieved}\n`;
    
    await FileHandler.writeTextFile(logPath, logContent);
    return logPath;
  }

  /**
   * Get the session ID
   * @returns The current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}
