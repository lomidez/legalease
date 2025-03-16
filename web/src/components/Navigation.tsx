import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronRight, ChevronLeft, MessageSquare, FileText, ListChecks } from 'lucide-react';

interface NavigationProps {
  hasSummary: boolean;
}

export default function Navigation({ hasSummary }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const goToNextPage = () => {
    if (currentPath === '/') {
      navigate('/summary');
    } else if (currentPath === '/summary') {
      navigate('/next-steps');
    }
  };

  const goToPreviousPage = () => {
    if (currentPath === '/next-steps') {
      navigate('/summary');
    } else if (currentPath === '/summary') {
      navigate('/');
    }
  };

  return (
    <NavigationContainer>
      <NavigationButtons>
        <NavButton 
          onClick={goToPreviousPage} 
          disabled={currentPath === '/'} 
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </NavButton>

        <PageIndicator>
          <PageButton 
            active={currentPath === '/'} 
            onClick={() => navigate('/')}
            aria-label="Chat page"
          >
            <MessageSquare size={20} />
          </PageButton>
          <PageButton 
            active={currentPath === '/summary'} 
            onClick={() => navigate('/summary')}
            aria-label="Summary page"
          >
            <FileText size={20} />
          </PageButton>
          <PageButton 
            active={currentPath === '/next-steps'} 
            onClick={() => navigate('/next-steps')}
            aria-label="Next steps page"
          >
            <ListChecks size={20} />
          </PageButton>
        </PageIndicator>

        <NavButton 
          onClick={goToNextPage} 
          disabled={currentPath === '/next-steps'} 
          aria-label="Next page"
        >
          <ChevronRight size={24} />
        </NavButton>
      </NavigationButtons>
    </NavigationContainer>
  );
}

const NavigationContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 100;
`;

const NavigationButtons = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(62, 31, 27, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const NavButton = styled.button<{ disabled?: boolean }>`
  background-color: ${props => props.disabled ? '#8B5E57' : '#D8C79D'};
  color: ${props => props.disabled ? '#6D4C46' : '#3E1F1B'};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: #C4B48A;
    transform: scale(1.05);
  }
`;

const PageIndicator = styled.div`
  display: flex;
  align-items: center;
  margin: 0 1rem;
  gap: 0.5rem;
`;

const PageButton = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? '#D8C79D' : 'transparent'};
  color: ${props => props.active ? '#3E1F1B' : '#D8C79D'};
  border: 2px solid ${props => props.active ? '#D8C79D' : 'rgba(216, 199, 157, 0.5)'};
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#C4B48A' : 'rgba(216, 199, 157, 0.2)'};
  }
`;
