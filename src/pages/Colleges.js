import React, { useState, useEffect, useRef } from 'react';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { parseCollegeRequirements } from '../utils/parseCollegeRequirements';
import { useAuth } from '../utils/AuthContext';
import { formatDeadlineDate } from '../utils/dateUtils';
import { supabase } from '../utils/supabaseClient';
import './Colleges.css';

const formatParagraphText = (text) => {
  if (!text) return '';
  // Split by double line breaks (which Excel typically uses)
  return text.split('\n\n')
    .map(paragraph => `<p>${paragraph.trim()}</p>`)
    .join('');
};

const getCollegeLogo = (schoolName) => {
  try {
    // List of schools that need larger logos with their size multipliers
    const largerLogoSchools = {
      'Brown University': 2,
      'Emory University': 1.7,
      'Lehigh University': 1.7,
      'University of California, Berkeley': 1.7,
      'University of Wisconsin, Madison': 1.7,
      'Yale University': 1.7,
      'Boston University': 1.35
    };

    const logo = require(`../assets/College Logos/${schoolName}.png`);
    
    // Return the logo with a size multiplier if it's one of the specified schools
    return {
      src: logo,
      sizeMultiplier: largerLogoSchools[schoolName] || 1
    };
  } catch (e) {
    return null;
  }
};

const LOCAL_STORAGE_KEYS = {
  COLLEGES: 'collegesList',
  LAST_FETCH: 'collegesLastFetch',
  MY_SCHOOLS: 'mySchoolList'
};

