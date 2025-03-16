import DraftButton from '@/components/DraftButton';
import ContentDisplay from '@/components/ContentDisplay';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Props {
  handleSummarize: () => Promise<void>;
  formattedSummary?: string;
  isLoading: boolean;
  className?: string;
}

export default function SummarySection({ handleSummarize, formattedSummary = '', isLoading, className}: Props) {
  const navigate = useNavigate();
  
  const handleGenerateSummary = async () => {
    if (!isLoading) {
      await handleSummarize();
    }
  };

  return (
    <SectionContainer className={className}>
      <PageHeader>
        <SectionTitle>Business Summary</SectionTitle>
      </PageHeader>
      
      <ContentArea>
        <ButtonWrapper>
          <DraftButton 
            label="Generate Business Summary" 
            onClick={handleGenerateSummary}  
            isLoading={isLoading} 
          />
        </ButtonWrapper>
        
        <ContentDisplayWrapper>
          <ContentDisplay 
            content={formattedSummary}
            isLoading={isLoading}
            emptyStateMessage="Click the button above to generate a summary of your business based on your conversation. This will help you understand the key aspects of your business structure."
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
  max-width: 800px;
`;

