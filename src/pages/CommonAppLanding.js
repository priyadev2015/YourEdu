import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/youredu-2.png';
import commonAppLogo from '../assets/common-app.png';
import '@fontsource/merriweather/700.css';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #E6F0FF 0%, #FFFFFF 100%);
  padding: 20px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1200px;
  width: 100%;
  text-align: center;
  padding: 40px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  margin-bottom: 60px;
`;

const YourEduLogoImg = styled.img`
  height: 100px;
  width: auto;
`;

const Separator = styled.div`
  height: 80px;
  width: 3px;
  background-color: #D1D5DB;
`;

const CommonAppLogoImg = styled.img`
  height: 100px;
  width: auto;
`;

const AnnouncementText = styled.h1`
  font-size: 32px;
  color: #002B5C;
  max-width: 1100px;
  line-height: 1.3;
  margin: 20px 0 60px 0;
  font-weight: 700;
  font-family: 'Merriweather', serif;
  white-space: pre-line;
`;

const EnterButton = styled.button`
  background-color: #4169E1;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 48px;
  font-size: 28px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(65, 105, 225, 0.2);

  &:hover {
    background-color: #3154B4;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(65, 105, 225, 0.3);
  }

  span {
    font-size: 24px;
    margin-top: 2px;
  }
`;

const CommonAppLanding = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>
        <LogoContainer>
          <YourEduLogoImg src={logo} alt="YourEDU Logo" />
          <Separator />
          <CommonAppLogoImg src={commonAppLogo} alt="Common App Logo" />
        </LogoContainer>
        
        <AnnouncementText>
          YourEDU is excited to be partnering with the Common App to deliver the
          college application platform for homeschool families!
        </AnnouncementText>

        <EnterButton onClick={() => navigate('/college')}>
          Enter <span>→</span>
        </EnterButton>
      </Content>
    </Container>
  );
};

export default CommonAppLanding;