import useAutoScroll from '@/hooks/useAutoScroll';
import Spinner from '@/components/Spinner';
import userIcon from '@/assets/user.svg';
import assistantIcon from '@/assets/robot.svg';
import { ChatMessagesProps } from '@/types/chat';
import { RefObject } from 'react';

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollContentRef: RefObject<HTMLDivElement> = useAutoScroll(isLoading);
  return (
    <div ref={scrollContentRef}>
      {messages.map(({ role, content, loading, error }, idx) => (
        <div key={idx} className="border-b border-gray-200 py-4">
          {role === 'user' ? (
            <img src={userIcon} alt='user icon' className='w-12 h-12' />
          ) : (
            <img src={assistantIcon} alt='assistant icon' className='w-12 h-12' />
          )}
          <div className='text-left'>
            {(loading && !content) ? <Spinner />
              : (role === 'assistant')
                ? <div className="whitespace-pre-wrap">{content}</div>
                : <div className="whitespace-pre-wrap">{content}</div>
            }
            {error && (
              <div>
                <span>Beep boop error</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div >
  );
}
