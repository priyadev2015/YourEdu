// src/utils/parseCollegeData.js
import { read, utils } from 'xlsx';

export const parseCollegeData = async () => {
  try {
    const response = await fetch('/college_requirements.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = utils.sheet_to_json(sheet, { header: 1 });
    
    const colleges = data.slice(1).map(row => ({
      name: row[0] ? row[0].trim() : undefined,
      requirements: row[1] ? row[1].trim() : 'No specific requirements provided',
      deadline: row[2] ? row[2].trim() : 'No deadline provided',
    }));

    return colleges;
  } catch (error) {
    console.error('Error parsing college data:', error);
    return [];
  }
};
