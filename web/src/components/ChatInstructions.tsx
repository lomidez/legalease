import styled from 'styled-components';
import { X } from 'lucide-react';
import { Heading3, Paragraph, TextBold } from '@/styles/Typography';

interface Props {
  closeInstructions: () => void;
}

const InstructionsWindow = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  width: 80%;
  max-width: 800px;
  background-color: #FFF8E8;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  overflow: auto;
  border: 2px solid #D8C79D;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -48%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 19;
  animation: fadeInBg 0.3s ease-out;
  
  @keyframes fadeInBg {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #3E1F1B;
  background: #D8C79D;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #C4B48A;
    transform: rotate(90deg);
  }
`;

const InstructionsContent = styled.div`
  width: 100%;
  text-align: left;
`;

const InstructionsTitle = styled(Heading3)`
  color: #3E1F1B;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #D8C79D;
  padding-bottom: 0.5rem;
`;

const StepTitle = styled(TextBold)`
  display: block;
  color: #3E1F1B;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const StepContent = styled(Paragraph)`
  margin-left: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  
  &::before {
    content: "•";
    position: absolute;
    left: -1rem;
    color: #B82F1A;
  }
`;

const Step = styled.div`
  margin-bottom: 1.5rem;
`;

export default function ChatInstructions({ closeInstructions }: Props) {
  return (
    <>
      <Overlay onClick={closeInstructions} />
      <InstructionsWindow>
        <CloseButton onClick={closeInstructions}>
          <X size={20} />
        </CloseButton>
        <InstructionsContent>
          <InstructionsTitle>How to Use LegalEase</InstructionsTitle>
          
          <Step>
            <StepTitle>Step 1: Converse with the LegalBeagle</StepTitle>
            <StepContent>
              Start by introducing your business idea, and the LegalBeagle will start sniffing out the ideal structure for your business.
            </StepContent>
            <StepContent>
              Provide details like your business name, address, number of employees, and funding sources.
            </StepContent>
          </Step>
          
          <Step>
            <StepTitle>Step 2: Generate Business Summary</StepTitle>
            <StepContent>
              Once you feel like you have adequately described your business, click the right arrow icon at the bottom of the page.
            </StepContent>
            <StepContent>
              In the next page, you will be able to click 'Generate Business Summary' to summarize the conversation so far.
            </StepContent>
          </Step>
          
          <Step>
            <StepTitle>Step 3: Ask for Next Steps</StepTitle>
            <StepContent>
              Once you like the summary created about your business, again click the right arrow icon to go to the next page.
            </StepContent>
            <StepContent>
              Clicking 'Generate Next Steps' will give you detailed directions on how to proceed with starting your business.
            </StepContent>
            <StepContent>
              Any missing information required for our identified structure will be requested. If unavailable, you will be instructed on how to find it.
            </StepContent>
          </Step>
          
          <Step>
            <StepTitle>Step 4: Refinement</StepTitle>
            <StepContent>
              Submit information requested in Step 3 to the LegalBeagle.
            </StepContent>
            <StepContent>
              Repeat the process to refine results.
            </StepContent>
          </Step>
        </InstructionsContent>
      </InstructionsWindow>
    </>
  );
}
