import "./flashflip.css";
import FlashcardArray from "../../components/ts/FlashcardArray/FlashcardArray";

const FlashCardFlip = () => {
    const cards = [
        {
            id: 1,
            frontHTML:
                <div className="term-question">
                    <span className="question">What is architectural style?</span>
                    <span className="question">A. Architectural style is a description of component type</span>
                    <span className="question">B. It is a pattern of run-time control</span>
                    <span className="question">C. It is a set of constraints on the architecture</span>
                    <span className="question">D. All of the mentioned</span>
                </div>,
            backHTML: <><span>D. All of the mentioned</span></>,
        },
        {
            id: 2,
            frontHTML: "What is the capital of California?",
            backHTML: <>Sacramento</>,
        },
        {
            id: 3,
            frontHTML: <>What is the capital of New York?</>,
            backHTML: <>Albany</>,
        },
        {
            id: 4,
            frontHTML: <>What is the capital of Florida?</>,
            backHTML: <>Tallahassee</>,
        },
        {
            id: 5,
            frontHTML: <>What is the capital of Texas?</>,
            backHTML: <>Austin</>,
        },
        {
            id: 6,
            frontHTML: <>What is the capital of New Mexico?</>,
            backHTML: <>Santa Fe</>,
        },
        {
            id: 7,
            frontHTML: <>What is the capital of Arizona?</>,
            backHTML: <>Phoenix</>,
        },
    ];

    return (
        <>
            <FlashcardArray cards={cards}/>
        </>

    );
}

export default FlashCardFlip;