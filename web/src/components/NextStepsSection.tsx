import DraftButton from '@/components/DraftButton';
import ContentDisplay from '@/components/ContentDisplay';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface Props {
  handleNext: () => Promise<void>;
  formattedNext: string;
  isLoading: boolean;
  className?: string; 
}

export default function NextStepsSection({ handleNext, formattedNext, isLoading, className }: Props) {
  const navigate = useNavigate();
  
  const handleGenerateNext = async () => {
    if (!isLoading) {
      await handleNext();
    }
  };

  return (
    <SectionContainer className={className}>
      <PageHeader>
        <SectionTitle>Next Steps</SectionTitle>
      </PageHeader>
      
      <ContentArea>
        <ButtonWrapper>
          <DraftButton 
            label="Generate Next Steps" 
            onClick={handleGenerateNext}  
            isLoading={isLoading} 
          />
        </ButtonWrapper>
        
        <ContentDisplayWrapper>
          <ContentDisplay 
            content={formattedNext}
            isLoading={isLoading}
            emptyStateMessage="Click the button above to generate the next steps for establishing your business. This will provide you with a clear roadmap of actions to take."
          />
        </ContentDisplayWrapper>
      </ContentArea>
    </SectionContainer>
  );
}

const SectionContainer = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 5rem; /* Space for navigation */
  margin: 0 auto;
`;

const PageHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: #3E1F1B;
`;

const ContentArea = styled.div`
  width: 100%;
  min-width: 800px;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
`;

const ButtonWrapper = styled.div`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 300px;
`;

const ContentDisplayWrapper = styled.div`
  width: 100%;
  min-width: 800px;
  max-width: 800px;
`;

