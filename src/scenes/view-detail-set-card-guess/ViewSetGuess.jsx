import {Box, CircularProgress} from "@mui/material";
import {CgFileDocument} from "react-icons/cg";
import {LuClock1, LuSwords} from "react-icons/lu";
import Header from "../../components/Header.jsx";
import React, {useEffect, useRef, useState} from "react";
import "../../components/Term/term.css";
import Term from "../../components/Term/Term.jsx";
import "../../../public/styles/common/view-set/view_set_guess.css";
import FlashcardArray from "../../components/ts/FlashcardArray/FlashcardArray";
import {useParams, useNavigate} from "react-router-dom";
import api from "../../apis/api.js";
import { toast} from "react-toastify";
import {convertHtmlToText, removeNewlines, textToHtml} from "../../utils/HtmlAndFileUtils.jsx";
import SetDeadlineCard from "src/components/SetDeadlineCard/SetDeadlineCard.jsx";
import dayjs from "dayjs";
import {filterProgress} from "src/utils/filterProgressFunction.jsx";
import {compareFunctionSort} from "src/utils/compareFunctionSortCards.jsx";
import Avatar from "src/components/icon/Avatar.jsx";
import Star from "../../components/ts/Button/Star";
import Modal from 'react-bootstrap/Modal';
import {Button, Form} from "react-bootstrap";
import * as emailjs from "emailjs-com";

