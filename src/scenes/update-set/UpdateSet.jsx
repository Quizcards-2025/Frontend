import {Box, CssBaseline, ThemeProvider, useMediaQuery, useTheme} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import ReactQuill from "react-quill";
import PencelEdit from "../../components/ts/Button/PencilEdit.tsx";
import Plus from "../../components/icon/Plus.jsx";
import Remove from "../../components/icon/Remove.jsx";
import LockIcon from "../../components/icon/LockIcon.jsx";
import ImagePreview from "../../components/ImagePreview.jsx";
import ImageToggleButton from "../../components/ImageToggleButton.jsx";
import api from "../../apis/api.js";
import {canAccess, Roles} from "../../roles/roles.js";
import "react-toastify/dist/ReactToastify.css";
import {uploadToFirebase} from "../../utils/firebaseUtils.js";
import {
    MaxFlashcardsMessage,
    PremiumUpgradeMessage,
    usePremiumFilter
} from "../../components/component-add-update/PremiumFilter.jsx";
import {storage} from "../../configs/firebaseConfig.js";
import {convertHtmlToText, textToHtml} from "../../utils/HtmlAndFileUtils.jsx";
import {useNavigate, useParams} from "react-router-dom";

import {toast} from "react-toastify";
import {ColorModeContext, themeSettings} from "src/theme.js";
import {useSetCardPassword} from "src/context/SetPasswordContext.jsx";
import PasswordChecking from "src/components/password-checking/PasswordChecking.jsx";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function UpdateSet() {
    const {id} = useParams();
    const idNewCard = -2147483647;
    const actionCard = {
        ADD: "add",
        UPDATE: "update",
        DELETE: "delete",
    };
    const [listCard, setListCard] = useState([]);

    const theme = useTheme();
    const [cloneListCard, setCloneListCard] = useState([]);

    const colors = themeSettings(theme.palette.mode);

    const {modalConfirmOpen, setModalConfirmOpen} = useSetCardPassword();

    const backOnceRef = useRef(false);

    const [password, setPassword] = useState("");
    const [expiredAt, setExpiredAt] = useState(0);

    const [maxFlashcards, setMaxFlashcards] = useState(0);
    const [isFreeUser, setIsFreeUser] = useState(true);
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [privacy, setPrivacy] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [categoryNameInit, setCategoryNameInit] = useState("");

    const [editingCardId, setEditingCardId] = useState(null);
    const [editingCardType, setEditingCardType] = useState("");

    const [modalUpdatePassword, setModalUpdatePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [logoutAllSession, setLogoutAllSession] = useState(false);

    const handleCloseModalUpdatePassword = () => {
        setModalUpdatePassword(false);
    };

    const handleUpdateSetPassword = async () => {
        try {
            await api.patch("/v1/set/update-pass", {
                oldPassword,
                newPassword,
                setId: id,
                logoutAllSession,
            });
            toast.success("Update password successfully");
        } catch (err) {
            console.error("Error", err);
            toast.error("Error when update password");
        } finally {
            handleCloseModalUpdatePassword();
        }
    };

    const navigate = useNavigate();

    const [categories, setCategories] = useState([
        {categoryId: 1, categoryName: 'Choose a category'},
    ]);

    const handlePremiumFilter = usePremiumFilter(isFreeUser);

    const loadSetInfo = async (userInfo, listCategory) => {
        const resSetInfo = await api.get(`/v1/set/set-detail/${id}`);

        if (!canAccess(userInfo.role, [Roles.ADMIN]) &&
            userInfo.id !== resSetInfo.data.data.userId) {
            toast.error("You do not have a permission to edit this set.");
            navigate("/error");
            return;
        }

        setTitle(resSetInfo.data.data.title);
        listCategory.forEach((item) => {
            if (item.categoryName === resSetInfo.data.data.categoryName) {
                setSelectedCategory(item.categoryId);
            }
        });
        setCategoryNameInit(resSetInfo.data.data.categoryName);
        setPrivacy(resSetInfo.data.data.sharingMode);
        setIsAnonymous(resSetInfo.data.data.isAnonymous);

        document.title = "Editing: " + resSetInfo.data.data.title;
    };

    const loadCardInfo = async (userData) => {
        const resCard = await api.get(`/v1/progress/user/set/${id}`, {
            headers: {
                "X-Set-Password": password,
                "X-Set-Password-Valid-At": expiredAt,
            },
        });
        setListCard(resCard.data.map(item => ({
            id: item.cardId,
            front: textToHtml(item.question),
            back: textToHtml(item.answer),
            img: item.imageUrl,
        })));
        setCloneListCard(resCard.data.map(item => ({
            id: item.cardId,
            front: textToHtml(item.question),
            back: textToHtml(item.answer),
            img: item.imageUrl,
        })));
    };

    const checkUserStatusAndFetchData = async () => {
        try {
            const [
                resCategories,
                resUserInfo,
                resBenefit,
            ] = await Promise.all([
                api.get("/v1/category/list"),
                api.get("/v1/auth/user-info"),
                api.get("/v1/category-subscription/my-subscription"),
            ]);
            setCategories(resCategories.data);
            let userData = resUserInfo.data;
            let freeUser = canAccess(userData.role, [Roles.FREE_USER]);
            setIsFreeUser(freeUser);

            setMaxFlashcards(resBenefit.data.maxFlashcardsPerSet ?? 0);

            try {
                await loadSetInfo(userData, resCategories.data);
                await loadCardInfo(userData);
            } catch (err) {
                console.error("Error when get cards");
                if (err && err.response && err.response.status === 403) {
                    if (err.response.data && err.response.data.detail) {
                        const jsonData = JSON.parse(err.response.data.detail);
                        const {type} = jsonData;
                        if (type === "Password") {
                            setModalConfirmOpen(true);
                        }
                    } else {
                        toast.error("Error forbidden: " + err.response.data);
                        if (!backOnceRef.current) {
                            backOnceRef.current = true;
                            navigate(-1);
                        }
                    }
                    return;
                }
                if (err.response.status === 404) {
                    toast.error(`Not found set id ${id}`);
                    navigate("/error");
                }
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                loginRedirect();
            }
            console.error(err);
        }
    };

    useEffect(() => {
        checkUserStatusAndFetchData().then().catch();
    }, []);


    const loginRedirect = () => {
        const currentUrl = window.location.pathname + window.location.search;
        const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
        window.location.href = loginUrl;
    };

    const resetBorderColorCard = (id) => {
        const cardDiv = document.getElementById(`cardData-${id}`);
        if (cardDiv) {
            cardDiv.style.border = "none";
        }
    };

    const addCard = () => {
        setListCard([...cloneListCard, {id: idNewCard, front: "", back: "", img: ""}]);
        setEditingCardId(idNewCard);
        setEditingCardType(actionCard.ADD);
    };

    const removeCard = (id) => {
        setListCard([...cloneListCard]);
        setEditingCardId(id);
        setEditingCardType(actionCard.DELETE);
    };

    const editCard = (id) => {
        setListCard([...cloneListCard]);
        setEditingCardId(id);
        setEditingCardType(actionCard.UPDATE);
    };

    const handleImageUpload = (event, id) => {
        const file = event.target.files[0];
        if (file) {
            // Tiêu chí 1: Kiểm tra loại file có phải image không
            if (!file.type.startsWith('image/')) {
                alert('Only image files are accepted. Please select the correct file format!');
                return; // Dừng lại nếu không phải file ảnh
            }

            // Tiêu chí 2: Kiểm tra kích thước file (25MB = 25 * 1024 * 1024 bytes)
            const maxSizeInBytes = 25 * 1024 * 1024; // 25MB
            if (file.size > maxSizeInBytes) {
                alert('File exceeds allowed size (25MB). Please choose a smaller file!');
                return; // Dừng lại nếu file quá lớn
            }

            // Nếu thỏa mãn cả hai tiêu chí, tiến hành đọc file
            const reader = new FileReader();
            reader.onload = (event) => {
                setListCard((prev) =>
                    prev.map((card) => card.id === id ? {
                        ...card, img: event.target.result,
                        newImg: true
                    } : card)
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageRemove = (id) => {
        setListCard((prev) =>
            prev.map((card) => card.id === id ? {...card, img: "", newImg: true,} : card)
        );
    };

    const handleWriteDataCard = (type, value, id) => {
        setListCard((prev) =>
            prev.map((card) => card.id === id ? {...card, [type]: value} : card)
        );
    }

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        console.log(event.target.value);
    };

    const quillModules = {
        toolbar: false,
    };

    const handlePrivacyChange = (event) => {
        setPrivacy(event.target.value === "true");
    };

    const uploadImagesToCloud = async (card) => {
        let downloadUrl = "";
        if (card.img) {
            downloadUrl = await uploadToFirebase(
                storage,
                card.img,
                "images",
                null,
                null
            );
        }
        return downloadUrl;
    };

    const checkCardValid = (card) => {
        let messageError = "";
        let isOk = true;

        const cardDiv = document.getElementById(`cardData-${card.id}`);

        if (!(card.front && card.back)) {
            messageError = "Missing question or answer in card";
            isOk = false;
        }
        if (isOk && convertHtmlToText(card.front).length > 500 ||
            convertHtmlToText(card.back).length > 500) {
            messageError = "Length of question or answer must be less than 500.";
            isOk = false;
        }
        if (isOk && card.img && isFreeUser && card.newImg) {
            messageError = "You cannot add set flashcard because u maybe cheating...";
            isOk = false;
        }
        if (!isOk) {
            toast.error(messageError);
            cardDiv.style.border = "2px solid red";
            cardDiv.scrollIntoView({behavior: "smooth", block: "center"});
            throw new Error("Error card");
        }
        cardDiv.style.border = "none";
    };

    const checkCardToAddValid = (card) => {
        if (listCard.length > maxFlashcards) {
            toast.error(`You cannot add set flashcard because max cards of set are: ${maxFlashcards}`);
            throw new Error("Error card");
        }
        checkCardValid(card);
    };

    const handleCreate = async (event) => {
        try {
            if (editingCardId !== null && editingCardId === idNewCard) {
                const card = listCard.find(card => card.id === editingCardId);
                if (card) {
                    checkCardToAddValid(card);
                    let downloadUrl = "";
                    if (card.newImg) {
                        downloadUrl = await uploadImagesToCloud(card);
                    }
                    const res = await api.post("/v1/flashcards/create-new-flashcard", {
                        question: convertHtmlToText(card.front),
                        answer: convertHtmlToText(card.back),
                        imageLink: downloadUrl,
                        setId: id,
                    });
                    toast.success("Added new card successfully");
                    resetBorderColorCard(editingCardId);
                    let newData = res.data;
                    setListCard((prev) =>
                        prev.map((card) => card.id === editingCardId ? {
                            ...card, id: newData.cardId,
                            newImg: false, img: downloadUrl,
                            front: textToHtml(convertHtmlToText(card.front)),
                            back: textToHtml(convertHtmlToText(card.back)),
                        } : card)
                    );
                    setCloneListCard((prev) =>
                        prev.map((card) => card.id === editingCardId ? {
                            ...card, id: newData.cardId,
                            img: downloadUrl,
                            front: textToHtml(convertHtmlToText(card.front)),
                            back: textToHtml(convertHtmlToText(card.back)),
                        } : card)
                    );
                    setEditingCardId(null);
                    setEditingCardType("");
                }
            }
        } catch (err) {
            console.error(`Cannot add card: ${err}`);
            toast.error("Added new card failed");
        }
    };

    const handleUpdate = async (event) => {
        try {
            if (editingCardId !== null && editingCardId !== idNewCard) {
                const card = listCard.find(card => card.id === editingCardId);
                if (card) {
                    checkCardValid(card);
                    let downloadUrl = "";
                    if (card.newImg) {
                        downloadUrl = await uploadImagesToCloud(card);
                    } else {
                        downloadUrl = card.img;
                    }
                    await api.put("/v1/flashcards/update-flashcard", {
                        cardId: card.id,
                        question: convertHtmlToText(card.front),
                        answer: convertHtmlToText(card.back),
                        imageLink: downloadUrl,
                        setId: id,
                    });
                    toast.success("Updated card successfully");
                    resetBorderColorCard(editingCardId);
                    setListCard((prev) =>
                        prev.map((card) => card.id === editingCardId ? {
                            ...card,
                            newImg: false, img: downloadUrl,
                            front: textToHtml(convertHtmlToText(card.front)),
                            back: textToHtml(convertHtmlToText(card.back)),
                        } : card)
                    );
                    setCloneListCard((prev) =>
                        prev.map((card) => card.id === editingCardId ? {
                            ...card,
                            img: downloadUrl,
                            front: textToHtml(convertHtmlToText(card.front)),
                            back: textToHtml(convertHtmlToText(card.back)),
                        } : card)
                    );
                    setEditingCardId(null);
                    setEditingCardType("");
                }
            }
        } catch (err) {
            console.error(`Cannot update card: ${err}`);
            toast.error("Updated card failed");
        }
    };

    const handleEditSet = async (e) => {
        e.preventDefault();
        try {
            if (!title) {
                toast.error("Missing title");
                return;
            }
            await api.put("/v1/set/update-set", {
                setId: id,
                title,
                descriptionSet: description,
                isApproved: true,
                sharingMode: privacy,
                isAnonymous,
                categoryId: selectedCategory,
            });
            toast.success("Updated set successfully");
            document.title = "Editing: " + title;
        } catch (err) {
            toast.error("Updated set failed");
        }
    };

    const handlePostAdd = async () => {
        await handleCreate();
    };

    const handlePostUpdate = async () => {
        await handleUpdate();
    };

    const handlePostDelete = async () => {
        try {
            if (editingCardId !== null && editingCardId !== idNewCard) {
                if (listCard.length === 2) {
                    toast.error("You cannot delete card because minimum card is 2.");
                    return;
                }
                await api.delete("/v1/flashcards/delete-flashcard", {
                    cardId: editingCardId,
                    setId: id,
                });
                toast.success("Delete card successfully.");
                setListCard((prev) => prev.filter(card => card.id !== editingCardId));
                setCloneListCard((prev) => prev.filter(card => card.id !== editingCardId));
                resetBorderColorCard(editingCardId);
                setEditingCardType("");
                setEditingCardId(null);
            }
        } catch (err) {
            console.error(err);
            toast.error("Deleted card failed");
        }
    };

    const handleOkOperator = async () => {
        switch (editingCardType) {
            case actionCard.ADD:
                await handlePostAdd();
                break;
            case actionCard.UPDATE:
                await handlePostUpdate();
                break;
            case actionCard.DELETE:
                await handlePostDelete();
                break;
        }
    };

    if (modalConfirmOpen) {
        return (
            <ColorModeContext.Provider value={colors}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <PasswordChecking
                        setId={id}
                        changePassword={setPassword}
                        changeExpiredAt={setExpiredAt}
                        onClose={(setId, validating, password, expiredAt) => {
                            if (validating) {
                                checkUserStatusAndFetchData().then().catch();
                            } else {
                                if (!backOnceRef.current) {
                                    backOnceRef.current = true;
                                    navigate(-1);
                                }
                            }
                        }}
                    />
                </ThemeProvider>
            </ColorModeContext.Provider>
        );
    }

    return (
        <>
            <Box p={isSmallScreen ? 2 : 5} sx={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                margin: {xs: "0 20px", sm: "0 50px", md: "0 150px", lg: "0 250px"},
                position: "relative"
            }}>
                <h3><b>Update set: {title}</b></h3>

                <input
                    type="text"
                    style={{
                        border: "hidden",
                        height: "20px",
                        width: "100%",
                        fontWeight: "bold",
                        padding: "20px",
                        fontSize: "15px",
                        borderRadius: "15px",
                    }}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Give a title ..."
                />

                <input
                    type="text"
                    style={{
                        border: "hidden",
                        height: "50px",
                        width: "100%",
                        fontWeight: "bold",
                        padding: "20px",
                        fontSize: "15px",
                        borderRadius: "15px",
                    }}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Description ..."
                />

                <Box sx={{display: "flex", flexDirection: {xs: "column", md: "row"}, gap: "20px", marginTop: '-1rem'}}>
                    <Box width="100%" p={2}>
                        <p style={{fontSize: "16px"}}>Category :</p>
                        <select style={{
                            width: "100%",
                            height: "40px",
                            borderRadius: "15px",
                            border: "none",
                            borderBottom: "4px solid #e0e0fe",
                            padding: "8px"
                        }} onChange={handleCategoryChange}
                                value={(() => {
                                    if (!categoryNameInit) return "1";

                                    const matchingCategory = categories.find(
                                        (category) => category.categoryName === categoryNameInit
                                    );

                                    if (matchingCategory) {
                                        return matchingCategory.categoryId.toString();
                                    }

                                    return "1";
                                })()}
                        >
                            {
                                categories.map(category => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryName}
                                    </option>
                                ))
                            }
                        </select>
                        <Box className="!mt-4 !mb-3 flex !gap-8 !items-center">
                            <p style={{fontSize: "16px", margin: 0,}}>Update password:</p>
                            <Box
                                className={`!px-5 !py-2 rounded-full !bg-[#e0e0fe] flex items-center justify-center
                                    hover:!bg-[#c0c0ff] cursor-pointer`}
                                onClick={() => setModalUpdatePassword(true)}
                            >
                                Update
                            </Box>
                        </Box>
                        <Box sx={{display: "flex", justifyContent: "space-between", flexWrap: "wrap"}}>
                            <div style={{width: "48%"}}>
                                <p style={{fontSize: "16px"}}>Privacy:</p>
                                <select
                                    value={privacy.toString()}
                                    onChange={handlePrivacyChange}
                                    style={{
                                        width: "100%",
                                        height: "40px",
                                        borderRadius: "15px",
                                        border: "none",
                                        borderBottom: "4px solid #e0e0fe",
                                        padding: "8px"
                                    }}>
                                    <option value="true">Publish</option>
                                    <option value="false">Private</option>
                                </select>
                            </div>

                            <div>
                                <p style={{fontSize: "16px"}}>Publish as :</p>
                                <button style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-around",
                                    backgroundColor: "white",
                                    borderRadius: "15px",
                                    height: "40px",
                                    width: "130px",
                                    border: "none",
                                    borderBottom: "4px solid #dbbef4",
                                    color: isAnonymous ? "#000000" : "#b6b7bf",
                                    fontWeight: isAnonymous ? "bold" : "normal",
                                }}
                                        onClick={(e) => handlePremiumFilter(
                                            e,
                                            !isAnonymous && isFreeUser,
                                            () => setIsAnonymous(isAnonymous => !isAnonymous),
                                            PremiumUpgradeMessage
                                        )}>
                                    Anonymous
                                    {
                                        !isAnonymous && isFreeUser && <LockIcon/>
                                    }
                                </button>
                            </div>
                        </Box>
                    </Box>
                </Box>


                <Box
                    width="100%"
                >
                    <button
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#ffffff", // Màu trắng tinh tế
                            color: "#2c3e50", // Màu xám xanh đậm sang trọng
                            fontSize: "18px", // Kích thước chữ lớn hơn một chút
                            fontWeight: "bold", // Font chữ đậm để tạo điểm nhấn
                            borderRadius: "30px", // Bo góc mềm mại hơn
                            height: "60px", // Tăng chiều cao để tạo cảm giác cao cấp
                            width: "100%",
                            border: "2px solid #dfe4ea", // Đường viền nhẹ, sắc nét
                            cursor: "pointer",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Hiệu ứng nổi nhẹ
                            transition: "all 0.3s ease"
                        }}
                        onClick={handleEditSet}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#f8f9fa"; // Thay đổi nền khi hover
                            e.target.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.15)"; // Tăng độ sâu
                            e.target.style.transform = "translateY(-2px)"; // Hiệu ứng nổi lên
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#ffffff";
                            e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        Edit the set
                    </button>
                </Box>


                <span
                    style={{width: "100%", height: "3px", backgroundColor: "#e2e2fe", borderRadius: "15px"}}></span>

                <h3><b>Fix your terms</b></h3>

                {listCard.map((card, index) => (
                    <Box key={card.id} p={1} bgcolor="#e0e0fe" id={`cardData-${card.id}`}
                         tabIndex={-1}
                         sx={{
                             display: "flex",
                             flexDirection: "column",
                             width: "100%",
                             borderRadius: "15px",
                             gap: 2,
                             ...((editingCardType !== actionCard.ADD && editingCardId !== card.id) && {
                                 "&:hover": {
                                     cursor: "crosshair", // Chỉ áp dụng hover nếu condition = true
                                     backgroundColor: "#c0c0ff", // Thay đổi màu nền khi hover
                                     transform: "scale(1.02)", // Tăng nhẹ kích thước
                                     boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Thêm đổ bóng
                                 },
                             }),
                         }}
                    >
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: "10px"
                        }}>
                            <span>{index + 1}</span>
                            <Box sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                            }}>
                                {
                                    ((editingCardId !== card.id)
                                        || (editingCardId === card.id && editingCardType !== actionCard.DELETE
                                            && editingCardType !== actionCard.ADD)) &&
                                    <Remove onClick={() => removeCard(card.id)}/>
                                }
                                {
                                    ((editingCardId !== card.id)
                                        || (editingCardId === card.id && editingCardType !== actionCard.UPDATE
                                            && editingCardType !== actionCard.ADD)) &&
                                    <PencelEdit onClick={() => editCard(card.id)} backgroundColor={"none"}/>
                                }
                            </Box>
                        </Box>

                        <Box sx={{
                            display: "flex",
                            flexDirection: {xs: "column", md: "row"},
                            gap: 2,
                            maxHeight: "500px",
                            overflowY: "auto"
                        }}>
                            <ReactQuill
                                readOnly={editingCardId === null || editingCardId !== card.id ||
                                    editingCardType === actionCard.DELETE}
                                theme="snow"
                                value={card.front || ""}
                                modules={quillModules}
                                className="ans-custom-react-quill"
                                style={{
                                    border: "none",
                                    outline: "none",
                                    height: "100%", width: "100%",
                                    overflowY: "auto",
                                    backgroundColor: "white",
                                    borderRadius: "15px"
                                }}
                                placeholder="Enter your question..."
                                onChange={(value) => handleWriteDataCard("front", value, card.id)}
                            />

                            <ReactQuill
                                readOnly={editingCardId === null || editingCardId !== card.id ||
                                    editingCardType === actionCard.DELETE}
                                theme="snow"
                                value={card.back || ""}
                                modules={quillModules}
                                className="ans-custom-react-quill"
                                style={{
                                    border: "none",
                                    outline: "none",
                                    height: "100%", width: "100%",
                                    overflowY: "auto",
                                    backgroundColor: "white",
                                    borderRadius: "15px"
                                }}
                                placeholder="Enter your answer..."
                                onChange={(value) => handleWriteDataCard("back", value, card.id)}
                            />

                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                width: "200px",
                                height: "100%"
                            }}>
                                <ImagePreview img={card.img} id={card.id}/>
                                {
                                    ((editingCardType === actionCard.ADD)
                                        || (editingCardId === card.id && editingCardType !== actionCard.DELETE)) &&
                                    <>
                                        <input
                                            type="file"
                                            id={`imageUpload-${card.id}`}
                                            accept="image/*"
                                            onClick={(e) => handlePremiumFilter(e,
                                                isFreeUser,
                                                () => {
                                                },
                                                PremiumUpgradeMessage
                                            )}
                                            onChange={(e) => handleImageUpload(e, card.id)}
                                            style={{display: "none"}}
                                            readOnly={editingCardId === null || editingCardId !== card.id ||
                                                editingCardType === actionCard.DELETE}
                                            disabled={editingCardId === null || editingCardId !== card.id ||
                                                editingCardType === actionCard.DELETE}
                                        />
                                        <ImageToggleButton
                                            hasImage={card.img}
                                            onRemove={(e) => handlePremiumFilter(e,
                                                isFreeUser,
                                                () => handleImageRemove(card.id),
                                                PremiumUpgradeMessage
                                            )}
                                            onUpload={() => document.getElementById(`imageUpload-${card.id}`).click()}
                                            childComponent={!isFreeUser ? <></> : <LockIcon/>}
                                        />
                                    </>
                                }
                            </div>
                        </Box>
                        {
                            editingCardId !== null && editingCardId === card.id &&
                            <Box sx={{
                                display: "flex",
                                flexDirection: {xs: "column", md: "row"},
                                gap: 2,
                                width: "100%",
                                justifyContent: "space-between",
                            }}>
                                <button style={{
                                    width: "100%",
                                    height: "50px",
                                    borderRadius: "20px",
                                    border: "1px solid black",
                                    background: "#dadaeb",
                                    fontSize: "1.2rem",
                                }} onClick={handleOkOperator}>
                                    {
                                        editingCardType === actionCard.ADD ?
                                            'Add' : editingCardType === actionCard.UPDATE ?
                                                'Update' : 'Save'
                                    }
                                </button>
                                <button style={{
                                    width: "100%",
                                    height: "50px",
                                    borderRadius: "20px",
                                    border: "1px solid black",
                                    background: "#dadaeb",
                                    fontSize: "1.2rem",
                                }}
                                        onClick={() => {
                                            setListCard(cloneListCard);
                                            resetBorderColorCard(editingCardId);
                                            setEditingCardId(null);
                                            setEditingCardType("");
                                        }}>Cancel
                                </button>
                            </Box>
                        }
                    </Box>
                ))}

                <Box sx={{display: "flex", justifyContent: "center"}}>
                    <div style={{position: "relative"}}>
                        <Plus onClick={(e) => handlePremiumFilter(e,
                            listCard.length >= maxFlashcards,
                            addCard,
                            MaxFlashcardsMessage
                        )} style={{cursor: "pointer"}}/>
                        {
                            listCard.length >= maxFlashcards &&
                            <div style={{position: "absolute", top: -10, right: -10}}>
                                <LockIcon/>
                            </div>
                        }
                    </div>
                </Box>
            </Box>

            {/*<ToastContainer*/}
            {/*    autoClose={3000}*/}
            {/*    hideProgressBar={false}*/}
            {/*    newestOnTop={false}*/}
            {/*    closeOnClick*/}
            {/*    rtl={false}*/}
            {/*    pauseOnFocusLoss*/}
            {/*    draggable*/}
            {/*    pauseOnHover*/}
            {/*    theme="dark"*/}
            {/*/>*/}

            <React.Fragment>
                <Dialog
                    open={modalUpdatePassword}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={handleCloseModalUpdatePassword}
                    aria-describedby="password-checking-dialog-description"
                    PaperProps={{
                        style: {
                            borderRadius: '12px',
                            padding: '10px',
                            minWidth: '400px',
                        }
                    }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <DialogTitle sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        paddingBottom: '2px'
                    }}>
                        {"Enter old password"}
                    </DialogTitle>
                    <DialogContent sx={{paddingTop: '2px !important'}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="password"
                            label="Old password"
                            type={showOldPassword ? 'text' : 'password'}
                            fullWidth
                            variant="outlined"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            sx={{
                                marginBottom: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={(e) => setShowOldPassword(!showOldPassword)}
                                            edge="end"
                                        >
                                            {showOldPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </DialogContent>
                    <DialogTitle sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        paddingBottom: '2px'
                    }}>
                        {"Enter new password"}
                    </DialogTitle>
                    <DialogContent sx={{paddingTop: '2px !important'}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="password"
                            label="New pssword"
                            type={showNewPassword ? 'text' : 'password'}
                            fullWidth
                            variant="outlined"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={{
                                marginBottom: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={(e) => setShowNewPassword(!showNewPassword)}
                                            edge="end"
                                        >
                                            {showNewPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </DialogContent>
                    <DialogContent sx={{paddingTop: '8px !important'}}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            justifyContent: 'center'
                        }}>
                            <Typography variant="body1" sx={{fontSize: '0.9rem'}}>
                                Also logout all users sessions
                            </Typography>
                            <input
                                type="checkbox"
                                checked={logoutAllSession}
                                onChange={(e) => setLogoutAllSession(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer'
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{
                        paddingRight: '24px',
                        paddingLeft: '24px',
                        paddingBottom: '16px',
                        paddingTop: '16px',
                        justifyContent: 'center'
                    }}>
                        <Button
                            onClick={handleCloseModalUpdatePassword}
                            sx={{
                                color: 'grey.700',
                                borderColor: 'grey.400',
                                borderRadius: '8px',
                                textTransform: 'none',
                                padding: '8px 24px',
                                marginRight: '8px',
                                flexGrow: 1,
                                '&:hover': {
                                    backgroundColor: 'grey.100',
                                    borderColor: 'grey.500',
                                }
                            }}
                            variant="outlined"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateSetPassword}
                            variant="contained"
                            sx={{
                                backgroundColor: '#1976d2',
                                color: 'white',
                                borderRadius: '8px',
                                textTransform: 'none',
                                padding: '8px 24px',
                                flexGrow: 1,
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                }
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        </>
    );
}

export default UpdateSet;