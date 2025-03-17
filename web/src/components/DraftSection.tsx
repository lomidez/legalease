import DraftButton from '@/components/DraftButton';
import ContentDisplay from '@/components/ContentDisplay';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface Props {
  handleDraft: () => Promise<void>;
  formattedNext: string;
  isLoading: boolean;
  className?: string;
}

export default function DraftSection({ handleDraft, formattedNext, isLoading, className }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGenerateDraft = async () => {
    if (!isLoading) {
      await handleDraft();
    }
  };

  return (
    <SectionContainer className={className}>
      <PageHeader>
        <SectionTitle>Draft Documents</SectionTitle>
      </PageHeader>

      <ContentArea>
        <ButtonWrapper>
          <DraftButton
            label="Generate Documents"
            onClick={handleGenerateDraft}
            isLoading={isLoading}
          />
        </ButtonWrapper>

        <ContentDisplayWrapper>
          <ContentDisplay
            content={formattedNext}
            isLoading={isLoading}
            emptyStateMessage="Click the button above to create a rough draft of formation documents for your business."
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

