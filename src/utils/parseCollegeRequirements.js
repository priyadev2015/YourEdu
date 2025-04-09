import * as XLSX from 'xlsx';

export const parseCollegeRequirements = async () => {
  try {
    const response = await fetch('/college_requirements.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert the worksheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
      defval: null  // Set default value for empty cells
    });

    // Add this console.log to check the raw data
    console.log('Raw Excel Data:', jsonData[0]);

    return jsonData.map(row => ({
      ...row,
      City: row.City || '',  // Ensure City field is included
      AcceptanceRate: row.AcceptanceRate ? parseFloat(row.AcceptanceRate) : null,
      School: row.School || '',
      State: row.State || '',
      // ... other fields
    }));
  } catch (error) {
    console.error('Error parsing college requirements:', error);
    return [];
  }
};
