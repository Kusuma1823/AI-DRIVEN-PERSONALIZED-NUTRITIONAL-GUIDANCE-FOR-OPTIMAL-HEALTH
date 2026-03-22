export async function extractTextFromImage(params: {
  file: File;
  onProgress?: (progressText: string, ratio?: number) => void;
}): Promise<{ text: string; matchedFoods: Array<{ name: string; confidence: number }> }> {
  const { file, onProgress } = params;

  try {
    onProgress?.("Uploading image...", 0.1);
    
    // Use the backend API for faster OCR processing
    const formData = new FormData();
    formData.append('file', file);
    
    onProgress?.("Processing with OCR API...", 0.5);
    
    const response = await fetch('http://localhost:5000/api/ocr/extract', {
      method: 'POST',
      body: formData,
    });
    
    onProgress?.("Extracting text...", 0.8);
    
    if (!response.ok) {
      throw new Error('OCR API request failed');
    }
    
    const result = await response.json();
    
    onProgress?.("Matching with dataset...", 0.95);
    
    return {
      text: result.extracted_text || '',
      matchedFoods: result.matched_foods || [],
    };
  } catch (error) {
    console.error('OCR error:', error);
    // Fallback to empty result
    return { text: '', matchedFoods: [] };
  }
}

