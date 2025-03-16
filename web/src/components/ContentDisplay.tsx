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
    <>
      {isLoading ? (
        <LoadingContainer>
          <Spinner />
          <LoadingText>Generating response...</LoadingText>
        </LoadingContainer>
      ) : content && content.trim() ? (
        <ContentBox>
          <pre>{content}</pre>
        </ContentBox>
      ) : (
        <EmptyState>
          <p>{emptyStateMessage}</p>
        </EmptyState>
      )}
    </>
  );
}

const LoadingContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 0.5rem;
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
