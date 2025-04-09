import * as XLSX from 'xlsx';

export const parseCollegeRequirements = async () => {
  try {
    const response = await fetch('/college_requirements.xlsx'); // Ensure the path is correct
    if (!response.ok) {
      throw new Error('Failed to fetch the Excel file');
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in the Excel file');
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length === 0) {
      throw new Error('No data found in the sheet');
    }

    const [headers, ...rows] = data;

    if (!headers || headers.length === 0) {
      throw new Error('No headers found in the sheet');
    }

    return rows.map((row) => {
      const college = {};
      headers.forEach((header, index) => {
        college[header] = row[index] || ''; // Handle missing data gracefully
      });
      return college;
    });

  } catch (error) {
    console.error('Error parsing college requirements:', error.message);
    return []; // Return an empty array in case of error to avoid breaking the application
  }
};
