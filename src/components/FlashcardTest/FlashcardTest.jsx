import "./testFile.css";
import FlashcardArray from "../../components/ts/FlashcardArray/FlashcardArray";
import {useState} from "react";
import TakeATestIcon from "../icon/TakeATestIcon.jsx";
import AddKAIcon from "../icon/AddKAIcon.jsx";
import IconClock from "../icon/IconClock.jsx";

const FlashCardTest = () => {
    const cards = [
        {
            id: 1,
            frontHTML:
                <div className="test-term-question">
                    <span className="test-question">What is architectural style?</span>
                    <span className="test-question">A. Architectural style is a description of component type</span>
                    <span className="test-question">B. It is a pattern of run-time control</span>
                    <span className="test-question">C. It is a set of constraints on the architecture</span>
                    <span className="test-question">D. All of the mentioned</span>
                </div>,
            backHTML: <><span>D. All of the mentioned</span></>,
        },
        {
            id: 2,
            frontHTML: <>What is the capital of California?</>,
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

    const [titleSet, setTitleSet] = useState("?");

    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                padding: "0 8rem"
            }}>
                <h1 style={{
                    fontWeight: "bold",
                    marginTop: "2.2rem"
                }}>{titleSet}</h1>
                <FlashcardArray cards={cards}
                                FlashcardArrayStyle={{
                                    width: "100%",
                                    fontSize: "30px",
                                    marginTop: "2.2rem"
                                }}/>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // Tự động xuống dòng khi nhỏ
                    gap: "1.2rem",
                    marginTop: "2.2rem",
                    minHeight: "60px"
                }}>
                    {/* Nút 1 */}
                    <button style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#e0e0fe",
                        fontSize: "20px",
                        fontWeight: "700",
                        position: "relative",
                        border: "2px solid black",
                        borderRadius: "1rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "1rem"
                    }}>
                        <TakeATestIcon size={48} viewBox="0 0 60 60"/>
                        <div>
                            Take a Test
                        </div>
                    </button>

                    {/* Nút 2 */}
                    <button style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#e0e0fe",
                        fontSize: "20px",
                        fontWeight: "700",
                        position: "relative",
                        border: "2px solid black",
                        borderRadius: "1rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "1rem"
                    }}>
                        <AddKAIcon size={48} viewBox="0 0 60 60"/>
                        <div>
                            Add to Knowledge Arena
                        </div>
                    </button>

                    {/* Nút 3 */}
                    <button style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#e0e0fe",
                        fontSize: "20px",
                        fontWeight: "700",
                        position: "relative",
                        border: "2px solid black",
                        borderRadius: "1rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "1rem"
                    }}>
                        <IconClock size={48} viewBox="0 0 30 30"/>
                        <div>
                            Add to Deadline
                        </div>
                    </button>
                </div>

                <div style={{
                    marginTop: "2.2rem",
                    display: "flex",
                }}>
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/fir-1-a1ff1.firebasestorage.app/o/images%2F1731794994330-d84d424a-816c-4164-abde-9ca725483adf.png?alt=media&token=3edc07ba-78b7-43ea-84a0-a646eea3717a"
                        alt="mô tả" width={50} height={50}/>
                    <div></div>
                </div>
            </div>
        </>
    );
}

export default FlashCardTest;