const Colleges = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState(() => {
    const storedColleges = localStorage.getItem(LOCAL_STORAGE_KEYS.COLLEGES);
    return storedColleges ? JSON.parse(storedColleges) : [];
  });
  const [filteredColleges, setFilteredColleges] = useState(() => {
    const storedColleges = localStorage.getItem(LOCAL_STORAGE_KEYS.COLLEGES);
    return storedColleges ? JSON.parse(storedColleges) : [];
  });
  const [selectedCollege, setSelectedCollege] = useState(null);
  const { user } = useAuth();
  const [schoolList, setSchoolList] = useState(() => {
    const storedSchools = localStorage.getItem('mySchoolList');
    return storedSchools ? JSON.parse(storedSchools) : [];
  });
  const [filters, setFilters] = useState({
    location: '',
    testRequirement: ''
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const searchInputRef = useRef(null);
  const [sortBy, setSortBy] = useState('acceptance');
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Try to get data from localStorage first
      const storedColleges = localStorage.getItem(LOCAL_STORAGE_KEYS.COLLEGES);
      const lastFetch = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_FETCH);
      const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      let collegeData;
      if (storedColleges) {
        collegeData = JSON.parse(storedColleges);
        setColleges(collegeData);
        setFilteredColleges(collegeData); // Set filtered colleges immediately with stored data
      }

      // If no stored data or last fetch was more than a day ago, fetch from backend
      if (!storedColleges || !lastFetch || (Date.now() - parseInt(lastFetch)) > ONE_DAY) {
        try {
          collegeData = await parseCollegeRequirements();
          const filteredCollegeData = collegeData.filter(college => college.School);
          
          setColleges(filteredCollegeData);
          setFilteredColleges(filteredCollegeData); // Set filtered colleges with new data
          
          localStorage.setItem(LOCAL_STORAGE_KEYS.COLLEGES, JSON.stringify(filteredCollegeData));
          localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_FETCH, Date.now().toString());
        } catch (error) {
          console.error('Error fetching college data:', error);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSavedList = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_college_list')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const formattedData = data.map(school => ({
          name: school.college_name,
          deadlines: {
            earlyAction: school.early_action,
            earlyDecision: school.early_decision,
            regularDecision: school.regular_decision
          }
        }));
        
        setSchoolList(formattedData);
        localStorage.setItem('mySchoolList', JSON.stringify(formattedData));
      } catch (error) {
        console.error('Error fetching school list:', error);
        // If Supabase fails, use localStorage as fallback
        const savedSchools = localStorage.getItem('mySchoolList');
        if (savedSchools) {
          setSchoolList(JSON.parse(savedSchools));
        }
      }
    };

    fetchSavedList();
  }, [user?.id]);

  const handleSearch = (event) => {
    const searchQuery = event.target.value.toLowerCase();
    if (searchQuery === '') {
      setFilteredColleges(colleges); // Show all colleges when search is empty
    } else {
      const filtered = colleges.filter((college) =>
        college.School && college.School.toLowerCase().includes(searchQuery)
      );
      setFilteredColleges(filtered);
    }
  };

  const handleSelectCollege = (college) => {
    const selected = colleges.find(c => c.School === college.name) || college;
    setSelectedCollege(selected);
  };

  const handleAddToSchoolList = async (college) => {
    if (!user?.id) return;
    
    // Check if college already exists in the list
    if (schoolList.some(school => school.name === college.School)) {
      return;
    }

    const schoolData = {
      name: college.School,
      deadlines: {
        earlyAction: college['Early Action'] || null,
        earlyDecision: college['Early Decision'] || null,
        regularDecision: college['Regular Decision'] || null
      }
    };

    // Helper function to parse and format dates
    const formatDateForSupabase = (dateStr) => {
      if (!dateStr) return null;
      try {
        // Handle Excel date numbers
        if (!isNaN(dateStr)) {
          // Excel dates are number of days since 1/1/1900
          const excelDate = new Date(1900, 0, parseInt(dateStr) - 1);
          return excelDate.toISOString().split('T')[0];
        }
        
        // Handle text dates like "November 1"
        const cleanDate = dateStr.split('(')[0].trim(); // Remove anything in parentheses
        const date = new Date(cleanDate + ", " + new Date().getFullYear());
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.warn('Error parsing date:', dateStr);
        return null;
      }
    };

    try {
      const { error } = await supabase
        .from('user_college_list')
        .insert({
          user_id: user.id,
          college_name: college.School,
          early_action: formatDateForSupabase(college['Early Action']),
          early_decision: formatDateForSupabase(college['Early Decision']),
          regular_decision: formatDateForSupabase(college['Regular Decision'])
        });

      if (error) throw error;

      // Update local state and storage
      const updatedList = [...schoolList, schoolData];
      setSchoolList(updatedList);
      localStorage.setItem('mySchoolList', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      // Optionally show an error message to the user
    }
  };

  const handleRemoveFromSchoolList = async (college) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_college_list')
        .delete()
        .eq('user_id', user.id)
        .eq('college_name', college.School);

      if (error) throw error;

      // Update local state
      const updatedList = schoolList.filter(school => school.name !== college.School);
      setSchoolList(updatedList);
      localStorage.setItem('mySchoolList', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error removing from Supabase:', error);
      // Optionally show an error message to the user
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = (collegeList = colleges) => {
    let filtered = collegeList;

    if (filters.location) {
      filtered = filtered.filter((college) =>
        college.State && college.State.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.testRequirement) {
      filtered = filtered.filter((college) =>
        college['ACT/SAT'] && college['ACT/SAT'].toLowerCase().includes(filters.testRequirement.toLowerCase())
      );
    }

    setFilteredColleges(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const getSortedColleges = (colleges) => {
    switch (sortBy) {
      case 'alphabetical':
        return [...colleges].sort((a, b) => 
          (a.School || '').localeCompare(b.School || '')
        );
      case 'state':
        return [...colleges].sort((a, b) => 
          (a.State || '').localeCompare(b.State || '') || 
          (a.School || '').localeCompare(b.School || '')
        );
      case 'acceptance':
        return [...colleges].sort((a, b) => {
          const rateA = parseFloat(a['Acceptance Rate']) || 100;
          const rateB = parseFloat(b['Acceptance Rate']) || 100;
          return rateA - rateB;
        });
      default:
        return colleges;
    }
  };

  const handleButtonClick = async (e, college) => {
    e.stopPropagation();
    
    // Prevent multiple clicks
    if (e.target.disabled) return;
    e.target.disabled = true;

    try {
      if (schoolList.some(school => school.name === college.School)) {
        await handleRemoveFromSchoolList(college);
      } else {
        await handleAddToSchoolList(college);
      }
    } finally {
      e.target.disabled = false;
    }
  };

  const handleBackToList = () => {
    setSelectedCollege(null);
    
    // Restore scroll position after component updates
    setTimeout(() => {
      const listContainer = document.querySelector('.college-list-container');
      if (listContainer) {
        listContainer.scrollTop = scrollPosition;
      }
    }, 0);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'row',
      minHeight: 'calc(100vh - 100px)',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #ccc',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'auto',
    },
    noteContainer: {
      width: '100%',
      marginBottom: '24px',
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'left',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    searchContainer: {
      flex: 2,
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      width: '70%',
      overflowY: 'auto',
    },
    listContainer: {
      flex: 1,
      marginLeft: '20px',
      backgroundColor: '#fafafa',
      borderRadius: '8px',
      padding: '20px',
      width: '30%',
      display: 'flex',
      flexDirection: 'column',
    },
    noteText: {
      marginTop: '10px',
      fontSize: '14px',
      color: '#333',
      textAlign: 'center'
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#00356b',
    },
    filterSubtitle: {
      marginBottom: '10px',
    },
    searchInput: {
      width: '100%',
      padding: '10px',
      fontSize: '14px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      marginBottom: '20px',
    },
    filterButton: {
      width: '100%',
      padding: '10px',
      fontSize: '14px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      backgroundColor: '#007BFF',
      color: '#FFFFFF',
      cursor: 'pointer',
      textAlign: 'center',
      marginBottom: '10px',
    },
    filterContainer: {
      display: isFilterVisible ? 'block' : 'none',
      marginBottom: '10px',
    },
    filter: {
      width: '100%',
      padding: '10px',
      fontSize: '14px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      marginBottom: '10px',
    },
    list: {
      listStyleType: 'none',
      padding: 0,
      margin: '0',
      flex: 1,
      marginTop: '20px',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 200px)',
    },
    listItem: {
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: '#fafafa',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.3s',
      color: '#555',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addButton: {
      padding: '5px 10px',
      backgroundColor: '#007BFF',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    removeButton: {
      padding: '5px 10px',
      backgroundColor: '#dc3545',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    collegeInfo: {
      flex: 1,
    },
    selectedCollegeContainer: {
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      wordWrap: 'break-word', // Ensures long links wrap properly
    },
    collegeName: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
    },
    section: {
      marginBottom: '15px',
    },
    subHeader: {
      fontWeight: 'bold',
      fontSize: '16px',
      marginBottom: '10px',
      color: '#333',
    },
    text: {
      marginBottom: '15px',
      fontSize: '14px',
      marginLeft: '15px',
      color: '#555',
      '& p': {  // Style for paragraphs
        marginBottom: '1em',
        lineHeight: '1.5'
      }
    },
    link: {
      color: '#007BFF',
      textDecoration: 'none',
      fontSize: '14px',
      wordWrap: 'break-word', // Ensure long links wrap across multiple lines
    },
    socialLinks: {
      display: 'flex',
      gap: '10px',
      marginBottom: '10px',
    },
    deadlineBox: {
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '10px',
      fontSize: '14px',
    },
    backButton: {
      padding: '8px 16px',
      backgroundColor: '#6c757d',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '20px',
      fontSize: '14px',
      width: 'fit-content',  // Make button width fit content
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#007BFF',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '10px',
      fontSize: '14px',
    },
    logo: {
      width: '150px',
      height: 'auto',
      marginBottom: '20px',
    },
    youtubeContainer: {
      margin: '10px 0',
    },
    youtubeVideo: {
      width: '100%',
      height: '500px',
    },
    schoolListHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center',
    },
    schoolListItem: {
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: '#fafafa',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      color: '#555',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    collegeDetailContainer: {
      display: 'flex',
      gap: '20px',
      width: '100%',
      padding: '20px',
      overflow: 'auto',
    },
    leftColumn: {
      flex: '75%',
      overflow: 'auto',
    },
    rightColumn: {
      flex: '25%',
      overflow: 'auto',
    },
    headerSection: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    },
    logoAndTitle: {
      display: 'flex',
      alignItems: 'center',  // Changed from flex-start to center
      gap: '20px',
      marginBottom: '15px',
    },
    logoPlaceholder: {
      width: '80px',
      height: '80px',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    titleLocation: {
      flex: 1,
    },
    divider: {
      borderTop: '1px solid #ddd',
      margin: '15px 0',
    },
    requirementsSection: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    rightSectionBox: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    },
    collegeName: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '5px',  // Reduced margin to bring location closer
      color: '#00356b',
    },
    locationText: {
      fontSize: '16px',
      color: '#555',
      margin: 0,
    },
    sortContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
    },
    sortLabel: {
      fontSize: '14px',
      color: '#555',
      fontWeight: 'bold',
    },
    sortSelect: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      fontSize: '14px',
      color: '#555',
      backgroundColor: '#fff',
      cursor: 'pointer',
      minWidth: '150px',
    },
    listItemContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flex: 1,
    },
    listItemLogo: {
      width: '50px',
      height: '50px',
      backgroundColor: '#fafafa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      fontSize: '12px',
      overflow: 'hidden',
    },
    listItemInfo: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      flex: 1,  // Take up available space
    },
    listItemStats: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',  // Three columns: info, acceptance rate, button
      alignItems: 'center',
      gap: '20px',
      width: '100%',
    },
    acceptanceRate: {
      fontSize: '14px',
      color: '#555',
      whiteSpace: 'nowrap',  // Prevent wrapping
      textAlign: 'center',   // Changed from 'right' to 'center'
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center', // Add this to center horizontally
      height: '100%',
      marginRight: '50px',   // Add right buffer
    },
    listItemName: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#00356b',
      marginBottom: '4px',
    },
    listItemLocation: {
      fontSize: '14px',
      color: '#555',
    },
    deadlineContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    deadlineItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',  // Match the size of requirements text
      color: '#555',     // Match the color of requirements text
      marginLeft: '15px' // Match the left margin of requirements text
    },
    deadlineLabel: {
      fontWeight: 'bold',
    },
    deadlineValue: {
      marginLeft: '10px',
    },
    acceptanceText: {
      fontSize: '14px',
      color: '#666',
      margin: '5px 0 0 0',
    },
    columnLabels: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto', // Match listItemStats grid
      gap: '20px',
      padding: '0 10px', // Match listItem padding
      marginBottom: '10px',
      color: '#555',
      fontSize: '14px', // Match listItemLocation size
      alignItems: 'center',
    },
    columnLabel: {
      fontWeight: 'bold',
    },
  };

  return (
    <Container 
      maxWidth="var(--container-max-width)"
      sx={{ 
        px: 'var(--container-padding-x)',
        py: 'var(--spacing-6)',
        '@media (--tablet)': {
          px: 'var(--container-padding-x-mobile)',
        },
      }}
    >
      {/* Main content */}
      <div style={styles.content}>
        <div style={styles.noteContainer}>
          <div style={styles.notesList}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#00356b'
            }}>Notes from YourEDU:</h3>
            
            <div style={{
              display: 'flex',
              marginBottom: '12px',
              paddingLeft: '20px'
            }}>
              <span style={{ minWidth: '35px', fontSize: '16px' }}>1️⃣</span>
              <span>We are adding more colleges everyday as we work with them. If a college that you're interested in is not currently listed, let us know in the feedback form and we'll work quickly to get their information on this page!</span>
            </div>
          </div>
        </div>

        <div style={styles.container}>
          {!selectedCollege ? (
            <>
              <div style={styles.searchContainer}>
                <h2 style={styles.header}>College Search</h2>
                
                <div style={styles.sortContainer}>
                  <span style={styles.sortLabel}>Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={styles.sortSelect}
                  >
                    <option value="alphabetical">College Name (A-Z)</option>
                    <option value="state">State (A-Z)</option>
                    <option value="acceptance">Acceptance Rate</option>
                  </select>
                </div>

                <div style={styles.filterContainer}>
                  <select name="location" onChange={handleFilterChange} style={styles.filter}>
                    <option value="">Select Location</option>
                    {["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"].map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <select name="testRequirement" onChange={handleFilterChange} style={styles.filter}>
                    <option value="">Testing Requirements</option>
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                    <option value="not required">Not Required</option>
                  </select>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for a college"
                  onChange={handleSearch}
                  style={styles.searchInput}
                />
                <div className="college-list-container" style={styles.list}>
                  <div style={styles.columnLabels}>
                    <div style={styles.columnLabel}>College & Location</div>
                    <div style={{...styles.columnLabel, textAlign: 'right'}}>Acceptance Rate</div>
                    <div style={{width: '40px'}}>
                      {/* Empty space for the add/remove button column */}
                    </div>
                  </div>
                  {getSortedColleges(filteredColleges).map((college, index) => (
                    <li 
                      key={index} 
                      onClick={() => handleSelectCollege(college)} 
                      style={styles.listItem}
                      className="college-list-item"
                    >
                      <div style={styles.listItemContent}>
                        <div style={styles.listItemLogo}>
                          {getCollegeLogo(college.School) ? (
                            <img 
                              src={getCollegeLogo(college.School).src} 
                              alt={`${college.School} logo`}
                              style={{
                                width: `${getCollegeLogo(college.School).sizeMultiplier * 100}%`,
                                height: `${getCollegeLogo(college.School).sizeMultiplier * 100}%`,
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            'Logo'
                          )}
                        </div>
                        <div style={styles.listItemStats}>
                          <div style={styles.listItemInfo}>
                            <div style={styles.listItemName}>{college.School}</div>
                            <div style={styles.listItemLocation}>
                              {college.City && college.State ? 
                                `${college.City}, ${college.State}` : 
                                college.State || ''}
                            </div>
                          </div>
                          <div style={styles.acceptanceRate}>
                            {college['Acceptance Rate'] ? 
                              `${parseFloat(college['Acceptance Rate'])}%` : 
                              'N/A'}
                          </div>
                          <button 
                            style={schoolList.some(school => school.name === college.School) ? styles.removeButton : styles.addButton}
                            onClick={(e) => handleButtonClick(e, college)}
                            title={schoolList.some(school => school.name === college.School) ? "Remove from My School List" : "Add to My School List"}
                          >
                            {schoolList.some(school => school.name === college.School) ? '-' : '+'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </div>
              </div>
              <div style={styles.listContainer}>
                <h2 style={styles.schoolListHeader}>My School List</h2>
                {schoolList.length > 0 ? (
                  <ul style={styles.list}>
                    {schoolList.map((school, index) => {
                      const collegeData = colleges.find(c => c.School === school.name) || school;
                      return (
                        <li 
                          key={index} 
                          onClick={() => handleSelectCollege(collegeData)} 
                          style={styles.listItem}
                          className="school-list-item"
                        >
                          <div style={styles.listItemContent}>
                            <div style={styles.listItemLogo}>
                              {getCollegeLogo(school.name) ? (
                                <img 
                                  src={getCollegeLogo(school.name).src} 
                                  alt={`${school.name} logo`}
                                  style={{
                                    width: `${getCollegeLogo(school.name).sizeMultiplier * 100}%`,
                                    height: `${getCollegeLogo(school.name).sizeMultiplier * 100}%`,
                                    objectFit: 'contain'
                                  }}
                                />
                              ) : (
                                'Logo'
                              )}
                            </div>
                            <div style={styles.listItemInfo}>
                              <div style={styles.listItemName}>{school.name}</div>
                              <div style={styles.listItemLocation}>
                                {collegeData?.City && collegeData?.State ? 
                                  `${collegeData.City}, ${collegeData.State}` : 
                                  collegeData?.State || ''}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p style={styles.text}>No schools added yet.</p>
                )}
              </div>
            </>
          ) : (
            <div style={styles.collegeDetailContainer}>
              <div style={styles.leftColumn}>
                <div style={styles.headerSection}>
                  <div style={styles.logoAndTitle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={styles.logoPlaceholder}>
                        {getCollegeLogo(selectedCollege.School) ? (
                          <img 
                            src={getCollegeLogo(selectedCollege.School).src} 
                            alt={`${selectedCollege.School} logo`}
                            style={{
                              width: `${getCollegeLogo(selectedCollege.School).sizeMultiplier * 100}%`,
                              height: `${getCollegeLogo(selectedCollege.School).sizeMultiplier * 100}%`,
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          'Logo'
                        )}
                      </div>
                      <div style={styles.titleLocation}>
                        <h2 style={styles.collegeName}>{selectedCollege.School}</h2>
                        <p style={styles.locationText}>
                          {selectedCollege.City && selectedCollege.State ? 
                            `${selectedCollege.City}, ${selectedCollege.State}` : 
                            selectedCollege.State || ''}
                        </p>
                        {selectedCollege['Acceptance Rate'] && (
                          <p style={styles.acceptanceText}>
                            {`${parseFloat(selectedCollege['Acceptance Rate'])}% Acceptance Rate`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleBackToList} 
                      style={{
                        ...styles.button,
                        marginTop: 0,
                        marginLeft: 'auto'
                      }}
                    >
                      Back
                    </button>
                  </div>
                  <div style={styles.divider} />
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formatParagraphText(selectedCollege.Paragraph) 
                    }}
                    style={styles.text}
                  />
                </div>
              </div>

              <div style={styles.rightColumn}>
                <div style={styles.rightSectionBox}>
                  {schoolList.some(school => school.name === selectedCollege.School) ? (
                    <button style={styles.button} onClick={() => handleRemoveFromSchoolList(selectedCollege)}>
                      Remove from My School List
                    </button>
                  ) : (
                    <button style={styles.button} onClick={() => handleAddToSchoolList(selectedCollege)}>
                      Add to My School List
                    </button>
                  )}
                </div>

                <div style={styles.rightSectionBox}>
                  <h3 style={styles.subHeader}>Homeschool Application Website</h3>
                  <a href={selectedCollege['Homeschool App Website']} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     style={styles.link}>
                    Visit Page
                  </a>
                </div>

                <div style={styles.rightSectionBox}>
                  <h3 style={styles.subHeader}>Application Deadlines</h3>
                  <div style={styles.deadlineContainer}>
                    <div style={styles.deadlineItem}>
                      <span style={styles.deadlineLabel}>Early Action:</span>
                      <span style={styles.deadlineValue}>
                        {selectedCollege['Early Action'] ? formatDeadlineDate(selectedCollege['Early Action']) : 'N/A'}
                      </span>
                    </div>
                    <div style={styles.deadlineItem}>
                      <span style={styles.deadlineLabel}>Early Decision:</span>
                      <span style={styles.deadlineValue}>
                        {selectedCollege['Early Decision'] ? formatDeadlineDate(selectedCollege['Early Decision']) : 'N/A'}
                      </span>
                    </div>
                    <div style={styles.deadlineItem}>
                      <span style={styles.deadlineLabel}>Regular Decision:</span>
                      <span style={styles.deadlineValue}>
                        {selectedCollege['Regular Decision'] ? formatDeadlineDate(selectedCollege['Regular Decision']) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.rightSectionBox}>
                  <h3 style={styles.subHeader}>Application Requirements</h3>
                  <p style={styles.text}><strong>Transcript:</strong> {selectedCollege.Transcript}</p>
                  <p style={styles.text}><strong>ACT/SAT:</strong> {selectedCollege['ACT/SAT']}</p>
                  <p style={styles.text}><strong>AP/Advanced Courses:</strong> {selectedCollege['AP/Advanced Courses']}</p>
                  <p style={styles.text}><strong>Letters of Rec:</strong> {selectedCollege.LoRs}</p>
                  <p style={styles.text}><strong>School Profile Report:</strong> {selectedCollege['Secondary School Report']}</p>
                  <p style={styles.text}><strong>Course Descriptions:</strong> {selectedCollege['Course Descriptions']}</p>
                  <p style={styles.text}><strong>Additional Requirements:</strong> {selectedCollege['Additional Requirement']}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Colleges;