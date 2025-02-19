import Markdown from 'react-markdown';
import useAutoScroll from '@/hooks/useAutoScroll';
import Spinner from '@/components/Spinner';
import userIcon from '@/assets/user.svg';
import assistantIcon from '@/assets/robot.svg';
import errorIcon from '@/assets/error.svg';
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
          <div>
            <div>
              {(loading && !content) ? <Spinner />
                : (role === 'assistant')
                  ? <Markdown>{content}</Markdown>
                  : <div>{content}</div>
              }
            </div>
            {error && (
              <div>
                <img src={errorIcon} alt='error icon' className='w-12 h-12' />
                <span> Error generating the response</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div >
  );
}
