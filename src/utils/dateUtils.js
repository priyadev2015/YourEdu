export const formatDeadlineDate = (dateStr) => {
  // If empty or undefined, return empty string
  if (!dateStr) return '';
  
  // If it's already in text format (contains letters), return as is
  if (/[a-zA-Z]/.test(dateStr)) {
    return dateStr;
  }

  // Handle Excel numeric dates (days since 1/1/1900)
  if (!isNaN(dateStr) && dateStr > 1000) { // If it's a number larger than 1000
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (dateStr - 2) * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Try to parse regular date strings
  try {
    const [month, day, year] = dateStr.split(/[/-]/);
    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if invalid
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}; 