import DraftButton from '@/components/DraftButton';
import styled from 'styled-components';

interface Props {
  handleNext: () => Promise<void>;
  formattedNext: string;
  isLoading: boolean;
  className?: string; 
}

const SectionContainer = styled.div`
  width: 50%;
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
  width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
  border-top-left-radius: 0.5rem;
`;

export default function NextStepsSection({ handleNext, formattedNext, isLoading, className }: Props) {
  return (
    <SectionContainer className={className}>
      <ButtonWrapper>
        <DraftButton 
          label="3: Next Steps" 
          onClick={handleNext}  
          isLoading={isLoading} 
        />
      </ButtonWrapper>
      {formattedNext.trim() && (
      <ContentBox>
        <pre>{formattedNext || ' '}</pre>
      </ContentBox>
      )}
    </SectionContainer>
  );
}
