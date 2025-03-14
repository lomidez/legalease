import { MoreHorizontal } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3rem;
`;

const AnimatedIcon = styled(MoreHorizontal)`
  width: 2rem;
  height: 2rem;
  animation: ${pulseAnimation} 1.5s infinite;
`;

export default function Spinner() {
  return (
    <SpinnerContainer>
      <AnimatedIcon />
    </SpinnerContainer>
  );
}
