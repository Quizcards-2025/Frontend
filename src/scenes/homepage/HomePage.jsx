import {Box} from "@mui/material";
import {CgFileDocument} from "react-icons/cg";
import {LuClock1, LuSwords} from "react-icons/lu";
import Header from "../../components/Header.jsx";
import React, {useEffect, useState} from "react";
import "../../components/Term/term.css";
import Term from "../../components/Term/Term.jsx";
import SetCard from "../../components/SetCard/SetCard.jsx";
import "./homepage.css";
import FlashcardArray from "../../components/ts/FlashcardArray/FlashcardArray";
import {Link, useParams} from "react-router-dom";
import api from "../../apis/api.js";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {textToHtml} from "../../utils/HtmlAndFileUtils.jsx";

const HomePage = () => {
    const {id} = useParams();
    const [onLoading, setOnLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState({
        id: -1
    });
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
    });
    const [isUserOwner, setIsUserOwner] = useState(false);

    const [cards, setCards] = useState([
        {
            id: 1,
            frontHTML: <></>,
            backHTML: <></>,
        },
    ]);

    const [nativeCards, setNativeCards] = useState({
        cardId: 1,
        question: "",
        answer: "",
        imageUrl: "",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

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

    useEffect(() => {
        const getDataInCard = async () => {
            let userData = {
                id: -1
            };

            try {
                const response = await api.get("/v1/auth/user-info");
                setCurrentUser(response.data);
                userData = response.data;
            } catch {
            }


            try {
                const resSetInfo = await api.get(`/v1/set/set-detail/${id}`);
                const idUserOwner = resSetInfo.data.data.userId;

                handleDataSettingsChange("isUserOwner", idUserOwner === userData.id);
                handleDataSettingsChange("canEdit", idUserOwner === userData.id);
                handleDataSettingsChange("canFavourite", userData.id !== -1);

                handleDataInSetChange("title", resSetInfo.data.data.title);
                document.title = resSetInfo.data.data.title;
                handleDataInSetChange("topic", resSetInfo.data.data.categoryName);
                handleDataInSetChange("usernameCreated", resSetInfo.data.data.userName);
                handleDataInSetChange("avatarUserCreated", resSetInfo.data.data.avatar);
                const resSetPublicCount = await api.get(`/v1/set/count-public-set/${idUserOwner}`);
                handleDataInSetChange("numberSetPublic", resSetPublicCount.data.data);
                const resCard = await api.get(`/v1/set/detail/cards/${id}`);

                setNativeCards(resCard.data.data);

                let nativeCards_ = resCard.data.data.map(item => ({
                    id: item.cardId,
                    frontHTML: <>
                        <div dangerouslySetInnerHTML={{__html: textToHtml(item.question)}}/>
                    </>,
                    backHTML: <>
                        <div dangerouslySetInnerHTML={{__html: textToHtml(item.answer)}}/>
                    </>,
                    img: item.imageUrl,
                    imageUrl: item.imageUrl,
                    progress: undefined,
                    mark: undefined,
                }));

                if (userData.id !== -1) {
                    const resProgress = await api.get(`/v1/progress/user/set/${id}`);
                    let {displayList, fullList} = loadProgress(userData.id, id, nativeCards_, resProgress.data.data);
                    handleDataCardsChange("displayCards", displayList);
                    handleDataCardsChange("fullCards", fullList);
                } else {
                    handleDataCardsChange("displayCards", nativeCards_);
                    handleDataCardsChange("fullCards", nativeCards_);
                }

                setOnLoading(true);
            } catch (err) {
                console.error("Error when get cards");
                if (err.response.status === 404) {
                    toast.error(err.message);
                    window.location.href = "/error";
                }
            }
        };

        getDataInCard().then().catch();
    }, []);

    const compareFunctionSort = (firstCard, secondCard) => {
        if (secondCard.mark !== firstCard.mark) {
            return secondCard.mark - firstCard.mark;
        }

        const orderFirst = firstCard.progress === false ? 1 : firstCard.progress === undefined ?
            2 : 3;
        const orderSecond = secondCard.progress === false ? 1 : secondCard.progress === undefined ?
            2 : 3;

        if (orderFirst !== orderSecond) {
            return orderFirst - orderSecond;
        }

        return firstCard.id < secondCard.id;
    };

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

    const displayOnLogin = (cards) => {
        const cardLearnings = cards.filter(item => item.progress === false).sort(compareFunctionSort);
        const cardNotLearnings = cards.filter(item => item.progress === undefined).sort(compareFunctionSort);
        const cardLearned = cards.filter(item => item.progress === true).sort(compareFunctionSort);

        return (
            <>
                {
                    cardLearnings.length > 0 ?
                        <>
                            <div style={{
                                fontSize: '20px',
                                color: "orange",
                            }}>
                                Learnings: {cardLearnings.length}
                            </div>
                            {
                                cardLearnings.map((card) => (
                                    <div key={card.id} className="set-card">
                                        <Term frontHTML={card.frontHTML}
                                              backHTML={card.backHTML}
                                              img={card.img}/>
                                    </div>
                                ))
                            }
                        </> : <></>
                }
                {
                    cardNotLearnings.length > 0 ?
                        <>
                            <div style={{
                                fontSize: '20px',
                                color: "blue",
                            }}>
                                Not learnings: {cardNotLearnings.length}
                            </div>
                            {
                                cardNotLearnings.map((card) => (
                                    <div key={card.id} className="set-card">
                                        <Term frontHTML={card.frontHTML}
                                              backHTML={card.backHTML}
                                              img={card.img}/>
                                    </div>
                                ))
                            }
                        </> : <></>
                }
                {
                    cardLearned.length > 0 ? <>
                        <div style={{
                            fontSize: '20px',
                            color: "green",
                        }}>
                            Learned: {cardLearned.length}
                        </div>
                        {
                            cardLearned.map((card) => (
                                <div key={card.id} className="set-card">
                                    <Term frontHTML={card.frontHTML}
                                          backHTML={card.backHTML}
                                          img={card.img}/>
                                </div>
                            ))
                        }
                    </> : <></>
                }
            </>
        );
    };

    const loadSetting = async () => {
        //
    };

    const loadProgress = (userId, setId, listCards, listProgress) => {
        if (userId !== -1) {
            try {
                // gọi api để lấy full progress các card của người dùng đã đăng nhập

                // vì dữ liệu là mảng, chuyển nó qua map => Truy xuất O(1)
                let mapProgress = new Map(listProgress.map(item => [item.cardId, item]));

                let displayList = []; // lưu trữ các card chưa học hoặc đang học
                let fullList = []; // lưu trữ toàn bộ card, sử dụng cho hiển thị terms ở phía dưới

                // lọc các card chưa học hoặc đang học để hiển thị lên màn hình
                listCards.forEach((item) => {
                    // khởi tạo progress ban đầu là undefined => tức là giả sử người dùng chưa học card này.
                    let progressData = undefined;
                    let markData = false; // khởi tạo mark ban đầu luôn là false (tức chưa đánh dấu card này)

                    // nếu card của người dùng có tồn tại trên progress
                    if (mapProgress.has(item.id)) {
                        progressData = mapProgress.get(item.id).progress === 1; // thay đổi dữ liệu progress
                        markData = mapProgress.get(item.id).progress === 1; // -------------------- mark
                    }

                    // check var progress (khác true tức là 'chưa học' or 'đang học')
                    if (progressData !== true) {
                        // đẩy dữ liệu vào display list
                        displayList.push({
                            ...item,
                            progress: progressData, // bổ sung trường progress
                            mark: markData, // bổ sung trường mark
                        });
                    }

                    // bổ sung card vào full list
                    fullList.push({
                        ...item,
                        progress: progressData,
                        mark: markData,
                    })
                });

                // Sắp xếp display list.
                // Quy tắc: ưu tiên đưa những thẻ đánh dấu lên trước.
                // Trong trường hợp còn lại (những thẻ cùng có đánh dấu hoặc không cùng có đánh dấu), ưu tiên những thẻ
                // đang học lên trước chưa học.
                // Cuối cùng là sắp xếp theo id.

                displayList.sort(compareFunctionSort);

                // sắp xếp full list
                // mà thực ra không cần sắp xếp
                // xuống dưới display terms thì đơn giản là chỉ lọc

                return {
                    displayList,
                    fullList
                };
            } catch (err) {
                console.error(`Error when fetch data: ${err}`);
            }
        }
    };

    return (
        onLoading ? (
            <Box p="20px" className="container" gap={2}>
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
                            canEdit={dataSettings.isUserOwner}
                            canFavorite={dataSettings.canFavourite}
                        />
                    </div>

                    <div className="button-container">
                        <div className="button">
                            <i style={{marginLeft: "0px", marginRight: "40px"}}><CgFileDocument size={30}/></i>
                            <span style={{fontSize: "20px"}}>Take a test</span>
                        </div>
                        <div className="button">
                            <i style={{marginRight: "40px"}}><LuSwords size={30}/></i>
                            <span style={{fontSize: "20px"}}>Add to Knowledge Arena</span>
                        </div>
                        <div className="button">
                            <i style={{marginRight: "40px"}}><LuClock1 size={30}/></i>
                            <span style={{fontSize: "20px"}}>Add to Deadline</span>
                        </div>
                    </div>
                    <Link
                        to="/"
                        style={{
                            textDecoration: "none", // Bỏ gạch chân
                            color: "inherit",        // Giữ màu của văn bản thông thường
                            cursor: "pointer",       // Bỏ hiệu ứng trỏ chuột
                        }}
                    >
                        <div className="avatar-container">
                            <img src={dataInSet.avatarUserCreated} alt="User Avatar" className="avatar"/>
                            <div className="user-info">
                                <span style={{fontSize: "18px"}}>by <strong>{dataInSet.usernameCreated}</strong></span>
                                <span style={{color: "#939393"}}>{dataInSet.numberSetPublic} public sets</span>
                            </div>
                        </div>
                    </Link>
                    <div className="separator"></div>
                    <div className="terms-header">
                        <Header title={"Terms (" + dataCards.fullCards.length + ")"} fontSize="24px"/>
                    </div>
                    {
                        currentUser.id === -1 ?
                            displayOnNoLogin(dataCards.fullCards) :
                            displayOnLogin(dataCards.fullCards)
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

                <ToastContainer
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </Box>
        ) : (<></>)
    )
}

export default HomePage;
