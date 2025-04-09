import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Button, Select, MenuItem, FormControl, Typography } from '@mui/material';
import { BodyText } from '../components/ui/typography';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseClient';
import StateComplianceFiling from './StateComplianceFiling';
import NewYorkComplianceFiling from "./NewYorkCompliaceFiling";
import { toast } from 'react-hot-toast';

const stateAbbreviations = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI',
  'Wyoming': 'WY'
};

const reverseStateAbbreviations = Object.entries(stateAbbreviations).reduce((acc, [name, abbr]) => {
  acc[abbr] = name;
  return acc;
}, {});

const Compliance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [userState, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableStates] = useState(['CA','NY']); // Currently only California has data

  useEffect(() => {
    const fetchUserState = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('account_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              setUserState(null);
            } else {
              throw error;
            }
          } else {
            // Only set state if it's one of the available states, otherwise default to CA
            const state = data?.state;
            setUserState(availableStates.includes(state) ? state : 'CA');
          }
        } catch (error) {
          console.error('Error fetching user state:', error);
          setUserState('CA'); // Default to CA on error
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserState();
  }, [user, availableStates]);

  const handleStateChange = async (event) => {
    const fullStateName = event.target.value;
    const stateAbbr = stateAbbreviations[fullStateName];
    
    // Only allow changing to states that have data
    if (!availableStates.includes(stateAbbr)) {
      toast.warning('Compliance information for this state is coming soon!');
      return;
    }
    
    setUserState(stateAbbr);
    
    if (user) {
      try {
        const { error } = await supabase
          .from('account_profiles')
          .update({ state: stateAbbr })
          .eq('id', user.id)
          .single();

        if (error) throw error;
      } catch (error) {
        console.error('Error updating user state:', error);
      }
    }
  };

  // Get the full state name for the dropdown
  const currentStateFullName = userState ? reverseStateAbbreviations[userState] : '';

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid hsl(var(--border))',
        mb: 3
      }}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            px: 'var(--container-padding-x)',
            py: 3,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Typography 
            sx={{ 
              color: '#000000',
              fontWeight: 400,
              fontSize: '1.125rem',
              pl: 2.1
            }}
          >
            We're currently finalizing state compliance agreements with all 50 states. We may not have your state's compliance equirements available yet -- for the time being, please try the compliance process for California and NewYork and provide feedback as if it was your own state.
          </Typography>
        </Container>
      </Box>

      {/* State Selection Section */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          mb: 3,
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {!loading && (
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              mb: 3
            }}
          >
            <LocationIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
            {userState ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BodyText>Currently viewing compliance information for</BodyText>
                <FormControl size="small">
                  <Select
                    value={currentStateFullName}
                    onChange={handleStateChange}
                    sx={{
                      minWidth: 200,
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                    }}
                  >
                    {states.map((state) => (
                      <MenuItem 
                        key={state} 
                        value={state}
                        disabled={!availableStates.includes(stateAbbreviations[state])}
                      >
                        {state}
                        {!availableStates.includes(stateAbbreviations[state]) && 
                          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                            (Coming Soon)
                          </Typography>
                        }
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                <BodyText sx={{ color: 'hsl(var(--text-secondary))' }}>
                  No state information found in your account
                </BodyText>
                <Button
                  variant="contained"
                  onClick={() => navigate('/account/profile')}
                  sx={{
                    backgroundColor: 'hsl(var(--brand-primary))',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'hsl(var(--brand-primary-dark))',
                    },
                  }}
                >
                  Add State Info
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* Content Section */}
      <Box>
        {/* <StateComplianceFiling />
        <NewYorkComplianceFiling/> */}


    {userState === 'CA' && <StateComplianceFiling />}
    {userState === 'NY' && <NewYorkComplianceFiling />}

      </Box>
    </Box>
  );
};

export default Compliance; 