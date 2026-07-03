/**
 * Image Processing for OCR
 * Handles image upload and preprocessing for better OCR accuracy
 */

import { validateImageFile } from '../utils/validation.js';
import { parseReferenceString } from '../utils/helpers.js';

/**
 * Handle image upload and OCR processing
 * @param {Event} e - File input change event
 * @param {Object} elements - DOM elements
 */
export async function handleImageUpload(e, elements) {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    elements.refError.textContent = validation.error;
    elements.refError.classList.remove('hidden');
    return;
  }
  
  // Show loading state
  const originalText = elements.uploadBtn.innerHTML;
  elements.uploadBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing...';
  elements.uploadBtn.disabled = true;
  elements.refError.classList.add('hidden');
  
  try {
    // Read and preprocess image
    const imageUrl = await preprocessImage(file);
    
    // Process with Tesseract.js
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            elements.uploadBtn.innerHTML = `<i class="bi bi-hourglass-split"></i> ${progress}%`;
          }
        },
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,',
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT
      }
    );
    
    // Clean up URL
    URL.revokeObjectURL(imageUrl);
    
    // Extract and parse text
    const extractedText = result.data.text.trim();
    
    console.log('Extracted text:', extractedText);
    
    if (!extractedText) {
      throw new Error('No text detected. Try:\n• Better lighting\n• Closer photo\n• Higher contrast\n• Clearer text');
    }
    
    // Show preview modal for user to verify/edit
    showOCRPreview(extractedText, originalText, elements);
    
  } catch (error) {
    console.error('OCR Error:', error);
    elements.refError.textContent = error.message || 'Failed to process image. Please try again with a clearer image.';
    elements.refError.classList.remove('hidden');
    
    // Reset button
    elements.uploadBtn.innerHTML = '<i class="bi bi-x-circle-fill"></i> Failed';
    setTimeout(() => {
      elements.uploadBtn.innerHTML = originalText;
      elements.uploadBtn.disabled = false;
    }, 2000);
  }
  
  // Clear file input for reuse
  e.target.value = '';
}

/**
 * Preprocess image for better OCR accuracy
 * @param {File} file - Image file
 * @returns {Promise<string>} - Blob URL of processed image
 */
async function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas for preprocessing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Increase contrast
          const contrasted = gray < 128 ? 0 : 255;
          
          data[i] = contrasted;     // R
          data[i + 1] = contrasted; // G
          data[i + 2] = contrasted; // B
        }
        
        // Put processed image back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to blob URL
        canvas.toBlob((blob) => {
          resolve(URL.createObjectURL(blob));
        });
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Show OCR preview modal for user verification
 * @param {string} extractedText - Extracted text from OCR
 * @param {string} originalButtonText - Original upload button text
 * @param {Object} elements - DOM elements
 */
function showOCRPreview(extractedText, originalButtonText, elements) {
  // Parse the text
  const parsedRefs = parseReferenceString(extractedText).join(' ');
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(10px);
    animation: fadeIn 0.3s ease;
  `;
  
  // Create modal content
  const modalContent = document.createElement('div');
  const isLightMode = document.body.classList.contains('light-mode');
  modalContent.style.cssText = `
    background: ${isLightMode ? '#FFFFFF' : '#1C1C1E'};
    border-radius: 16px;
    padding: 32px;
    max-width: 600px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease;
  `;
  
  modalContent.innerHTML = `
    <h3 style="margin: 0 0 16px 0; color: var(--text-primary); font-size: 24px;">
      <i class="bi bi-eye" style="color: var(--ios-blue); margin-right: 8px;"></i>
      Verify Extracted Text
    </h3>
    <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 14px;">
      Please review and edit the extracted reference string if needed.
    </p>
    <textarea 
      id="ocr-preview-text" 
      class="form-input monospace" 
      style="width: 100%; min-height: 120px; margin-bottom: 20px; resize: vertical;"
      placeholder="Edit reference string here..."
    >${parsedRefs}</textarea>
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button 
        id="ocr-cancel-btn" 
        class="btn btn-secondary"
        style="flex: 1;"
      >
        <i class="bi bi-x-circle"></i>
        Cancel
      </button>
      <button 
        id="ocr-confirm-btn" 
        class="btn btn-primary"
        style="flex: 1;"
      >
        <i class="bi bi-check-circle"></i>
        Use This
      </button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Focus textarea
  const textarea = modal.querySelector('#ocr-preview-text');
  setTimeout(() => textarea?.focus(), 100);
  
  // Handle confirm
  modal.querySelector('#ocr-confirm-btn')?.addEventListener('click', () => {
    const finalText = textarea.value.trim();
    if (finalText) {
      elements.refString.value = finalText;
      elements.refError.classList.add('hidden');
    }
    
    document.body.removeChild(modal);
    document.head.removeChild(style);
    
    // Reset upload button
    elements.uploadBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Success';
    setTimeout(() => {
      elements.uploadBtn.innerHTML = originalButtonText;
      elements.uploadBtn.disabled = false;
    }, 1500);
  });
  
  // Handle cancel
  const handleCancel = () => {
    document.body.removeChild(modal);
    document.head.removeChild(style);
    
    elements.uploadBtn.innerHTML = originalButtonText;
    elements.uploadBtn.disabled = false;
  };
  
  modal.querySelector('#ocr-cancel-btn')?.addEventListener('click', handleCancel);
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      handleCancel();
    }
  });
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}
