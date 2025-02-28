import { useState, useRef } from 'react';
import { useImmer } from 'use-immer';
import { Message } from '@/types/chat';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import api from '@/api';
import { parseSSEStream } from '@/utils';

export default function Chatbot() {
  const sessionIdRef = useRef<number | null>(null);
  const [messages, setMessages] = useImmer<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm Legalease, your personal not-legally-certified business partner.
Starting a business is confusing, so I want to help you every step along the way.
To begin, could you tell me what type of business you're looking to start?
      `,
      loading: false
    }
  ]);
  const [newMessage, setNewMessage] = useState<string>('');

  // length - 1 refers to the last message
  // loading is used to show spinner / prevent sending new messages
  const isLoading: boolean = messages.length > 0 ? messages[messages.length - 1].loading : false;

  async function submitNewMessage(): Promise<void> {
    const trimmedMessage: string = newMessage.trim()

    // TODO: Some notification?
    if (!trimmedMessage || isLoading) return;

    // add new message to sent messages in UI, we'll call API later
    // TODO: possible desync if error?
    setMessages(draft => [...draft,
    { role: 'user', content: trimmedMessage },
    { role: 'assistant', content: '', sources: [], loading: true }
    ]);
    // empty out message
    setNewMessage('');

    try {
      if (!sessionIdRef.current) {
        sessionIdRef.current = await api.createChat();
      }
      console.log("SESSIONID: " + sessionIdRef.current)

      if (sessionIdRef.current === null) {
        throw new Error("Session ID is null, something went wrong!")
      }

      const stream = await api.sendChatMessage(sessionIdRef.current, trimmedMessage);

      // this is done so that text shows up one by one
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
      })
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
    </div>
  )
}
