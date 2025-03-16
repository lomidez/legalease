import styled from 'styled-components';
import Spinner from '@/components/Spinner';

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  emptyStateMessage?: string;
}

export default function ContentDisplay({ 
  content, 
  isLoading, 
  emptyStateMessage = "No content to display yet." 
}: ContentDisplayProps) {
  return (
    <ContentContainer>
      {isLoading ? (
        <LoadingContainer>
          <Spinner />
          <LoadingText>Generating response...</LoadingText>
        </LoadingContainer>
      ) : content && content.trim() ? (
        <ContentBox>
          <ContentText>{content}</ContentText>
        </ContentBox>
      ) : (
        <EmptyState>
          <p>{emptyStateMessage}</p>
        </EmptyState>
      )}
    </ContentContainer>
  );
}

const ContentContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 0.5rem;
  min-height: 200px;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: #3E1F1B;
  font-size: 1.1rem;
`;

const ContentBox = styled.div`
  width: 100%;
  padding: 2rem;
  border: 1px solid black;
  background-color: white;
  overflow-y: auto;
  max-height: 600px;
  font-size: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ContentText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
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
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  p {
    margin-bottom: 1rem;
  }
`;
