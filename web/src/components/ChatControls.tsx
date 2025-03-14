import ChatInput from '@/components/ChatInput';

interface Props {
  newMessage: string;
  isLoading: boolean;
  setNewMessage: (msg: string) => void;
  submitNewMessage: () => Promise<void>; 
}

export default function ChatControls({ newMessage, isLoading, setNewMessage, submitNewMessage }: Props) {
  return (
    <ChatInput newMessage={newMessage} isLoading={isLoading} setNewMessage={setNewMessage} submitNewMessage={submitNewMessage} />
  );
}
