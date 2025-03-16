import DraftButton from '@/components/DraftButton';
import styled from 'styled-components';

interface Props {
  handleNext: () => Promise<void>;
  formattedNext: string;
  isLoading: boolean;
  className?: string; 
}

const SectionContainer = styled.div`
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
  max-height: 500px;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #3E1F1B;
`;

export default function NextStepsSection({ handleNext, formattedNext, isLoading, className }: Props) {
  return (
    <SectionContainer className={className}>
      <SectionTitle>Next Steps</SectionTitle>
      <ButtonWrapper>
        <DraftButton 
          label="Generate Next Steps" 
          onClick={handleNext}  
          isLoading={isLoading} 
        />
      </ButtonWrapper>
      {formattedNext.trim() && (
        <ContentBox>
          <pre>{formattedNext}</pre>
        </ContentBox>
      )}
    </SectionContainer>
  );
}
