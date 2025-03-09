import { FileHandler } from '../utils/file-handler.js';
import { Logger } from '../utils/logger.js';

/**
 * Interface for the repair_text function parameters
 */
export interface RepairTextParams {
  input_text: string;
  is_file_path?: boolean;
}

/**
 * Interface for the get_repair_log function parameters
 */
export interface GetRepairLogParams {
  session_id: string;
}

/**
 * Analyzes and repairs transcription errors with high confidence
 * @param params - Parameters for the repair process
 * @returns Object containing the path to the repaired text file
 */
export async function repairText(params: RepairTextParams): Promise<{ output_file: string }> {
  try {
    const { input_text, is_file_path = false } = params;
    
    // Resolve content (either direct text or from file)
    const textContent = await FileHandler.resolveTextContent(input_text, is_file_path);
    
    // Create a session ID and logger
    const logger = new Logger();
    const sessionId = logger.getSessionId();
    
    // This would be a more complex NLP processing in a real implementation
    // Here we just simulate the repair process with some example corrections
    
    // Split text into words for processing
    const words = textContent.split(/\s+/);
    const totalWords = words.length;
    
    // Simulate finding and correcting errors
    const corrections: Array<{
      original: string;
      corrected: string;
      confidence: number;
      context: string;
      evidence: string[];
    }> = [];
    
    // In a real implementation, this would use NLP models to identify errors
    // Here we're just simulating with some basic replacements
    const commonErrors = [
      { pattern: /recieve/gi, replacement: 'receive', confidence: 95 },
      { pattern: /defiantly/gi, replacement: 'definitely', confidence: 93 },
      { pattern: /irregardless/gi, replacement: 'regardless', confidence: 91 },
      { pattern: /alot/gi, replacement: 'a lot', confidence: 97 },
      { pattern: /seperate/gi, replacement: 'separate', confidence: 94 }
    ];
    
    // Process the text
    let repairedText = textContent;
    let totalConfidence = 0;
    
    for (const error of commonErrors) {
      if (error.pattern.test(repairedText)) {
        // Find all instances of this error
        const matches = repairedText.match(error.pattern) || [];
        
        for (const match of matches) {
          // Get some context around the error (simulated)
          const contextIndex = repairedText.indexOf(match);
          const start = Math.max(0, contextIndex - 20);
          const end = Math.min(repairedText.length, contextIndex + match.length + 20);
          const context = repairedText.substring(start, end);
          
          corrections.push({
            original: match,
            corrected: match.replace(error.pattern, error.replacement),
            confidence: error.confidence,
            context,
            evidence: [
              'Pattern recognition',
              'Dictionary verification',
              'Semantic analysis'
            ]
          });
          
          totalConfidence += error.confidence;
        }
        
        // Apply the correction to the full text
        repairedText = repairedText.replace(error.pattern, error.replacement);
      }
    }
    
    // Calculate statistics
    const correctionsMade = corrections.length;
    const averageConfidence = correctionsMade > 0 
      ? Math.round(totalConfidence / correctionsMade) 
      : 0;
    
    // Write the repaired text to a file
    const outputFile = 'repaired.txt';
    await FileHandler.writeTextFile(outputFile, repairedText);
    
    // Log the repair process
    const stats = {
      totalWords,
      correctionsMade,
      averageConfidence
    };
    
    const logPath = await logger.logRepairProcess(
      is_file_path ? input_text : 'direct_input',
      corrections,
      stats
    );
    
    return { output_file: outputFile };
  } catch (error) {
    throw new Error(`Repair process failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves detailed analysis log from previous repair operation
 * @param params - Parameters containing the session ID
 * @returns Object containing the log file path
 */
export async function getRepairLog(params: GetRepairLogParams): Promise<{ log_file: string }> {
  try {
    const { session_id } = params;
    const logPath = `/logs/repairs/${session_id}.log`;
    
    // Check if the log file exists
    try {
      await FileHandler.readTextFile(logPath);
    } catch (error) {
      throw new Error(`Repair log not found for session ${session_id}`);
    }
    
    return { log_file: logPath };
  } catch (error) {
    throw new Error(`Failed to retrieve repair log: ${error instanceof Error ? error.message : String(error)}`);
  }
}
