import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { DescriptiveText } from '../components/ui/typography.jsx';
import { WorkPermitService } from '../services/WorkPermitService';
import { toast } from 'react-toastify';

const WorkPermits = ({ onPermitGenerated }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    employerName: '',
    employerAddress: '',
    employerPhone: '',
    jobTitle: '',
    workSchedule: '',
    startDate: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await WorkPermitService.createWorkPermit(formData);
      toast.success('Work permit generated successfully!');
      onPermitGenerated();
    } catch (error) {
      toast.error('Failed to generate work permit');
      console.error('Error generating work permit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Benefits section */}
      <Box sx={{ pt: 0, pb: 0 }}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 0,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box sx={{ maxWidth: 'var(--text-max-width)', mb: 0.5 }}>
            <DescriptiveText sx={{ 
              fontSize: '1.1rem',
              lineHeight: '1.5',
              color: 'hsl(var(--muted-foreground))',
              mb: 1
            }}>
              Apply for and manage work permits for your homeschool students. Generate the necessary documentation for student employment opportunities.
            </DescriptiveText>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ backgroundColor: 'transparent', pt: 0 }}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 0,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', mt: 0 }}>
            <Box sx={{ position: 'sticky', top: '24px' }}>
              <Box sx={{ 
                backgroundColor: 'white',
                p: 3,
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <Box sx={{ 
                  mb: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'hsl(var(--foreground))'
                }}>
                  Permit Preview
                </Box>
                <Box sx={{ 
                  backgroundColor: 'hsl(var(--muted))',
                  p: 3,
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))'
                }}>
                  <Box sx={{ 
                    textAlign: 'center',
                    mb: 3,
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'hsl(var(--foreground))'
                  }}>
                    STUDENT WORK PERMIT
                  </Box>
                  {[
                    { label: 'Student Name', value: formData.studentName },
                    { label: 'Employer', value: formData.employerName },
                    { label: 'Job Title', value: formData.jobTitle },
                    { label: 'Start Date', value: formData.startDate ? new Date(formData.startDate).toLocaleDateString() : '' }
                  ].map((field, index) => (
                    <Box key={index} sx={{ 
                      mb: 2,
                      pb: 1,
                      borderBottom: '1px dashed hsl(var(--border))',
                      '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' }
                    }}>
                      <Box component="span" sx={{ 
                        fontSize: '14px',
                        color: 'hsl(var(--muted-foreground))',
                        fontWeight: 500,
                        mr: 1
                      }}>
                        {field.label}:
                      </Box>
                      <Box component="span" sx={{ 
                        fontSize: '14px',
                        color: 'hsl(var(--foreground))'
                      }}>
                        {field.value || '_______________'}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ 
              backgroundColor: 'white',
              p: 3,
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              {[
                {
                  title: 'Student Information',
                  fields: [
                    { name: 'studentName', label: 'Full Name', type: 'text' },
                    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
                    { name: 'address', label: 'Address', type: 'text' },
                    { name: 'phoneNumber', label: 'Phone Number', type: 'tel' }
                  ]
                },
                {
                  title: 'Employer Information',
                  fields: [
                    { name: 'employerName', label: 'Employer Name', type: 'text' },
                    { name: 'employerAddress', label: 'Employer Address', type: 'text' },
                    { name: 'employerPhone', label: 'Employer Phone', type: 'tel' },
                    { name: 'jobTitle', label: 'Job Title', type: 'text' },
                    { name: 'workSchedule', label: 'Work Schedule', type: 'text', placeholder: 'e.g., Mon-Fri 4pm-8pm' },
                    { name: 'startDate', label: 'Start Date', type: 'date' }
                  ]
                },
                {
                  title: 'Parent/Guardian Information',
                  fields: [
                    { name: 'parentName', label: 'Parent/Guardian Name', type: 'text' },
                    { name: 'parentPhone', label: 'Parent/Guardian Phone', type: 'tel' },
                    { name: 'parentEmail', label: 'Parent/Guardian Email', type: 'email' }
                  ]
                }
              ].map((section, sectionIndex) => (
                <Box key={sectionIndex} sx={{ mb: 4, '&:last-child': { mb: 0 } }}>
                  <Box sx={{ 
                    mb: 2,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'hsl(var(--foreground))'
                  }}>
                    {section.title}
                  </Box>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 2
                  }}>
                    {section.fields.map((field, fieldIndex) => (
                      <Box key={fieldIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box component="label" sx={{ 
                          fontSize: '14px',
                          color: 'hsl(var(--muted-foreground))',
                          fontWeight: 500
                        }}>
                          {field.label}
                        </Box>
                        <Box
                          component="input"
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          required
                          sx={{
                            p: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid hsl(var(--border))',
                            fontSize: '14px',
                            color: 'hsl(var(--foreground))',
                            backgroundColor: 'transparent',
                            '&:focus': {
                              outline: 'none',
                              borderColor: 'hsl(var(--primary))',
                              boxShadow: '0 0 0 1px hsl(var(--primary))'
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}

              <Box
                component="button"
                type="submit"
                disabled={isLoading}
                sx={{
                  width: '100%',
                  p: '12px',
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                  opacity: isLoading ? 0.7 : 1,
                  '&:hover': {
                    opacity: 0.9
                  },
                  '&:disabled': {
                    cursor: 'not-allowed'
                  }
                }}
              >
                {isLoading ? 'Generating...' : 'Generate Work Permit'}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default WorkPermits; 