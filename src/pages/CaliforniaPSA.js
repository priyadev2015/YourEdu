const styles = {
  container: {
    padding: 'var(--container-padding-x)',
    minHeight: '100vh',
    backgroundColor: 'white',
    '@media (--tablet)': {
      padding: 'var(--container-padding-x-mobile)',
    },
  },
  headerContainer: {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#2d3748',
    '&:hover': {
      backgroundColor: '#f7fafc',
    },
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tabContainer: {
    width: '280px',
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px 0 0 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderRight: '1px solid #e2e8f0',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
    '&:hover': {
      backgroundColor: '#e2e8f0',
    },
  },
  tabIcon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    padding: '32px',
    maxWidth: 'calc(100% - 280px)',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2d3748',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    '&:focus': {
      outline: 'none',
      borderColor: '#4299e1',
    },
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  finalButtons: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
    justifyContent: 'flex-end',
  },
  submitAffidavitButton: {
    padding: '12px 24px',
    backgroundColor: '#2563EB',
    color: 'white',
    height: 36,
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'none',
    boxShadow: 'none',
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#2563EB',
      boxShadow: 'none'
    }
  },
  printButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#2d3748',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f7fafc',
    },
  },
  tabStep: {
    fontSize: '14px',
    width: '60px',
    textAlign: 'left',
    fontWeight: '600',
  },
  printPreview: {
    padding: '20px',
    backgroundColor: 'white',
    '@media print': {
      padding: '0',
    },
  },
  printTitle: {
    fontSize: '24_machine_comment_start_px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#00356b',
    textAlign: 'center',
  },
  printSection: {
    marginBottom: '30px',
    pageBreakInside: 'avoid',
  },
  printField: {
    marginBottom: '10px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  printTotal: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #e2e8f0',
    fontWeight: '500',
  },
  printFooter: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '12px',
    color: '#718096',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: '8px',
    top: '8px',
  },
  previewButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '20px',
    '@media print': {
      display: 'none',
    },
  },
  numberInput: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    width: '120px',
    backgroundColor: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#4299e1',
      boxShadow: '0 0 0 1px #4299e1',
    },
  },
  ageInputGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  enrollmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  staffGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  totalEnrollment: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#2d3748',
  },
  totalStaff: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#2d3748',
  },
  subSectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '16px',
    marginTop: '32px',
  },
  sectionDescription: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  progressContainer: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minWidth: '200px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
  },
  progressText: {
    fontSize: '14px',
    color: '#4a5568',
    whiteSpace: 'nowrap',
  },
  statusChip: {
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '500',
    marginLeft: '8px',
  },
  formField: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '16px',
  },
  stepper: {
    marginBottom: '24px',
  },
  helperText: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '16px',
    lineHeight: '1.5',
    display: 'block'
  },
  requiredStar: {
    color: '#FF0000',
    marginLeft: '2px',
  },
  errorMessage: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  errorList: {
    marginTop: '8px',
    paddingLeft: '20px',
  },
  errorItem: {
    marginBottom: '4px',
  },
  reviewContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  reviewSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  reviewSubheading: {
    fontSize: '1.25rem',
    color: '#2d3748',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: '600',
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid #edf2f7',
  },
  reviewLabel: {
    flex: '0 0 40%',
    color: '#4a5568',
    fontWeight: '500',
    paddingRight: '1rem',
  },
  reviewValue: {
    flex: '0 0 60%',
    color: '#2d3748',
    textAlign: 'left',
    wordBreak: 'break-word',
  },
  reviewTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#edf2f7',
    borderRadius: '6px',
    fontWeight: '600',
  },
  finalButtons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
    gap: '1rem',
  },
  submitAffidavitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#00356b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#002548',
    },
  },
};

// Utility function to format dates to 'YYYY-MM-DD'
const formatDateForPostgres = (inputDate) => {
  if (!inputDate) return null;
  const date = new Date(inputDate);
  return isNaN(date) ? null : date.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
};

