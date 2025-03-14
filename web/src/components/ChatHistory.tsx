import ChatMessages from '@/components/ChatMessages';
import { Message } from '@/types/chat';
import styled from 'styled-components';

interface Props {
    messages: Message[];
    isLoading: boolean;
    setNewMessage: (msg: string) => void;
    submitNewMessage: () => Promise<void>; 
}

const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  max-height: 60vh;
  display: flex;
  flex-direction: column; /* Ensures messages stack downward */
  justify-content: flex-end; /* Keeps new messages at the bottom */
  
  margin: 1rem auto;
  overflow-y: auto; /* Allows scrolling instead of growing upwards */
  scroll-behavior: smooth;

  padding: 1rem;
  border: 1px solid #D8C79D;
  background-color: #D8C79D;
  font-size: 0.75rem;
  flex-grow: 1;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.73);
`;


export default function ChatHistory({ messages, isLoading, setNewMessage, submitNewMessage }: Props) {
    return (
        <ChatContainer>
            <ChatMessages 
                messages={messages} 
                isLoading={isLoading} 
                setNewMessage={setNewMessage} 
                submitNewMessage={submitNewMessage} 
            />
        </ChatContainer>
    );
}