export function pageReplacement(algo, reference, num_frames) {
  // Validate algorithm (only FIFO and LRU supported)
  if (!['fifo', 'lru'].includes(algo)) {
    throw new Error('Invalid page replacement algorithm. Please use fifo or lru');
  }

  if (num_frames < 1) {
    throw new Error('Number of frames must be greater than 0');
  }

  let frames = new Array(num_frames).fill(null);  // Fixed-position frames
  let time_slice = [];     // Snapshot of frames at each reference
  let page_fault = [];     // 1 for page fault, 0 for page hit
  let fifoQueue = [];      // Queue tracking insertion order for FIFO
  let lruOrder = [];       // List tracking access order for LRU (most recent last)

  for (let i = 0; i < reference.length; i++) {
    let page = reference[i];
    
    // Check if page is already in frames
    let pageIndex = frames.indexOf(page);
    let isPageHit = pageIndex !== -1;
    
    if (isPageHit) {
      // Page hit occurred
      page_fault.push(0);
      
      if (algo === 'lru') {
        // Update LRU order: move accessed page to end (most recent)
        let orderIndex = lruOrder.indexOf(page);
        if (orderIndex > -1) {
          lruOrder.splice(orderIndex, 1);
        }
        lruOrder.push(page);
      }
    } else {
      // Page fault occurred
      page_fault.push(1);
      
      // Find empty frame or victim frame
      let emptyFrameIndex = frames.indexOf(null);
      
      if (emptyFrameIndex !== -1) {
        // Empty frame available, use it
        frames[emptyFrameIndex] = page;
        
        if (algo === 'fifo') {
          fifoQueue.push(page);
        } else if (algo === 'lru') {
          lruOrder.push(page);
        }
      } else {
        // All frames full, need to replace
        let victim;
        let victimFrameIndex;
        
        if (algo === 'fifo') {
          // FIFO: victim is the oldest page (front of queue)
          victim = fifoQueue.shift();
          victimFrameIndex = frames.indexOf(victim);
          
          // Add new page to back of queue
          fifoQueue.push(page);
        } else if (algo === 'lru') {
          // LRU: victim is the least recently used (first in order list)
          victim = lruOrder.shift();
          victimFrameIndex = frames.indexOf(victim);
          
          // Add new page to end (most recent)
          lruOrder.push(page);
        }
        
        // Replace victim with new page in the same frame position
        if (victimFrameIndex !== -1) {
          frames[victimFrameIndex] = page;
        }
      }
    }
    
    // Save current frame state for visualization
    // Filter out null values and create a clean snapshot
    time_slice.push([...frames]);
  }

  return { time_slice, page_fault };
}