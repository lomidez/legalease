import styled from 'styled-components';

interface Props {
    closeInstructions: () => void;
}

const InstructionsWindow = styled.div`
    position: fixed;
    top: 25%;
    left: 12.5%;
    z-index: 20;
    width: 75%;
    background-color: #F1C6C6;
    padding: 1rem;
    border-radius: 0.375rem;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    max-height: 500px;
    overflow: auto;
    border: 2px solid black;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: #3E1F1B;
    font-size: 1.25rem;
    font-weight: bold;
    background: none;
    border: none;
    cursor: pointer;
`;

const InstructionsContent = styled.div`
    width: 100%;
    text-align: left;
`;

export default function ChatInstructions({ closeInstructions }: Props) {
    return (
        <InstructionsWindow>
            <CloseButton onClick={closeInstructions}>X</CloseButton>
            <InstructionsContent>
                <p><strong>Step 1: Converse with the LegalBeagle:</strong></p>
                <p>- Start by introducing your business idea, and the LegalBeagle will start sniffing out the ideal structure for your business.</p>
                <p>- Provide details like your business name, address, number of employees, and funding sources.</p>
                <p><strong>Step 2: Generate Business Summary</strong></p>
                <p>- Once you feel like you have adequately described your business, click 'Generate Business Summary'.</p>
                <p>- Your conversation so far will be summarized and an appropriate business structure will be recommended.</p>
                <p><strong>Step 3: Ask for Next Steps</strong></p>
                <p>- Once you like the summary created about your business, click the Next Steps button to be given more direction on how to proceed with your specified structure.</p>
                <p>- Any missing information required for our identified structure will be requested. If unavailable, you will be instructed on how to find it. </p>
                <p><strong>Step 4: Refinement</strong></p>
                <p>- Submit information requested in Step 3 to the LegalBeagle.</p>
                <p>- Repeat the process to refine results.</p>
            </InstructionsContent>
        </InstructionsWindow>
    );
}
