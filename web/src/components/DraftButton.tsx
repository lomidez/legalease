import { MouseEvent } from 'react';
import { ButtonProps } from '@/types/chat';
import styled from 'styled-components';

const ButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledButton = styled.button.attrs<{ isLoading: boolean }>(() => ({isLoading: undefined,}))`
    background-color: ${({ isLoading }) => (isLoading ? '#4B5563' : '#B91C1C')};
    border: 2px solidrgb(218, 38, 14);
    color: white;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: ${({ isLoading }) => (isLoading ? 'not-allowed' : 'pointer')};
    transition: background-color 0.2s;
    outline: none;
    
    &:hover {
      background-color: ${({ isLoading }) => (isLoading ? '#4B5563' : '#991B1B')};
    }
    &:focus {
      box-shadow: 0 0 0 2px #D8C79D;
    }
  `;




export default function ActionButton({ label, onClick, isLoading }: ButtonProps) {
    function handleClick(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!isLoading) {
            onClick(); 
        }
    }

    return (
        <ButtonWrapper>
            <StyledButton onClick={handleClick} isLoading={isLoading} disabled={isLoading}>
                {label}
            </StyledButton>
        </ButtonWrapper>
    );
}