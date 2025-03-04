import { useState, useRef } from 'react';
import { useImmer } from 'use-immer';
import { Message } from '@/types/chat';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import DraftButton from '@/components/DraftButton';
import api from '@/api';
import { parseSSEStream } from '@/utils';

export default function Chatbot() {
  const sessionIdRef = useRef<number | null>(null);
  const [messages, setMessages] = useImmer<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Legalease, your personal not-legally-certified business partner.\nStarting a business is confusing, so I want to help you every step along the way.\n\nTo begin, please tell me about your business ideas.",
      loading: false
    }
  ]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [formattedMessages, setFormattedMessages] = useState<string>(''); // New state for formatted messages

  const isLoading: boolean = messages.length > 0 ? messages[messages.length - 1].loading : false;

  async function submitNewMessage(): Promise<void> {
    const trimmedMessage: string = newMessage.trim()

    if (!trimmedMessage || isLoading) return;

    setMessages(draft => [
      ...draft,
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: '', loading: true }
    ]);
    setNewMessage('');

    try {
      if (!sessionIdRef.current) {
        sessionIdRef.current = await api.createChat();
      }

      if (sessionIdRef.current === null) {
        throw new Error("Session ID is null, something went wrong!")
      }

      const stream = await api.sendChatMessage(sessionIdRef.current, trimmedMessage);

      for await (const textChunk of parseSSEStream(stream)) {
        setMessages(draft => {
          draft[draft.length - 1].content += textChunk;
        });
      }

      setMessages(draft => {
        draft[draft.length - 1].loading = false;
      });
    } catch (err) {
      console.log(err);
      setMessages(draft => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
    }
  }

  async function handlePrintMessages(): Promise<void> {
    if (sessionIdRef.current === null) {
      console.log("Session ID is not set.");
      return;
    }
  
    try {
      // Call the summarize API endpoint
      const stream = await api.summarize(sessionIdRef.current);
  
      // Use parseSSEStream to process the stream and append the parsed chunks
      for await (const textChunk of parseSSEStream(stream)) {
        setFormattedMessages(prev => prev + textChunk);
      }
  
    } catch (err) {
      console.log("Error while fetching summary:", err);
    }
  }

  return (
    <div>
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
      <ChatInput
        newMessage={newMessage}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
      <DraftButton
        label="Generate Business Summary"
        onClick={handlePrintMessages}
        isLoading={isLoading}
      />
      
      {/* Display formatted messages beneath the input */}
      {formattedMessages && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-100">
          <pre>{formattedMessages}</pre>
        </div>
      )}
    </div>
  );
}
