import { supabase } from './supabaseClient';
import { pdf } from '@react-pdf/renderer';

export const savePDFToStorage = async (userId, pdfBlob, documentType) => {
  try {
    // Use a consistent filename without timestamp
    const fileName = `${documentType}/${userId}/${documentType}.pdf`;

    // Upload the file to Supabase storage with content type
    const { error: uploadError } = await supabase.storage
      .from('admin-materials')
      .upload(fileName, pdfBlob, {
        upsert: true, // This will replace any existing file
        contentType: 'application/pdf'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get the public URL of the uploaded file
    const { data } = supabase.storage
      .from('admin-materials')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw error;
  }
};

export const saveLedgerPDF = async (userId, pdfBlob) => {
  try {
    // Use a consistent filename without timestamp
    const fileName = `ledger/${userId}/ledger.pdf`;

    // Upload the file to Supabase storage with content type
    const { error: uploadError } = await supabase.storage
      .from('ledger-pdfs')
      .upload(fileName, pdfBlob, {
        upsert: true, // This will replace any existing file
        contentType: 'application/pdf'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get the public URL of the uploaded file
    const { data } = supabase.storage
      .from('ledger-pdfs')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error saving ledger PDF:', error);
    throw error;
  }
};

export const generatePDFFromComponent = async (component) => {
  try {
    const blob = await pdf(component).toBlob();
    return blob;
  } catch (error) {
    console.error('Error generating PDF from component:', error);
    throw error;
  }
}; 