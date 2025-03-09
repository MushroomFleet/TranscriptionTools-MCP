import { FileHandler } from '../utils/file-handler.js';

/**
 * Interface for the format_transcript function parameters
 */
export interface FormatTranscriptParams {
  input_text: string;
  is_file_path?: boolean;
  paragraph_gap?: number; // seconds
  line_gap?: number; // seconds
}

/**
 * Transforms timestamped transcripts into naturally formatted text
 * @param params - Parameters for the formatting process
 * @returns Object containing the formatted text
 */
export async function formatTranscript(params: FormatTranscriptParams): Promise<{ formatted_text: string }> {
  try {
    const { 
      input_text, 
      is_file_path = false, 
      paragraph_gap = 8, // default 8 seconds for paragraph breaks
      line_gap = 4 // default 4 seconds for line breaks
    } = params;
    
    // Resolve content (either direct text or from file)
    const textContent = await FileHandler.resolveTextContent(input_text, is_file_path);
    
    // Parse the timestamped transcript
    const lines = textContent.trim().split('\n');
    
    // This will store our processed text segments with their timestamps
    const segments: Array<{ time: number; text: string }> = [];
    
    // Parse each line to extract timestamp and text
    for (const line of lines) {
      // Extract timestamp using regex
      const match = line.match(/\[(\d{2}):(\d{2}):(\d{2})\]\s*(.*)/);
      
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);
        const text = match[4].trim();
        
        // Convert timestamp to seconds
        const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
        
        // Add to segments
        segments.push({ time: timeInSeconds, text });
      } else {
        // Handle lines without timestamps
        if (segments.length > 0) {
          // Append to the previous segment if it exists
          segments[segments.length - 1].text += ' ' + line.trim();
        } else {
          // Create a new segment with time 0 if no previous segment
          segments.push({ time: 0, text: line.trim() });
        }
      }
    }
    
    // Process segments to create naturally formatted text
    let formattedText = '';
    let lastTime = -1;
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      // First segment or determine spacing based on time gap
      if (i === 0) {
        formattedText = segment.text;
      } else {
        const timeGap = segment.time - lastTime;
        
        // Rule 1: Paragraph break for gaps > paragraph_gap seconds
        if (timeGap > paragraph_gap) {
          formattedText += '\n\n' + segment.text;
        }
        // Rule 2: Line break for gaps > line_gap seconds
        else if (timeGap > line_gap) {
          formattedText += '\n' + segment.text;
        }
        // Rule 3: Apply natural grammar rules
        else {
          // Check if we should add space or join without space
          const lastChar = formattedText.charAt(formattedText.length - 1);
          const endsWithSentenceMarker = /[.!?]$/.test(formattedText);
          const startsWithLowerCase = /^[a-z]/.test(segment.text);
          
          if (endsWithSentenceMarker) {
            // Start a new sentence
            formattedText += ' ' + segment.text;
          } else if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
            // Continue after punctuation
            formattedText += ' ' + segment.text;
          } else if (startsWithLowerCase) {
            // Likely continuing a thought
            formattedText += ' ' + segment.text;
          } else {
            // Otherwise just add space
            formattedText += ' ' + segment.text;
          }
        }
      }
      
      lastTime = segment.time;
    }
    
    return { formatted_text: formattedText };
  } catch (error) {
    throw new Error(`Formatting process failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