const ViewSetGuess = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [show, setShow] = useState(false);
    const shareUrl = `${window.location.origin}/user/set/detail/${id}`;
    const handleCopy = () => {
        navigate("/");
    };

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const handleSubmit = (e) => {
        navigate("/login");
    };

    const [onLoading, setOnLoading] = useState(true);
    const [onError, setOnError] = useState(false);

    const [dataInSet, setDataInSet] = useState({
        title: "",
        topic: "",
        usernameCreated: "unknown",
        avatarUserCreated: "",
        numberSetPublic: 0,
    });

    const [dataSettings, setDataSettings] = useState({
        canEdit: false,
        canFavourite: false,
        flipped: false,
        isUserOwner: false,
        cardIndex: 0,
    });

    const [modalDeadlineOpen, setModalDeadlineOpen] = useState(null);

    const [dataCards, setDataCards] = useState({
        displayCards: [],
        fullCards: []
    });

    const handleDataInSetChange = (type, value) => {
        setDataInSet((prev) => ({
            ...prev,
            [type]: value
        }));
    }

    const handleDataSettingsChange = (type, value) => {
        setDataSettings((prev) => ({
            ...prev,
            [type]: value
        }));
    }

    const handleDataCardsChange = (type, value) => {
        setDataCards((prev) => ({...prev, [type]: value}));
    };

    const loadSetInfo = async (userData) => {
        const resSetInfo = await api.get(`/v1/set/set-detail/${id}`);
        console.log(resSetInfo);
        const idUserOwner = resSetInfo.data.data.userId;
        const resSetPublicCount = await api.get(`/v1/set/count-public-set/${idUserOwner}`);
        handleDataSettingsChange("isUserOwner", false);
        handleDataSettingsChange("canEdit", false);
        handleDataSettingsChange("canFavourite", false);

        handleDataInSetChange("title", resSetInfo.data.data.title);
        handleDataInSetChange("topic", resSetInfo.data.data.categoryName);
        handleDataInSetChange("usernameCreated", resSetInfo.data.data.userName);
        handleDataInSetChange("avatarUserCreated", resSetInfo.data.data.avatar);
        handleDataInSetChange("numberSetPublic", resSetPublicCount.data.data);

        document.title = resSetInfo.data.data.title;
    };

    const loadCardInfo = async () => {
        const resCard = await api.get(`/v1/flashcards/list/${id}`);
        // console.log(resCard.data);

        const nativeCards = resCard.data.map(item => ({
            id: item.cardId,
            frontHTML: textToHtml(item.question),
            backHTML: textToHtml(item.answer),
            img: item.imageUrl,
            imageUrl: item.imageUrl,
            isRemembered: false,
            mark: false,
        }));

        handleDataCardsChange("displayCards", nativeCards);
        handleDataCardsChange("fullCards", nativeCards);
        return [...nativeCards];
    };
    useEffect(() => {
        const getDataInCard = async () => {
            let userData = {
                id: -1
            };

            let listCards = [];

            try {
                await loadSetInfo(userData);
                await loadCardInfo(userData);
            } catch (err) {
                console.error("Error when get cards");
                if (err && err.response && err.response.status === 404) {
                    toast.error(err.message);
                    navigate("/error");
                }
                toast.error("An error occurred from server.");
                setOnError(true);
            } finally {
                setOnLoading(false);
            }
        };

        getDataInCard().then().catch();
    }, [id]);


    const displayOnNoLogin = (cards) => {
        return (
            cards.map((card) => (
                <div key={card.id} className="set-card">
                    <Term frontHTML={card.frontHTML}
                          backHTML={card.backHTML}
                          img={card.img}/>
                </div>
            ))
        );
    };


    const handleChangedMark = async (index, marked) => {
        navigate("/login");
    };

    const openDeadlineModal = () => {
        navigate("/login");
    };


    const handleRedirectTrackProgressStudy = async () => {
        navigate("/login");
    };

    const handleResetCardArray = async () => {
        // nothing có gì
    };

    const handleOnSound = async (data) => {
        navigate("/login");
    };

    return (
        <>
            {
                !onLoading ? onError ? (<>
                    <Box className="container flex !justify-center items-center w-full !h-full">
                        <h3>
                            <b>
                                No data display.
                            </b>
                        </h3>
                    </Box>
                </>) : (
                    <Box p="40px" className="container" gap={2}>
                        <Box flex={3} display="grid" gridTemplateColumns="1fr" gap={2}>
                            <div className="title">{dataInSet.title}</div>
                            <div className="topic">
                                <span className="topic-label">Topic :</span>
                                <div className="topic-box">{dataInSet.topic}</div>
                            </div>
                            <div className="flashcard-container">
                                <FlashcardArray
                                    cards={dataCards.displayCards}
                                    FlashcardArrayStyle={{
                                        width: "100%",
                                        fontSize: "1.6rem"
                                    }}
                                    heightCard="400px"
                                    cardIndex={dataSettings.cardIndex}
                                    canEdit={dataSettings.isUserOwner}
                                    canFavorite={dataSettings.canFavourite}
                                    flipped={dataSettings.flipped}
                                    onChangedMark={handleChangedMark}
                                    maximize={handleRedirectTrackProgressStudy}
                                    onResetCard={handleResetCardArray}
                                    setId={id}
                                    onSound={handleOnSound}
                                    share={handleShow}
                                />
                            </div>
                            <div className="button-container">
                                <div className="button" onClick={() => navigate(`/login`)}>
                                    <i style={{marginLeft: "0px", marginRight: "40px"}}><CgFileDocument size={30}/></i>
                                    <span style={{fontSize: "20px"}}>Take a test</span>
                                </div>
                                <div className="button" onClick={() => navigate(`/login`)}>
                                    <i><LuSwords size={30}/></i>
                                    <span>Add to Knowledge Arena</span>
                                </div>
                                <div className="button" onClick={openDeadlineModal}>
                                    <i><LuClock1 size={30}/></i>
                                    <span>Add to Deadline</span>
                                </div>
                            </div>
                            <div className="avatar-container">
                                {
                                    dataInSet.avatarUserCreated === null ?
                                        <Avatar size={30}/> : (
                                            <img src={dataInSet.avatarUserCreated} alt="User Avatar"
                                                 className="avatar"/>
                                        )
                                }
                                <div className="user-info">
                                    <span
                                        style={{fontSize: "18px"}}>by <strong>{dataInSet.usernameCreated}</strong></span>
                                    <span style={{color: "#939393"}}>{dataInSet.numberSetPublic} public sets</span>
                                </div>
                            </div>

                            <div className="separator"></div>
                            <div className="terms-header">
                                <Header title={"Terms (" + dataCards.fullCards.length + ")"} fontSize="24px"/>
                            </div>
                            {
                                displayOnNoLogin(dataCards.fullCards)
                            }
                        </Box>
                    </Box>
                ) : (<>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: "center",
                            height: '100%',
                            width: '100%',
                        }}>
                            <CircularProgress
                                size={40}
                                thickness={4}
                                sx={{
                                    color: '#1976d2',
                                }}
                            />
                        </Box>
                    </>
                )
            }

            {/* Modal for Sharing */}
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Share this set</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <p>Let go to share with your friends 😊</p>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Enter adress email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Input email"
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3 mb-3">
                            Send
                        </Button>
                    </Form>
                    <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="form-control mb-3"
                        style={{ fontSize: "14px" }}
                    />
                    <Button variant="success" onClick={handleCopy}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             className="icon icon-tabler icons-tabler-outline icon-tabler-copy">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path
                                d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/>
                            <path
                                d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>
                        </svg>
                    </Button>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ViewSetGuess;
