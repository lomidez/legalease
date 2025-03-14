import DraftButton from '@/components/DraftButton';
import styled from 'styled-components';

interface Props {
  handleNext: () => Promise<void>;
  formattedNext?: string;
  isLoading: boolean;
  className?: string; 
}

const SectionContainer = styled.div`
  width: 50%;
  padding: 0;
  max-width: 600px; /* Ensures it does not stretch beyond a fixed size */
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
  width: 100%;
  max-width: 100%; /* Ensures it does not exceed the parent container */
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  word-wrap: break-word;
`;

export default function NextStepsSection({ handleNext, formattedNext, isLoading, className }: Props) {
  return (
    <SectionContainer className={className}>
      <ButtonWrapper>
        <DraftButton 
          label="2: Generate Business Summary" 
          onClick={handleNext}  
          isLoading={isLoading} 
        />
      </ButtonWrapper>
      {formattedNext && formattedNext.trim() && (
        <ContentBox>
          <pre>{formattedNext}</pre>
        </ContentBox>
      )}
    </SectionContainer>
  );
}
