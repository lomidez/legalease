export type MessageRole = "user" | "assistant";

export interface Message {
  id?: string;
  content: string;
  role: MessageRole;
  loading: boolean;
  error?: boolean;
}

export interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  setNewMessage: (message: string) => void;
  submitNewMessage: () => Promise<void>;
}

export interface ChatInputProps {
  newMessage: string;
  isLoading: boolean;
  setNewMessage: (message: string) => void;
  submitNewMessage: () => Promise<void>;
}

export interface ButtonProps {
  label: string;
  onClick: () => Promise<void>;  
  isLoading: boolean;
}
