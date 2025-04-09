import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseClient';
import allScholarships from '../utils/scholarshipsData'; // Adjust the path based on your project structure
import './Colleges.css';

const Scholarships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sortOption, setSortOption] = useState('nearestDeadline');
  const [userScholarships, setUserScholarships] = useState(null); // Set to null initially to indicate loading
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [filteredScholarships, setFilteredScholarships] = useState(allScholarships);

  useEffect(() => {
    const fetchUserScholarships = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_scholarships')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setUserScholarships(data || []);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
        setUserScholarships([]);
      }
    };

    fetchUserScholarships();
  }, [user?.id]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const sortedScholarships = allScholarships.sort((a, b) => {
    switch (sortOption) {
      case 'nearestDeadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'furthestDeadline':
        return new Date(b.deadline) - new Date(a.deadline);
      case 'highestAmount':
        return parseFloat(b.amount.replace(/[$,]/g, '')) - parseFloat(a.amount.replace(/[$,]/g, ''));
      case 'lowestAmount':
        return parseFloat(a.amount.replace(/[$,]/g, '')) - parseFloat(b.amount.replace(/[$,]/g, ''));
      default:
        return 0;
    }
  });

  const handleSaveScholarship = async (scholarship) => {
    if (!user?.id) {
      alert('Please log in to save scholarships.');
      return;
    }

    // Check if scholarship already exists in user's list
    const isDuplicate = userScholarships.some(
      existingScholarship => existingScholarship.name.toLowerCase() === scholarship.name.toLowerCase()
    );

    if (isDuplicate) {
      alert('This scholarship is already in your list.');
      return;
    }

    try {
      const formattedDeadline = scholarship.deadline ? new Date(scholarship.deadline).toISOString() : null;

      const { data, error } = await supabase
        .from('user_scholarships')
        .insert({
          user_id: user.id,
          name: scholarship.name,
          description: scholarship.description,
          offered_by: scholarship.offeredBy,
          amount: scholarship.amount,
          deadline: formattedDeadline,
          grade_level: scholarship.gradeLevel,
          link: scholarship.link
        })
        .select();

      if (error) throw error;

      // Update local state with the returned data (which includes the ID)
      setUserScholarships(prev => [...(prev || []), data[0]]);
    } catch (error) {
      console.error('Error saving scholarship:', error);
      alert('Failed to save scholarship. Please try again.');
    }
  };

  const handleRemoveScholarship = async (scholarshipId) => {
    if (!user?.id) {
      alert('Please log in to remove scholarships.');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_scholarships')
        .delete()
        .eq('id', scholarshipId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setUserScholarships(prev => prev.filter(s => s.id !== scholarshipId));
    } catch (error) {
      console.error('Error removing scholarship:', error);
      alert('Failed to remove scholarship. Please try again.');
    }
  };

  const handleSelectScholarship = (scholarship) => {
    setSelectedScholarship(scholarship);
  };

  const handleSearch = (event) => {
    const searchQuery = event.target.value.toLowerCase();
    const filtered = allScholarships.filter((scholarship) =>
      scholarship.name.toLowerCase().includes(searchQuery) ||
      scholarship.description.toLowerCase().includes(searchQuery) ||
      scholarship.offeredBy.toLowerCase().includes(searchQuery)
    );
    setFilteredScholarships(filtered);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #ccc',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    noteContainer: {
      width: '100%',
      marginBottom: '24px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    notesList: {
      textAlign: 'left',
    },
    searchContainer: {
      flex: 2,
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      width: '70%',
    },
    listContainer: {
      flex: 1,
      marginLeft: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      width: '30%',
    },
    searchInput: {
      width: '100%',
      padding: '10px',
      fontSize: '14px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      marginBottom: '20px',
    },
    sortOptions: {
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    scholarshipBox: {
      border: '1px solid #ccc',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      cursor: 'pointer',
    },
    scholarshipHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      padding: '10px 20px',
      cursor: 'pointer',
    },
    scholarshipList: {
      marginTop: '20px',
    },
    sortSelect: {
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ced4da',
    },
    userScholarships: {
      marginBottom: '20px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
    },
    removeButton: {
      marginLeft: '10px',
      backgroundColor: '#dc3545',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      padding: '5px 10px',
      cursor: 'pointer',
    },
    scholarshipItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      cursor: 'pointer',
    },
    totalScholarships: {
      textAlign: 'center',
      marginBottom: '20px',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      marginTop: '40px',
      color: '#00356b',
    },
    selectedScholarshipContainer: {
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    noteText: {
      marginTop: '10px',
      fontSize: '14px',
      color: '#333',
      textAlign: 'center'
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#00356b',
      marginBottom: '20px',
      textAlign: 'center',
    },
    myScholarshipsHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center',
      color: '#000000',
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
            <span>These scholarships are not a direct part of our college application platform. We're going to begin working with independent scholarship organizations to ensure homeschooled students can qualify. In the interim, we're including a list of scholarships that homeschoolers have had previous success with. Feel free to share others via our feedback form and we'll get them added!</span>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.searchContainer}>
          <h2 style={styles.header}>Scholarship Directory</h2>
          <div style={styles.totalScholarships}>
            {allScholarships.length} Scholarships Currently in Directory
          </div>
          
          <div style={styles.sortOptions}>
            <p>Sort by:</p>
            <select value={sortOption} onChange={handleSortChange} style={styles.sortSelect}>
              <option value="nearestDeadline">Nearest Deadline</option>
              <option value="furthestDeadline">Furthest Deadline</option>
              <option value="highestAmount">Highest Amount</option>
              <option value="lowestAmount">Lowest Amount</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search for a scholarship"
            onChange={handleSearch}
            style={styles.searchInput}
          />

          <div style={styles.scholarshipList}>
            {filteredScholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                style={styles.scholarshipBox}
                onClick={() => handleSelectScholarship(scholarship)}
                className="scholarship-box"
              >
                <div style={styles.scholarshipHeader}>
                  <h3>{scholarship.name}</h3>
                  <button
                    style={styles.saveButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveScholarship(scholarship);
                    }}
                  >
                    Save
                  </button>
                </div>
                <p style={{ marginBottom: '10px' }}> <strong>Description:</strong> {scholarship.description} </p>
                <p><strong>Offered by:</strong> {scholarship.offeredBy}</p>
                <p><strong>Amount:</strong> {scholarship.amount}</p>
                <p><strong>Deadline:</strong> {scholarship.deadline}</p>
                <p><strong>Grade Level:</strong> {scholarship.gradeLevel}</p>
                <a href={scholarship.link} target="_blank" rel="noopener noreferrer">
                  Apply
                </a>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.listContainer}>
          <h2 style={styles.myScholarshipsHeader}>My Scholarships</h2>
          {userScholarships === null ? (
            <p>Loading your scholarships...</p>
          ) : userScholarships.length === 0 ? (
            <p>None saved</p>
          ) : (
            userScholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                className="scholarship-item"
                onClick={() => handleSelectScholarship(scholarship)}
              >
                <span>{scholarship.name}</span>
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (scholarship.id) {
                      handleRemoveScholarship(scholarship.id);
                    } else {
                      console.error('No scholarship ID found for deletion');
                    }
                  }}
                >
                  x
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

export default Scholarships;
