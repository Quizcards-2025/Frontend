import React, {CSSProperties, useCallback, useEffect, useState,} from "react";
import FlashcardProps from "../../../interfaces/IFlashcard";
import "./Flashcard.scss";
import {Button, Modal} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Star from "../Button/Star";
import ReactDOMServer from 'react-dom/server';
import TextEditor from "../TextEditor/TextEditor";
import {htmlToText} from "html-to-text";
import SpaceRepetitionCardState from "../../space-repetition-card-state/SpaceRepetitionCardState";
import {toast} from "react-toastify";
import {Video} from "lucide-react";
import {VideoPreview} from "../../VideoPreview";
import {useVideoDisplay} from "../../../context/VideoDisplayContext";

function Flashcard({
                       frontHTML,
                       frontCardStyle = {},
                       frontContentStyle = {},
                       backHTML,
                       backCardStyle = {},
                       backContentStyle = {},
                       className = "",
                       style = {},
                       height = "auto",
                       borderRadius = "1rem",
                       width = "auto",
                       onCardFlip = () => {
                       },
                       manualFlipRef,
                       modalEditTitle = "Sửa",
                       modalBodyCSS,
                       modalStyle,
                       toolSize = 17,
                       onMarkChange = () => {
                       },
                       isMarked,
                       onSaveEdit = () => {
                       },
                       onSound = () => {
                       }
                       ,
                       toolStyle,
                       img,
                       canEdit = false,
                       canFavorite = false,
                       flipped = false,
                       srsState = "",
                       video = "",
                   }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(flipped);
    const [showModal, setShowModal] = useState(false);
    const [isStarMarked, setIsStarMarked] = useState<boolean | undefined>(false);
    const [newFrontHTML, setNewFrontHTML] = useState<string | JSX.Element>(frontHTML);
    const [newBackHTML, setNewBackHTML] = useState<string | JSX.Element>(backHTML);

    const { showVideo } = useVideoDisplay();
    
    const onManualFlip = () => {
        const newFlipState = !isFlipped;
        setIsFlipped(newFlipState);
        onCardFlip(newFlipState);
    };

    useEffect(() => {
        if (manualFlipRef) {
            manualFlipRef.current = onManualFlip;
        }
    }, [manualFlipRef, onManualFlip]);

    useEffect(() => {
        setIsFlipped(flipped);
    }, [flipped]);

    const handleCardClick = () => {
        if (!manualFlipRef) {
            onManualFlip();
        }
    };

    const renderContent = (content: string | JSX.Element,
                           contentStyle: CSSProperties | undefined) => {
        if (typeof content === "string") {
            return (
                <div
                    className="FlashcardWrapper__item--content"
                    dangerouslySetInnerHTML={{__html: content}}
                    style={contentStyle}
                />
            );
        }
        return (
            <div className="FlashcardWrapper__item--content" style={contentStyle}>
                {content}
            </div>
        );
    };

    // flashcard sau khi nhận được giá trị truyền từ cha - array cần useEffect để lấy giá trị mới nhất từ cha
    useEffect(() => {
        setIsStarMarked(isMarked);
    }, [isMarked]);

    // hàm chuyển JSX thanh string
    const convertToString = (content: string | JSX.Element) => {
        if (typeof content === "string") {
            return content;
        }
        return ReactDOMServer.renderToStaticMarkup(content); // Chuyển đổi JSX sang chuỗi
    };
    const handleContentEdit = useCallback(
        (newContent: string, type: string) => {
            if (type === "front") setNewFrontHTML(newContent)
            if (type === "back") setNewBackHTML(newContent);
        }, []
    )
    const handleSaveEdit = () => {
        onSaveEdit(newFrontHTML, newBackHTML);
        setShowModal(false);
    }
    const handleSound = (event: React.MouseEvent<HTMLButtonElement>, content: string) => {
        event.stopPropagation();
        onSound(content);
    }
    const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setShowModal(true);
    }
    const handleCloseModal = () => {
        setShowModal(false);
        setNewFrontHTML(frontHTML);
        setNewBackHTML(backHTML);
    }
    const handleMark = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsStarMarked((prevIsStarMarked) => {
            const newMarkedState = !prevIsStarMarked;
            onMarkChange(newMarkedState);
            return newMarkedState;
        });
    };
    const handleShowVideo = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (video) showVideo(video);
    };

    return (
        <div
            className={`FlashcardWrapper ${className}`}
            style={{
                height: height,
                width: width,
                ...style,
            }}
        >


            <Modal show={showModal} onHide={handleCloseModal} className="FlashcardModal"
                   style={modalStyle}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalEditTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={modalBodyCSS}>
                    <div className="custom-input">
                        <TextEditor value={convertToString(newFrontHTML)}
                                    onContentChange={(e) => handleContentEdit(e, "front")}/>
                    </div>
                    <div className="custom-input">
                        <TextEditor value={convertToString(newBackHTML)}
                                    onContentChange={(e) => handleContentEdit(e, "back")}/>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>

            <div
                className={`FlashcardWrapper__item ${isFlipped ? "FlashcardWrapper__item--flip" : ""}`}
                style={{
                    borderRadius: borderRadius,
                    position: "relative",
                    zIndex: "0",
                }}
                onClick={handleCardClick}
            >
                {/* Mặt trước */}
                <div
                    className="FlashcardWrapper__item--front"
                    style={{
                        ...frontCardStyle,
                        cursor: manualFlipRef ? "default" : "pointer",
                    }}
                >
                    <div className="tool" style={{display: 'flex', gap: '8px', ...toolStyle}}>
                        <SpaceRepetitionCardState state={srsState} className={"mr-4"}/>
                        {
                            video && <>
                                <button className="tool-button !rounded-xl !text-xl !mt-2 !flex !justify-center !items-center"
                                        onClick={handleShowVideo}>
                                    <Video className="w-6 h-6 text-gray-700 mr-2"/>
                                    <span>Play video</span>
                                </button>
                            </>
                        }
                        <button className="tool-button"
                                onClick={(e) => handleSound(e, htmlToText(convertToString(frontHTML)))}>
                            <img width={toolSize} height={toolSize}
                                 src="https://img.icons8.com/ios/50/high-volume--v1.png" alt="sound"/>
                        </button>
                        {/*{*/}
                        {/*    canEdit &&*/}
                        {/*    <button className="tool-button" onClick={(e) => handleOpenModal(e)}>*/}
                        {/*        <img width={toolSize} height={toolSize} src="https://img.icons8.com/ios/50/edit--v1.png"*/}
                        {/*             alt="edit"/>*/}
                        {/*    </button>*/}
                        {/*}*/}
                        {
                            canFavorite &&
                            <button className="tool-button" onClick={(e) => handleMark(e)}>
                                <Star initialMarked={isStarMarked} size={toolSize}/>
                            </button>
                        }
                    </div>
                    {renderContent(frontHTML, frontContentStyle)}
                </div>

                {/* Mặt sau */}
                <div
                    className="FlashcardWrapper__item--back"
                    style={{
                        ...backCardStyle,
                        cursor: manualFlipRef ? "default" : "pointer",
                    }}
                >
                    <div className="tool" style={toolStyle}>
                        <SpaceRepetitionCardState state={srsState} className={"mr-4"}/>
                        {
                            video && <>
                                <button className="tool-button !rounded-xl !text-xl !mt-2 !flex !justify-center !items-center"
                                        onClick={handleShowVideo}>
                                    <Video className="w-6 h-6 text-gray-700 mr-2"/>
                                    <span>Play video</span>
                                </button>
                            </>
                        }
                        <button className="tool-button"
                                onClick={(e) => handleSound(e, htmlToText(convertToString(backHTML)))}>
                            <img width={toolSize} height={toolSize}
                                 src="https://img.icons8.com/ios/50/high-volume--v1.png" alt="sound"/>
                        </button>
                        {/*{*/}
                        {/*    canEdit &&*/}
                        {/*    <button className="tool-button" onClick={(e) => handleOpenModal(e)}>*/}
                        {/*        <img width={toolSize} height={toolSize} src="https://img.icons8.com/ios/50/edit--v1.png"*/}
                        {/*             alt="edit"/>*/}
                        {/*    </button>*/}
                        {/*}*/}
                        {
                            canFavorite &&
                            <button className="tool-button" onClick={(e) => handleMark(e)}>
                                <Star initialMarked={isStarMarked} size={toolSize}/>
                            </button>
                        }
                    </div>

                    <div
                        className="FlashcardWrapper__item--back-content"
                        style={{
                            display: 'flex',
                            width: '100%',
                            flexDirection: img ? 'row' : 'column',
                        }}
                    >
                        {/* Text Content Section */}
                        <div
                            className="back-text"
                            style={{
                                flex: 1,
                                paddingRight: img ? '8px' : '0',
                                width: img ? '50%' : '100%',
                            }}
                        >
                            {renderContent(backHTML, backContentStyle)}
                        </div>

                        {/* Image Section */}
                        {img && (
                            <div
                                className="back-image"
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '50%',
                                }}
                            >
                                <img
                                    src={img}
                                    alt="Illustration"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Flashcard;