// Component Definition
const NewYorkPSA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
  const [signature, setSignature] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0], // Default to today in 'YYYY-MM-DD'
  });
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({ percent: 0, status: 'Not Started' });
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    missingFields: [],
  });

  const [formData, setFormData] = useState({
    parent_name: '',
    email: '',
    phone: '',
    address: '',
    student_name: '',
    dob: '',
    grade_level: '',
    courses: {
      english: { plan: '', materials: '' },
      math: { plan: '', materials: '' },
      science: { plan: '', materials: '' },
      social_studies: { plan: '', materials: '' },
      health: { plan: '', materials: '' },
      physical_education: { plan: '', materials: '' },
      art: { plan: '', materials: '' },
      music: { plan: '', materials: '' },
    },
    quarterly_report_dates: ['', '', '', ''],
    instructor_name: '',
    acknowledgments: {
      quarterly_reports: false,
      annual_assessment: false,
      no_regents_diploma: false,
      no_state_aid: false,
      immunization_policies: false,
    },
  });

  const initialFormData = { ...formData }; // For resetting after submission

  // Mapping Functions
  const mapDbToForm = (dbData) => ({
    parent_name: dbData.parent_name || '',
    email: dbData.parent_email || '',
    phone: dbData.parent_phone || '',
    address: dbData.parent_address || '',
    student_name: dbData.student_name || '',
    dob: dbData.student_dob || '',
    grade_level: dbData.student_grade || '',
    courses: {
      english: { plan: dbData.english_plan || '', materials: dbData.english_materials || '' },
      math: { plan: dbData.math_plan || '', materials: dbData.math_materials || '' },
      science: { plan: dbData.science_plan || '', materials: dbData.science_materials || '' },
      social_studies: { plan: dbData.social_studies_plan || '', materials: dbData.social_studies_materials || '' },
      health: { plan: dbData.health_plan || '', materials: dbData.health_materials || '' },
      physical_education: { plan: dbData.physical_education_plan || '', materials: dbData.physical_education_materials || '' },
      art: { plan: dbData.art_plan || '', materials: dbData.art_materials || '' },
      music: { plan: dbData.music_plan || '', materials: dbData.music_materials || '' },
    },
    quarterly_report_dates: [
      dbData.q1_date || '',
      dbData.q2_date || '',
      dbData.q3_date || '',
      dbData.q4_date || '',
    ],
    instructor_name: dbData.instructor || '',
    acknowledgments: {
      quarterly_reports: dbData.acknowledge_quarterly_reports || false,
      annual_assessment: dbData.acknowledge_annual_assessment || false,
      no_regents_diploma: dbData.acknowledge_no_regents_diploma || false,
      no_state_aid: dbData.acknowledge_no_state_aid || false,
      immunization_policies: dbData.acknowledge_immunization_policies || false,
    },
  });

  const mapFormToDb = (formData) => ({
    parent_name: formData.parent_name,
    parent_email: formData.email,
    parent_phone: formData.phone,
    parent_address: formData.address,
    student_name: formData.student_name,
    student_dob: formatDateForPostgres(formData.dob),
    student_grade: formData.grade_level,
    english_plan: formData.courses.english.plan,
    english_materials: formData.courses.english.materials,
    math_plan: formData.courses.math.plan,
    math_materials: formData.courses.math.materials,
    science_plan: formData.courses.science.plan,
    science_materials: formData.courses.science.materials,
    social_studies_plan: formData.courses.social_studies.plan,
    social_studies_materials: formData.courses.social_studies.materials,
    health_plan: formData.courses.health.plan,
    health_materials: formData.courses.health.materials,
    physical_education_plan: formData.courses.physical_education.plan,
    physical_education_materials: formData.courses.physical_education.materials,
    art_plan: formData.courses.art.plan,
    art_materials: formData.courses.art.materials,
    music_plan: formData.courses.music.plan,
    music_materials: formData.courses.music.materials,
    q1_date: formatDateForPostgres(formData.quarterly_report_dates[0]),
    q2_date: formatDateForPostgres(formData.quarterly_report_dates[1]),
    q3_date: formatDateForPostgres(formData.quarterly_report_dates[2]),
    q4_date: formatDateForPostgres(formData.quarterly_report_dates[3]),
    instructor: formData.instructor_name,
    acknowledge_quarterly_reports: formData.acknowledgments.quarterly_reports,
    acknowledge_annual_assessment: formData.acknowledgments.annual_assessment,
    acknowledge_no_regents_diploma: formData.acknowledgments.no_regents_diploma,
    acknowledge_no_state_aid: formData.acknowledgments.no_state_aid,
    acknowledge_immunization_policies: formData.acknowledgments.immunization_policies,
  });

  const tabs = [
    { id: 1, title: 'Parent Information', step: 'Step 1' },
    { id: 2, title: 'Student Information', step: 'Step 2' },
    { id: 3, title: 'IHIP Content', step: 'Step 3' },
    { id: 4, title: 'Acknowledgments', step: 'Step 4' },
    { id: 5, title: 'Review & Submit', step: 'Step 5' },
  ];

  useEffect(() => {
    if (user) {
      loadFormData();
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ny_compliance_forms')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFormData(mapDbToForm(data));
      }
    } catch (error) {
      console.error('Error loading IHIP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFormData = useCallback(
    debounce(async (data) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from('ny_compliance_forms')
          .upsert(
            {
              ...mapFormToDb(data),
              user_id: user.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
        if (error) throw error;
      } catch (error) {
        console.error('Error saving IHIP data:', error);
      }
    }, 1000),
    [user]
  );

  useEffect(() => {
    const calculateProgress = () => {
      const requiredFields = [
        'parent_name', 'address', 'student_name', 'dob', 'grade_level',
        'courses.english.plan', 'courses.math.plan', 'courses.science.plan',
        'courses.social_studies.plan', 'instructor_name',
        'acknowledgments.quarterly_reports',
      ];

      let filledFields = 0;
      requiredFields.forEach((field) => {
        if (field.includes('.')) {
          const [parent, child, grandChild] = field.split('.');
          if (grandChild) {
            if (formData[parent][child][grandChild]) filledFields++;
          } else if (formData[parent][child]) filledFields++;
        } else if (formData[field]) filledFields++;
      });

      const percent = Math.round((filledFields / requiredFields.length) * 100);
      const status = percent === 100 ? 'Completed' : percent > 0 ? 'In Progress' : 'Not Started';
      setCompletionStatus({ percent, status });
    };

    calculateProgress();
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child, grandChild] = name.split('.');
      if (grandChild) {
        setFormData((prev) => {
          const newData = {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: {
                ...prev[parent][child],
                [grandChild]: type === 'checkbox' ? checked : value,
              },
            },
          };
          saveFormData(newData);
          return newData;
        });
      } else {
        setFormData((prev) => {
          const newData = {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: type === 'checkbox' ? checked : value,
            },
          };
          saveFormData(newData);
          return newData;
        });
      }
    } else {
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
        };
        saveFormData(newData);
        return newData;
      });
    }
  };

  const handleQuarterlyDateChange = (index, value) => {
    setFormData((prev) => {
      const newDates = [...prev.quarterly_report_dates];
      newDates[index] = value; // Value from date picker is already 'YYYY-MM-DD'
      const newData = { ...prev, quarterly_report_dates: newDates };
      saveFormData(newData);
      return newData;
    });
  };

  const handleSubmit = async () => {
    const missingFields = [];
    const requiredFieldsByStep = {
      1: [
        { field: 'parent_name', label: 'Parent Name' },
        { field: 'address', label: 'Home Address' },
      ],
      2: [
        { field: 'student_name', label: 'Student Name' },
        { field: 'grade_level', label: 'Grade Level' },
      ],
      3: [
        { field: 'courses.english.plan', label: 'English Course Plan' },
        { field: 'courses.math.plan', label: 'Math Course Plan' },
        { field: 'courses.science.plan', label: 'Science Course Plan' },
        { field: 'courses.social_studies.plan', label: 'Social Studies Course Plan' },
        { field: 'instructor_name', label: 'Instructor Name' },
      ],
      4: [
        { field: 'acknowledgments.quarterly_reports', label: 'Quarterly Reports Acknowledgment' },
      ],
    };

    Object.entries(requiredFieldsByStep).forEach(([step, fields]) => {
      fields.forEach(({ field, label }) => {
        let value;
        if (field.includes('.')) {
          const [parent, child, grandChild] = field.split('.');
          value = grandChild ? formData[parent]?.[child]?.[grandChild] : formData[parent]?.[child];
        } else {
          value = formData[field];
        }
        if (!value && value !== false) {
          missingFields.push({
            field: label,
            step: `Step ${step}: ${tabs[parseInt(step) - 1].title}`,
          });
        }
      });
    });

    if (missingFields.length > 0) {
      const groupedMissingFields = missingFields.reduce((acc, item) => {
        const step = item.step;
        if (!acc[step]) acc[step] = [];
        acc[step].push(item.field);
        return acc;
      }, {});
      setErrorDialog({ open: true, missingFields: groupedMissingFields });
      return;
    }

    setOpenSignatureDialog(true);
  };

  const handleSignAndSubmit = async () => {
    try {
      // Log dates to verify formatting before submission
      console.log('Formatted DOB:', formatDateForPostgres(formData.dob));
      console.log('Formatted Quarterly Dates:', formData.quarterly_report_dates.map(date => formatDateForPostgres(date)));
      console.log('Formatted Signature Date:', formatDateForPostgres(signature.date));

      const { error } = await supabase
        .from('ny_compliance_forms')
        .upsert(
          {
            ...mapFormToDb(formData),
            user_id: user.id,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            signature_name: signature.name,
            signature_date: formatDateForPostgres(signature.date),
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      toast.success('IHIP submitted successfully!');
      navigate('/compliance/regulations');
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error submitting IHIP:', error);
      toast.error('Failed to submit IHIP');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 1: // Parent Information
        return (
          <div style={styles.section}>
            <Typography variant="h2" style={styles.sectionTitle}>Parent Information</Typography>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Parent/Guardian Full Name<span style={styles.requiredStar}>*</span>
                <input
                  type="text"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Email Address
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Home Address<span style={styles.requiredStar}>*</span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>
          </div>
        );
      case 2: // Student Information
        return (
          <div style={styles.section}>
            <Typography variant="h2" style={styles.sectionTitle}>Student Information</Typography>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Student Full Name<span style={styles.requiredStar}>*</span>
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Date of Birth<span style={styles.requiredStar}></span>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Current Grade Level<span style={styles.requiredStar}>*</span>
                <select
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select Grade</option>
                  {Array.from({ length: 13 }, (_, i) => i).map((grade) => (
                    <option key={grade} value={grade === 0 ? 'K' : grade}>
                      {grade === 0 ? 'Kindergarten' : `Grade ${grade}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        );
      case 3: // IHIP Content
        return (
          <div style={styles.section}>
            <Typography variant="h2" style={styles.sectionTitle}>IHIP Content</Typography>
            <Typography style={styles.sectionDescription}>
              Please provide the course plan and materials for required subjects.
            </Typography>

            <div style={styles.courseList}>
              {Object.entries(formData.courses).map(([subject, details]) => (
                <Box key={subject}>
                  <Typography style={styles.subSectionTitle}>
                    {subject.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
                  </Typography>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      Course Plan{['english', 'math', 'science', 'social_studies'].includes(subject) && 
                        <span style={styles.requiredStar}>*</span>}
                      <textarea
                        name={`courses.${subject}.plan`}
                        value={details.plan}
                        onChange={handleInputChange}
                        style={{ ...styles.input, minHeight: '100px' }}
                      />
                    </label>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      Instructional Materials
                      <textarea
                        name={`courses.${subject}.materials`}
                        value={details.materials}
                        onChange={handleInputChange}
                        style={{ ...styles.input, minHeight: '100px' }}
                      />
                    </label>
                  </div>
                </Box>
              ))}
            </div>

            <Typography style={styles.subSectionTitle}>Quarterly Report Dates</Typography>
            <div style={styles.fieldGroup}>
              {formData.quarterly_report_dates.map((date, index) => (
                <label key={index} style={styles.label}>
                  Quarter {index + 1} Date
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleQuarterlyDateChange(index, e.target.value)}
                    style={styles.input}
                  />
                </label>
              ))}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Instructor Name<span style={styles.requiredStar}>*</span>
                <input
                  type="text"
                  name="instructor_name"
                  value={formData.instructor_name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>
          </div>
        );
      case 4: // Acknowledgments
        return (
          <div style={styles.section}>
            <Typography variant="h2" style={styles.sectionTitle}>Acknowledgments</Typography>
            <Typography style={styles.sectionDescription}>
              Please confirm your understanding of the following regulations:
            </Typography>
            <div style={styles.checkboxGroup}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="acknowledgments.quarterly_reports"
                    checked={formData.acknowledgments.quarterly_reports}
                    onChange={handleInputChange}
                    required
                  />
                }
                label="I understand the quarterly report requirement"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="acknowledgments.annual_assessment"
                    checked={formData.acknowledgments.annual_assessment}
                    onChange={handleInputChange}
                  />
                }
                label="I understand the annual assessment obligation"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="acknowledgments.no_regents_diploma"
                    checked={formData.acknowledgments.no_regents_diploma}
                    onChange={handleInputChange}
                  />
                }
                label="I understand the child will not receive a Regents diploma"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="acknowledgments.no_state_aid"
                    checked={formData.acknowledgments.no_state_aid}
                    onChange={handleInputChange}
                  />
                }
                label="I understand that state aid will not be provided"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="acknowledgments.immunization_policies"
                    checked={formData.acknowledgments.immunization_policies}
                    onChange={handleInputChange}
                  />
                }
                label="I understand the immunization/health service policies"
              />
            </div>
          </div>
        );
      case 5: // Review & Submit
        return (
          <div style={styles.reviewContainer}>
            <Typography variant="h2" style={{ ...styles.sectionTitle, textAlign: 'center' }}>
              Review Your IHIP Submission
            </Typography>
            <Typography style={{ ...styles.sectionDescription, textAlign: 'center', marginBottom: '2rem' }}>
              Please review all information before submitting to the superintendent.
            </Typography>

            <div style={styles.reviewSection}>
              <Typography style={styles.reviewSubheading}>Parent Information</Typography>
              <div style={styles.reviewItem}><span style={styles.reviewLabel}>Name</span><span style={styles.reviewValue}>{formData.parent_name}</span></div>
              <div style={styles.reviewItem}><span style={styles.reviewLabel}>Email</span><span style={styles.reviewValue}>{formData.email || 'N/A'}</span></div>
              <div style={styles.reviewItem}><span style={styles.reviewLabel}>Phone</span><span style={styles.reviewValue}>{formData.phone || 'N/A'}</span></div>
              <div style={styles.reviewItem}><span style={styles.reviewLabel}>Address</span><span style={styles.reviewValue}>{formData.address}</span></div>
            </div>

            <div style={styles.reviewSection}>
              <Typography style={styles.reviewSubheading}>Student Information</Typography>
              <div style={styles.reviewItem}><span style={styles.reviewLabel}>Name</span><span style={styles.reviewValue}>{formData.student_name}</span></div>
              <div style={styles.reviewItem}><span style={styles.reviewLabel}>Date of Birth</span><span style={styles.reviewValue}>{formData.dob}</span></div>
              <div style={styles.reviewItem}><span style={styles.reviewLabel}>Grade Level</span><span style={styles.reviewValue}>{formData.grade_level}</span></div>
            </div>

            <div style={styles.reviewSection}>
              <Typography style={styles.reviewSubheading}>IHIP Content</Typography>
              {Object.entries(formData.courses).map(([subject, details]) => (
                <div key={subject}>
                  <div style={styles.reviewItem}>
                    <span style={styles.reviewLabel}>{subject.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())} Plan</span>
                    <span style={styles.reviewValue}>{details.plan || 'Not specified'}</span>
                  </div>
                  <div style={styles.reviewItem}>
                    <span style={styles.reviewLabel}>Materials</span>
                    <span style={styles.reviewValue}>{details.materials || 'Not specified'}</span>
                  </div>
                </div>
              ))}
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Quarterly Report Dates</span>
                <span style={styles.reviewValue}>{formData.quarterly_report_dates.filter(Boolean).join(', ') || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Instructor</span>
                <span style={styles.reviewValue}>{formData.instructor_name}</span>
              </div>
            </div>

            <div style={styles.reviewSection}>
              <Typography style={styles.reviewSubheading}>Acknowledgments</Typography>
              {Object.entries(formData.acknowledgments).map(([key, value]) => (
                <div key={key} style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>{key.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}</span>
                  <span style={styles.reviewValue}>{value ? 'Yes' : 'No'}</span>
                </div>
              ))}
            </div>

            <div style={styles.finalButtons}>
              <Button
                onClick={handleSubmit}
                style={styles.submitAffidavitButton}
              >
                Submit IHIP
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!user) return null;

  return (
    <div style={styles.container}>
      <ImportantNoteCard sx={{ mb: 3 }}>
        This is the Individualized Home Instruction Plan (IHIP) form required by the New York State Education Department (NYSED).
      </ImportantNoteCard>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#4a5568' }}>Progress</Typography>
            <Typography variant="body2" sx={{ color: '#4a5568' }}>{completionStatus.percent}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionStatus.percent}
            sx={{ height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', '& .MuiLinearProgress-bar': { backgroundColor: '#2563EB' } }}
          />
        </Box>
      </Box>

      <Box sx={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', minHeight: '600px' }}>
        <Box sx={{ width: '300px', flexShrink: 0, borderRight: '1px solid #e2e8f0', backgroundColor: 'white' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <Typography sx={{ color: '#000000', fontWeight: 600, fontSize: '1.125rem' }}>Required Steps</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: activeTab === tab.id ? '#e6f0ff' : 'transparent',
                  color: activeTab === tab.id ? '#2563EB' : '#4a5568',
                  '&:hover': { backgroundColor: activeTab === tab.id ? '#e6f0ff' : '#f7fafc' },
                  textAlign: 'left',
                  px: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                <Box component="span" sx={{ mr: 2, color: '#4a5568' }}>{tab.step}</Box>
                {tab.title}
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ flex: 1, p: 4, backgroundColor: 'white' }}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {renderTabContent()}
          </form>
        </Box>
      </Box>

      <Dialog
        open={openSignatureDialog}
        onClose={() => setOpenSignatureDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <FeatureHeader>Electronically Sign IHIP</FeatureHeader>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1">
              I certify that this IHIP is complete and accurate to the best of my knowledge.
            </Typography>
            <TextField
              fullWidth
              label="Full Name"
              value={signature.name}
              onChange={(e) => setSignature({ ...signature, name: e.target.value })}
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={signature.date}
              onChange={(e) => setSignature({ ...signature, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenSignatureDialog(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={handleSignAndSubmit}
            variant="contained"
            disabled={!signature.name || !signature.date}
          >
            Sign & Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ ...errorDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#DC2626' }}>
            Required Fields Missing
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please complete the following required fields:
          </Typography>
          <Box sx={{ maxHeight: '300px', overflowY: 'auto', mb: 2 }}>
            {Object.entries(errorDialog.missingFields).map(([step, fields]) => (
              <Box key={step} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1A202C', mb: 1 }}>{step}</Typography>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {fields.map((field, index) => (
                    <li key={index} style={{ padding: '4px 0', color: '#4B5563', display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>•</span>
                      {field}
                    </li>
                  ))}
                </ul>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setErrorDialog({ ...errorDialog, open: false })} variant="contained">
            Continue Editing
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const keyframeStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

if (!document.getElementById('ihip-keyframes')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'ihip-keyframes';
  styleTag.innerHTML = keyframeStyles;
  document.head.appendChild(styleTag);
}

export default NewYorkPSA;
