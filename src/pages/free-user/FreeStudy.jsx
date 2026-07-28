import {Box} from "@mui/material";
import FlashcardArray from "../../components/ts/FlashcardArray/FlashcardArray";
import {CgFileDocument} from "react-icons/cg";
import {LuSwords} from "react-icons/lu";
import Header from "../../components/Header.jsx";
import Term from "../../components/Term/Term.jsx";
import SetCard from "../../components/SetCard/SetCard.jsx";
import React, {useEffect} from "react";

function FreeStudy() {
    const cardsWithImages = [
        {
            id: 1,
            frontHTML: (
                <div className="term-question">
                    <span className="question">What is architectural style?</span>
                    <span className="question">A. Architectural style is a description of component type</span>
                    <span className="question">B. It is a pattern of run-time control</span>
                    <span className="question">C. It is a set of constraints on the architecture</span>
                    <span className="question">D. All of the mentioned</span>
                </div>
            ),
            backHTML: <><span>D. All of the mentioned</span></>,
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRArqRNBhr7J7gUWEHr4dSfstyHgkIs2ZgMEw&s" // Image related to architecture
        },
        {
            id: 2,
            frontHTML: <>What is the capital of California?</>,
            backHTML: <>Sacramento</>,
            img: "https://images.pexels.com/photos/3775078/pexels-photo-3775078.jpeg" // Image related to California
        },
        {
            id: 3,
            frontHTML: <>What is the capital of New York?</>,
            backHTML: <>Albany</>,
            img: "https://images.pexels.com/photos/2547535/pexels-photo-2547535.jpeg" // Image related to New York
        },
        {
            id: 4,
            frontHTML: <>What is the capital of Florida?</>,
            backHTML: <>Tallahassee</>,
            img: "https://images.pexels.com/photos/1832110/pexels-photo-1832110.jpeg" // Image related to Florida
        },
        {
            id: 5,
            frontHTML: <>What is the capital of Texas?</>,
            backHTML: <>Austin</>,
            img: "https://images.pexels.com/photos/3269332/pexels-photo-3269332.jpeg" // Image related to Texas
        },
        {
            id: 6,
            frontHTML: <>What is the capital of New Mexico?</>,
            backHTML: <>Santa Fe</>,
            img: "https://images.pexels.com/photos/2482808/pexels-photo-2482808.jpeg" // Image related to New Mexico
        },
        {
            id: 7,
            frontHTML: <>What is the capital of Arizona?</>,
            backHTML: <>Phoenix</>,
            img: "https://images.pexels.com/photos/3269332/pexels-photo-3269332.jpeg" // Image related to Arizona
        },
    ];
    useEffect(() => {

    }, [cardsWithImages]);
    return (
        <Box p="20px" className="container" gap={2}>
            <Box flex={3} display="grid" gridTemplateColumns="1fr" gap={2}>
                <div className="title">Trắc nghiệm Software Architecture</div>
                <div className="topic">
                    <span className="topic-label">Topic :</span>
                    <div className="topic-box">Computer Science</div>
                </div>
                <div className="flashcard-container">
                    <FlashcardArray cards={cardsWithImages} FlashcardArrayStyle={{width: "100%"}} heightCard="400px"/>
                </div>

                {/*<div className="button-container">*/}
                {/*    <div className="button">*/}
                {/*        <i style={{ marginLeft: "0px", marginRight: "40px" }}><CgFileDocument size={30} /></i>*/}
                {/*        <span style={{ fontSize: "20px" }}>Take a test</span>*/}
                {/*    </div>*/}
                {/*    <div className="button">*/}
                {/*        <i style={{ marginRight: "40px" }}><LuSwords size={30} /></i>*/}
                {/*        <span style={{ fontSize: "20px" }}>Add to Knowledge Arena</span>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className="avatar-container">
                    <img src={"src/assets/images/sample_avatar.png"} alt="User Avatar" className="avatar"/>
                    <div className="user-info">
                        <span style={{fontSize: "18px"}}>by <strong>Macca Zeni</strong></span>
                        <span style={{color: "#939393"}}>12 public sets</span>
                    </div>
                </div>
                <div className="separator"></div>
                <div className="terms-header">
                    <Header title="Terms" fontSize="24px"/>
                </div>
                {
                    cardsWithImages.map((card, index) => (
                        <div className="set-card" key={card.id}>
                            <Term frontHTML={card.frontHTML} backHTML={card.backHTML} />
                        </div>
                    ))
                }

            </Box>
            <Box flex={1} display="flex" flexDirection="column" alignItems="stretch">
                <div className="hot-terms">
                    <i className="hot-terms-icon">
                        <img width="33" height="33" src="https://img.icons8.com/color/48/fire-element--v1.png"
                             alt="fire-element--v1"/>
                    </i>
                    <span className="hot-terms-title">Hot terms</span>
                </div>

                <div className="set-card">
                    <SetCard/>
                </div>
                <div className="set-card">
                    <SetCard/>
                </div>
                <div className="set-card">
                    <SetCard/>
                </div>
            </Box>
        </Box>
    )
}

export default FreeStudy;