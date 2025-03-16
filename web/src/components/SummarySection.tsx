import DraftButton from '@/components/DraftButton';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface Props {
  handleSummarize: () => Promise<void>;
  formattedSummary?: string;
  isLoading: boolean;
  className?: string;
}

export default function SummarySection({ handleSummarize, formattedSummary, isLoading, className}: Props) {
  const navigate = useNavigate();

  return (
    <SectionContainer className={className}>
      <PageHeader>
        <SectionTitle>Business Summary</SectionTitle>
      </PageHeader>
      
      <ContentArea>
        <ButtonWrapper>
          <DraftButton 
            label="Generate Business Summary" 
            onClick={handleSummarize}  
            isLoading={isLoading} 
          />
        </ButtonWrapper>
        
        {formattedSummary && formattedSummary.trim() ? (
          <ContentBox>
            <pre>{formattedSummary}</pre>
          </ContentBox>
        ) : (
          <EmptyState>
            <p>Click the button above to generate a summary of your business based on your conversation.</p>
            <p>This will help you understand the key aspects of your business structure.</p>
          </EmptyState>
        )}
      </ContentArea>
    </SectionContainer>
  );
}

const SectionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 5rem; /* Space for navigation */
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
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ButtonWrapper = styled.div`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 300px;
`;

const ContentBox = styled.div`
  width: 100%;
  padding: 2rem;
  border: 1px solid black;
  background-color: white;
  overflow-y: auto;
  max-height: 600px;
  font-size: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EmptyState = styled.div`
  width: 100%;
  padding: 3rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 0.5rem;
  text-align: center;
  color: #3E1F1B;
  font-size: 1.1rem;
  line-height: 1.6;
  
  p {
    margin-bottom: 1rem;
  }
`;
