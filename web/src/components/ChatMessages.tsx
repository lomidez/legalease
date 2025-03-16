import useAutoScroll from '@/hooks/useAutoScroll';
import Spinner from '@/components/Spinner';
import userIcon from '@/assets/robot.svg';
import assistantIcon from '@/assets/beagle.svg';
import { ChatMessagesProps } from '@/types/chat';
import { RefObject } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
`;

const MessageWrapper = styled.div.attrs<{ isUser: boolean }>(() => ({
  isUser: undefined, // Prevents `isUser` from appearing in the DOM
}))`
  display: flex;
  align-items: start;
  gap: 1.5rem;
  flex-direction: ${({ isUser }) => (isUser ? 'row-reverse' : 'row')};
`;

const Avatar = styled.img`
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
`;

const MessageBubble = styled.div.attrs<{ isUser: boolean }>(() => ({
  isUser: undefined,
}))`
  width: 70%;
  text-align: left;
  flex: 1;
  border-radius: 1rem;
  padding: 1rem;
  background-color: ${({ isUser }) => (isUser ? '#f3f4f6' : '#e5e7eb')};
  color: ${({ isUser }) => (isUser ? '#1e3a8a' : '#374151')};
  white-space: pre-wrap;
  font-size: 1rem;
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollContentRef: RefObject<HTMLDivElement> = useAutoScroll(isLoading);

  return (
    <ChatContainer ref={scrollContentRef}>
      {messages.map(({ role, content, loading, error }, idx) => (
        <MessageWrapper key={idx} isUser={role === 'user'}>
          <Avatar src={role === 'user' ? userIcon : assistantIcon} alt={`${role} icon`} />
          <MessageBubble isUser={role === 'user'}>
            {loading && !content ? <Spinner /> : <div>{content}</div>}
            {error && <div><span>Beep boop error in chatmessages</span></div>}
          </MessageBubble>
        </MessageWrapper>
      ))}
    </ChatContainer>
  );
}
