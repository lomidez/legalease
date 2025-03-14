import DraftButton from '@/components/DraftButton';
import styled from 'styled-components';

interface Props {
  handleSummarize: () => Promise<void>;
  formattedSummary?: string;
  isLoading: boolean;
  className?: string;
}

const SectionContainer = styled.div`
  width: 100%;
  padding: 0;
`;

const ButtonWrapper = styled.div`
  margin-bottom: 1rem;
  width: 100%;
`;

const ContentBox = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid black;
  background-color: #D8C79D;
  overflow: auto;
  max-height: 24rem;
  font-size: 0.75rem;
  width: 95%;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  border-top-left-radius: 0.5rem;
`;

export default function NextStepsSection({ handleSummarize, formattedSummary, isLoading, className}: Props) {
  return (
    <SectionContainer className={className}>
      <ButtonWrapper>
        <DraftButton 
          label="2: Generate Business Summary" 
          onClick={handleSummarize}  
          isLoading={isLoading} 
        />
      </ButtonWrapper>
      {formattedSummary && formattedSummary.trim() && (
        <ContentBox>
          <pre>{formattedSummary}</pre>
        </ContentBox>
      )}
    </SectionContainer>
  );
}
