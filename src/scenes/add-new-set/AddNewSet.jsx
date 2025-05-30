import {Box, Button, useMediaQuery, useTheme} from "@mui/material";
import {useCallback, useEffect, useRef, useState} from "react";
import ReactQuill from "react-quill";
import CreateCardButton from "../../components/icon/CreateCardButton.jsx";
import Plus from "../../components/icon/Plus.jsx";
import Remove from "../../components/icon/Remove.jsx";
import LockIcon from "../../components/icon/LockIcon.jsx";
import ImportText from "../../components/icon/ImportText.jsx";
import ImagePreview from "../../components/ImagePreview.jsx";
import ImageToggleButton from "../../components/ImageToggleButton.jsx";
import api from "../../apis/api.js";
import {
    MaxFlashcardsMessage,
    PremiumUpgradeMessage,
    usePremiumFilter
} from "../../components/component-add-update/PremiumFilter.jsx";
import {canAccess, Roles} from "../../roles/roles.js";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {uploadToFirebase} from "../../utils/firebaseUtils.js";
import {storage} from "../../configs/firebaseConfig.js";
import {useNavigate} from "react-router-dom";
import {convertHtmlToText, textToHtml} from "../../utils/HtmlAndFileUtils.jsx";
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import ImportTextComp from "src/components/ImportText/ImportTextComp.jsx";
import "./index.css";
import {parseImportTextBaseOnString, parseImportTextQToA} from "src/utils/parseImportText.jsx";
import debounce from "lodash/debounce";
import {VideoPreview} from "src/components/VideoPreview.jsx";
import {VideoToggleButton} from "src/components/VideoToggleButton.jsx";

function AddNewSet() {
    const navigate = useNavigate();
    const [listCard, setListCard] = useState([]);
    const [importFile, setImportFile] = useState(false);
    const [showAIGenerate, setShowAIGenerate] = useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [benefits, setBenefits] = useState({});
    const [maxFlashcards, setMaxFlashcards] = useState(0);
    const [isFreeUser, setIsFreeUser] = useState(true);
    const [isBlockPageByPremium, setIsBlockPageByPremium] = useState(false);
    const [blockMessageBody, setBlockMessageBody] = useState(<></>);

    const [videoUploadProgress, setVideoUploadProgress] = useState({});
    const [videoPreviewModal, setVideoPreviewModal] = useState(false);
    const [videoPreviewData, setVideoPreviewData] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [privacy, setPrivacy] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const upgradeModal = useRef(null);

    const blockPageBtn = useRef(null);

    const [categories, setCategories] = useState([
        {categoryId: 1, categoryName: 'Choose a category'},
    ]);

    const [importDropdownOpen, setImportDropdownOpen] = useState(false);

    const [aiFiles, setAiFiles] = useState([]);
    const [aiFileError, setAiFileError] = useState("");
    const [aiNum, setAiNum] = useState(1);
    const [aiNumError, setAiNumError] = useState("");

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const [
                    resCategories,
                    resRole,
                    resBenefit,
                    resNumberSet,
                    resMaxSetCreatedToday,
                ] = await Promise.all([
                    api.get("/v1/category/list"),
                    api.get("/v1/auth/user-info"),
                    api.get("/v1/category-subscription/my-subscription"),
                    api.get("/v1/set/count-set"),
                    api.get("/v1/set/count-set-in-current-date"),
                ]);

                setCategories(resCategories.data);
                let freeUser = canAccess(resRole.data.role, [Roles.FREE_USER]);
                setIsFreeUser(freeUser);

                setBenefits(resBenefit.data);
                setMaxFlashcards(resBenefit.data.maxFlashcardsPerSet ?? 0);

                if (resNumberSet.data.data >= resBenefit.data.maxSetsFlashcards) {
                    blockPageFunction(
                        `You cannot create more sets because the maximum number of sets is: ${resBenefit.data.maxSetsFlashcards}`,
                        freeUser
                    );
                    return;
                }
                if (resMaxSetCreatedToday.data.data >= resBenefit.data.maxSetsPerDay) {
                    blockPageFunction(
                        `You cannot create more sets because the maximum number of sets created per day is: ${resBenefit.data.maxSetsPerDay}`,
                        freeUser
                    );
                }
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    loginRedirect();
                }
                console.error(err);
            }
        };

        checkUserStatus().then().catch();
    }, []);

    const handlePremiumFilter = usePremiumFilter(isFreeUser);

    const BlockMessage = ({toastId}) => (
        <div>
            <h2>Sorry</h2>
            {blockMessageBody}
            <button id="cancelBtn" onClick={() => toast.dismiss(toastId)}>
                Cancel
            </button>
            {isFreeUser && (
                <button id="saveButtonBtn" onClick={() => toast.dismiss(toastId)}>
                    Go to upgrade
                </button>
            )}
        </div>
    );

    const blockPageFunction = (message, freeUser) => {
        setIsBlockPageByPremium(true);
        setBlockMessageBody(
            <>
                <p style={{marginTop: "14px"}}>{message}</p>
                {freeUser && <p style={{marginBottom: "14px"}}>Do you want to upgrade ?</p>}
            </>
        );
        blockPageBtn.current.click();
    };

    const showToastr = (ToastComponent, type) => {
        const options = {autoClose: true, closeButton: true};
        if (type === "error") {
            toast.error(<ToastComponent/>, options);
        } else if (type === "warning") {
            toast.warning(<ToastComponent/>, options);
        } else if (type === "success") {
            toast.success(<ToastComponent/>, options);
        }
    };

    const loginRedirect = () => {
        const currentUrl = window.location.pathname + window.location.search;
        const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
        window.location.href = loginUrl;
    };

    const addCard = useCallback(() => {
        setListCard((prev) => [...prev, {id: prev.length + 1, front: "", back: "", img: ""}]);
    }, []);

    const removeCard = useCallback(
        (id) => {
            setListCard((prev) => prev.filter(card => card.id !== id));
        }
        , []
    );

    const uploadVideoToS3 = async (videoFile) => {
        try {
            const formData = new FormData();
            formData.append('files', videoFile);
            formData.append('sizes', videoFile.size);

            const response = await api.post('/v1/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                return response.data.videoUrl || response.data.videoUrls[0];
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Video upload error:', error);
            throw error;
        }
    };

    // Handle video upload (thêm sau handleImageRemove function)
    const handleVideoUpload = (event, id) => {
        const file = event.target.files[0];
        console.log("Video file:", file);
        if (file) {
            // Validate video file type
            const allowedVideoTypes = [
                'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
                'video/flv', 'video/webm', 'video/mkv', 'video/m4v'
            ];

            if (!allowedVideoTypes.includes(file.type)) {
                alert('Only video files are accepted (mp4, avi, mov, wmv, flv, webm, mkv, m4v)!');
                return;
            }

            // Validate file size (100MB)
            const maxSizeInBytes = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSizeInBytes) {
                alert('Video file exceeds allowed size (100MB). Please choose a smaller file!');
                return;
            }

            // Store video file in card data
            setListCard((prev) =>
                prev.map((card) => card.id === id ? {...card, video: file, videoPreview: URL.createObjectURL(file)} : card)
            );
        }
    };

    const handleVideoRemove = (id) => {
        setListCard((prev) =>
            prev.map((card) => {
                if (card.id === id && card.videoPreview) {
                    URL.revokeObjectURL(card.videoPreview);
                }
                return card.id === id ? {...card, video: "", videoPreview: ""} : card;
            })
        );
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
                    prev.map((card) => card.id === id ? {...card, img: event.target.result} : card)
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageRemove = (id) => {
        setListCard((prev) =>
            prev.map((card) => card.id === id ? {...card, img: ""} : card)
        );
    };

    const quillModules = {
        toolbar: false,
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

    const handlePrivacyChange = (event) => {
        setPrivacy(event.target.value === "true");
    };

    const handleTagsChange = (event) => {
        const newTags = event.target.value;
        const tagCount = newTags.split(',').filter(tag => tag.trim()).length;

        if (tagCount > 5) {
            toast.error("Maximum 5 tags allowed");
            return;
        }

        setTags(newTags);
    };

    const handleDeleteTag = (tagToDelete) => {
        const currentTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        const newTags = currentTags.filter(tag => tag !== tagToDelete);
        setTags(newTags.join(', '));
    };

    const handleParseChangedImportText = useCallback((text, useMotipQAChange, termSeparator, cardSeparator, hasImage) => {
        text = convertHtmlToText(text);
        let cards = [];
        if (useMotipQAChange) {
            cards = parseImportTextQToA(text);
        } else {
            cards = parseImportTextBaseOnString(text, termSeparator, cardSeparator, hasImage);
        }
        // console.log(text);
        if (isFreeUser) {
            if (cards.length >= maxFlashcards) {
                toast.error(`Cannot parse card because max cards of set are: ${maxFlashcards}.`);
                setListCard([]);
                return;
            }
            for (let card of cards) {
                if (card.img) {
                    toast.error("Cannot parse card because you are free user but insert image link.");
                    setListCard([]);
                    return;
                }
            }
        }
        let newCards = cards.map(card => ({
            id: card.id,
            front: textToHtml(card.front),
            back: textToHtml(card.back),
            img: card.img,
        }));
        // console.log(newCards);
        console.log("Parse done");
        setListCard(newCards);
    }, [isFreeUser, maxFlashcards]);

    const parseChangedImportTextDelay = useCallback(
        debounce((text, useMotipQAChange, termSeparator, cardSeparator, hasImage) => {
            handleParseChangedImportText(text, useMotipQAChange, termSeparator, cardSeparator, hasImage);
        }, 1200),
        [isFreeUser]
    );

    const uploadAllImagesToCloud = async (listCard) => {
        let newListCard = [];
        for (let card of listCard) {
            let downloadUrl = "";
            let videoUrl = "";
            if (card.img) {
                downloadUrl = await uploadToFirebase(
                    storage,
                    card.img,
                    "images",
                    null,
                    null
                );
            }
            // Upload video if exists
            if (card.video) {
                try {
                    setVideoUploadProgress(prev => ({...prev, [card.id]: 'uploading'}));
                    videoUrl = await uploadVideoToS3(card.video);
                    setVideoUploadProgress(prev => ({...prev, [card.id]: 'completed'}));
                } catch (error) {
                    setVideoUploadProgress(prev => ({...prev, [card.id]: 'failed'}));
                    toast.error(`Failed to upload video for card ${card.id}: ${error.message}`);
                    throw error; // Stop the process if video upload fails
                }
            }
            newListCard.push({
                question: convertHtmlToText(card.front),
                answer: convertHtmlToText(card.back),
                imageLink: downloadUrl,
                videoLink: videoUrl
            });
        }
        setVideoUploadProgress({});
        return newListCard;
    };

    const handleGenerateAI = async () => {
        if (!aiFiles.length) {
            toast.error("Please select at least one file to generate.");
            return;
        }
        try {
            const form = new FormData();
            aiFiles.forEach(f => form.append("files", f));
            form.append("numberOfFlashcards", aiNum);

            const res = await api.post("/v1/generate/flashcards", form, {
                headers: {"Content-Type": "multipart/form-data"}
            });
            const {success, message, flashcards} = res.data;

            if (success) {
                // map về cấu trúc của listCard
                const cards = flashcards.map((f, i) => ({
                    id: i + 1,
                    front: textToHtml(f.question),
                    back: textToHtml(f.answer),
                    img: ""
                }));
                setListCard(cards);
                toast.success(message);
            } else {
                toast.error(message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error generating flashcards: " + e.message);
        }
    };

    const checkListCardValid = (listCard) => {
        if (listCard.length < 2) {
            toast.error("You need at least two flashcards for created set.");
            throw new Error("Error card");
        }

        if (listCard.length > maxFlashcards) {
            toast.error(`You cannot add set flashcard because max cards of set are: ${maxFlashcards}`);
            throw new Error("Error card");
        }

        let messageError = "";
        let isOk = true;

        for (let card of listCard) {
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
            if (isOk && card.img) {
                if (isFreeUser) {
                    messageError = "You cannot add set flashcard because u maybe cheating...";
                    isOk = false;
                }
            }
            if (!isOk) {
                toast.error(messageError);
                cardDiv.style.border = "2px solid red";
                cardDiv.scrollIntoView({behavior: "smooth", block: "center"});
                throw new Error("Error card");
            }
            cardDiv.style.border = "none";
        }
    };

    const handleCreate = async (event) => {
        if (!title) {
            toast.error("Missing title");
            return;
        }

        if (isFreeUser && isAnonymous) {
            toast.error("Free user cannot set anonymous.");
            return;
        }

        const tagCount = tags.split(',').filter(tag => tag.trim()).length;
        if (tagCount > 5) {
            toast.error("Maximum 5 tags allowed");
            return;
        }

        try {
            checkListCardValid(listCard);
        } catch (err) {
            console.log(err);
            return;
        }

        event.preventDefault();
        document.body.style.opacity = "0.5";
        document.body.style.pointerEvents = "none";
        let failed = false;
        let setIdCreated = 0;

        try {
            const newListCards = await uploadAllImagesToCloud(listCard);
            const setData = {
                title,
                descriptionSet: description,
                isAnonymous,
                sharingMode: privacy,
                categoryId: selectedCategory,
                tagNames: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                hashPassword: password,
                flashcards: newListCards,
            };
            const res = await api.post("/v1/set/create-new-set", setData);
            console.log(res);
            if (res.status === 201) {
                toast.success("Added card successfully");
                setTimeout(() => {
                    navigate(`/user/set/detail/${res.data.data}`);
                }, 2000);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            document.body.style.opacity = "1";
            document.body.style.pointerEvents = "";
        }
    };

    const handleAIFilesChange = (e) => {
        let files = Array.from(e.target.files);
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/pjpeg',
            'image/x-png',
        ];
        const allowedExts = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'];
        let newFiles = [...aiFiles];
        let invalid = false;
        for (let file of files) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (
                !allowedExts.includes(ext) &&
                !allowedTypes.includes(file.type)
            ) {
                invalid = true;
                continue;
            }
            if (newFiles.length >= 5) break;
            if (newFiles.find(f => f.name === file.name && f.size === file.size)) continue;
            newFiles.push(file);
        }
        const totalSize = newFiles.reduce((acc, f) => acc + f.size, 0);
        if (totalSize > 50 * 1024 * 1024) {
            setAiFileError('Total file size must not exceed 50MB!');
            return;
        }
        if (invalid) {
            setAiFileError('Only pdf, docx, xlsx, png, jpg, jpeg files are allowed.');
            return;
        }
        if (newFiles.length > 5) {
            setAiFileError('You can only import up to 5 files.');
            return;
        }
        setAiFileError("");
        setAiFiles(newFiles);
    };

    return (
        <>
            <Box p={isSmallScreen ? 2 : 5} sx={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                margin: {xs: "0 20px", sm: "0 50px", md: "0 150px", lg: "0 250px"},
                position: "relative"
            }}>
                <h3><b>Create your own flashcard set</b></h3>

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
                    placeholder="Give a title (e.g: Software Testing MCQ - Fall 2024)"
                />

                <Box sx={{display: "flex", flexDirection: {xs: "column", md: "row"}, gap: "20px"}}>
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

                    <Box sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "white",
                        borderRadius: "15px",
                        padding: "15px",
                        gap: "10px"
                    }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {tags.split(',').map(tag => tag.trim()).filter(tag => tag).map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => handleDeleteTag(tag)}
                                    sx={{
                                        backgroundColor: '#e0e0fe',
                                        fontSize: '16px',
                                        height: '32px',
                                        '& .MuiChip-label': {
                                            padding: '0 8px',
                                        },
                                        '& .MuiChip-deleteIcon': {
                                            color: '#666',
                                            '&:hover': {
                                                color: '#333',
                                            },
                                        },
                                    }}
                                />
                            ))}
                        </Stack>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <input
                                type="text"
                                style={{
                                    border: "none",
                                    outline: "none",
                                    height: "40px",
                                    width: "100%",
                                    fontWeight: "bold",
                                    padding: "10px",
                                    fontSize: "15px",
                                    backgroundColor: "transparent"
                                }}
                                value={tags}
                                onChange={handleTagsChange}
                                placeholder="Tags (comma separated) ..."
                            />
                            <span style={{
                                fontSize: '14px',
                                color: '#666',
                                whiteSpace: 'nowrap'
                            }}>
                                {tags.split(',').filter(tag => tag.trim()).length}/5 tags
                            </span>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{display: "flex", flexDirection: {xs: "column", md: "row"}, gap: "20px"}}>
                    <Box width="100%" p={2}>
                        <p style={{fontSize: "16px", fontWeight: 400, marginBottom: 4}}>Import :</p>
                        <div style={{position: 'relative', width: '100%'}}>
                            <button
                                type="button"
                                onClick={() => setImportDropdownOpen(v => !v)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: importDropdownOpen ? '18px 18px 0 0' : '18px',
                                    height: '56px',
                                    width: '100%',
                                    fontWeight: 600,
                                    fontSize: 18,
                                    padding: '0 24px',
                                    boxShadow: '0 2px 12px rgba(80,80,160,0.06)',
                                    marginBottom: 2,
                                    cursor: 'pointer',
                                    transition: 'border-radius 0.2s',
                                }}
                            >
                                <span style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                    <ImportText/>
                                </span>
                                <span style={{flex: 1, textAlign: 'center', fontWeight: 600}}>Import flashcards</span>
                                <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center'}}>
                                    {importDropdownOpen ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 15L12 9L18 15" stroke="#222" strokeWidth="2.2"
                                                  strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 9L12 15L18 9" stroke="#222" strokeWidth="2.2"
                                                  strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </span>
                            </button>
                            {importDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '56px',
                                    left: 0,
                                    width: '100%',
                                    background: '#fff',
                                    borderRadius: '0 0 18px 18px',
                                    boxShadow: '0 8px 32px rgba(80,80,160,0.10)',
                                    border: '1px solid #e0e0e0',
                                    borderTop: 'none',
                                    zIndex: 20,
                                    overflow: 'hidden',
                                    marginTop: 2,
                                }}>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 17,
                                            padding: '18px 22px',
                                            color: '#222',
                                            cursor: 'pointer',
                                            background: '#fff',
                                            borderBottom: '1px solid #f0f0f0',
                                            transition: 'background 0.15s',
                                        }}
                                        onClick={() => {
                                            setImportFile(true);
                                            setShowAIGenerate(false);
                                            setImportDropdownOpen(false);
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#f5f6ff'}
                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        Parse with plain text
                                    </div>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 17,
                                            padding: '18px 22px',
                                            color: '#222',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            borderRadius: '0 0 18px 18px',
                                            background: '#fff',
                                        }}
                                        onClick={() => {
                                            setShowAIGenerate(true);
                                            setImportFile(false);
                                            setImportDropdownOpen(false);
                                        }}
                                    >
                                        <span style={{flex: 1}}>AI-generate with document</span>
                                        <span style={{
                                            marginLeft: 12,
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: '#ede7f6',
                                            borderRadius: '50%',
                                            width: 28,
                                            height: 28,
                                            justifyContent: 'center'
                                        }}>
                                            <LockIcon style={{color: '#7c4dff', fontSize: 20}}/>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Box>

                    <Box width="100%" p={2}>
                        <p style={{fontSize: "16px"}}>Category :</p>
                        <select style={{
                            width: "100%",
                            height: "40px",
                            borderRadius: "15px",
                            border: "none",
                            borderBottom: "4px solid #e0e0fe",
                            padding: "8px"
                        }}
                                onChange={handleCategoryChange}
                                defaultValue="1"
                        >
                            {
                                categories.map(category => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryName}
                                    </option>
                                ))
                            }
                        </select>
                        <div style={{marginTop: 16}}>
                            <p style={{fontSize: "16px"}}>Access password (optional):</p>
                            <div style={{
                                background: '#f7f7fb',
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 16px',
                                height: 40,
                                width: '100%',
                                border: 'none',
                            }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="************"
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        fontSize: 16,
                                        width: '100%',
                                        height: 38,
                                    }}
                                />
                                <span
                                    style={{cursor: 'pointer', color: showPassword ? '#2d4bff' : '#888', marginLeft: 8}}
                                    onClick={() => setShowPassword(v => !v)}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="#2d4bff"
                                                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="12" r="3" stroke="#2d4bff" strokeWidth="2"
                                                    strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="#888"
                                                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="12" r="3" stroke="#888" strokeWidth="2"
                                                    strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </span>
                            </div>
                        </div>
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
                                            isFreeUser,
                                            () => setIsAnonymous(isAnonymous => !isAnonymous),
                                            PremiumUpgradeMessage
                                        )}>
                                    Anonymous
                                    {
                                        isFreeUser && <LockIcon/>
                                    }
                                </button>
                            </div>
                        </Box>
                    </Box>
                </Box>

                {importFile && (
                    <ImportTextComp
                        containerStyles={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            cursor: "pointer",
                        }}
                        textInput={{
                            className: "ans-custom-quill",
                            theme: "snow",
                            modules: quillModules,
                            style: {
                                border: "none",
                                outline: "none",
                                height: "300px",
                                width: "100%",
                                overflowY: "auto",
                                backgroundColor: "white",
                                borderRadius: "15px",
                            },
                            placeholder: "Enter your document...",
                        }}
                        onCancel={() => {
                            setListCard([]);
                            setImportFile(false);
                        }}
                        onSave={() => {
                            setImportFile(false);
                        }}
                        onSaveButtonStyles={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#ffffff",
                            color: "#2c3e50",
                            fontSize: "18px",
                            fontWeight: "bold",
                            borderRadius: "30px",
                            height: "60px",
                            width: "100%",
                            border: "2px solid #dfe4ea",
                            cursor: "pointer",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                        }}
                        onTextChange={parseChangedImportTextDelay}
                    />
                )}

                {showAIGenerate && (
                    <Box sx={{
                        width: '100%',


                        bgcolor: '#f7f7fb',
                        borderRadius: {xs: 2, sm: 4},
                        boxShadow: '0 4px 24px rgba(80,80,160,0.08)',
                        p: {xs: 2, sm: 4},
                        mt: 4,
                    }}>
                        <Box sx={{fontWeight: 500, fontSize: 16, mb: 1}}>
                            Import with document <span style={{color: '#888'}}>(support .pdf, .docx, .xlsx, .png, .jpg, .jpeg):</span>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                            flexDirection: {xs: 'column', sm: 'row'},
                            width: '100%'
                        }}>
                            <label htmlFor="ai-file-upload" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: '#fff',
                                border: 'none',
                                borderRadius: 16,
                                padding: '12px 28px',
                                fontWeight: 600,
                                fontSize: 18,
                                boxShadow: '0 1px 4px rgba(80,80,160,0.04)',
                                width: '100%',
                                maxWidth: 180,
                                justifyContent: 'center',
                                opacity: aiFiles.length >= 5 ? 0.5 : 1,
                                cursor: aiFiles.length >= 5 ? 'not-allowed' : 'pointer',
                            }}>
                                <span style={{fontSize: 22}}>📄</span> Import
                                <input id="ai-file-upload" type="file" accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                                       multiple style={{display: 'none'}} onChange={handleAIFilesChange}
                                       disabled={aiFiles.length >= 5}/>
                            </label>
                            {aiFiles.length > 0 && (
                                <Box sx={{
                                    width: '100%',
                                    mt: 2,
                                    mb: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                }}>
                                    {aiFiles.map((file, idx) => (
                                        <Box key={file.name + file.size} sx={{
                                            bgcolor: '#ede7f6',
                                            color: '#222',
                                            borderRadius: 3,
                                            px: 2.5,
                                            py: 1.2,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            width: '100%',
                                            wordBreak: 'break-all',
                                            whiteSpace: 'normal',
                                            boxSizing: 'border-box'
                                        }} title={file.name}>
                                            <span style={{color: '#888', fontSize: 18, marginRight: 6}}>📄</span>
                                            <span style={{flex: 1}}>{file.name}</span>
                                            <span style={{
                                                color: '#888',
                                                fontSize: 15,
                                                marginLeft: 8
                                            }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            <span style={{
                                                marginLeft: 8,
                                                cursor: 'pointer',
                                                color: '#a259c6',
                                                fontWeight: 700
                                            }} onClick={() => {
                                                const newArr = aiFiles.filter((_, i) => i !== idx);
                                                setAiFiles(newArr);
                                                setAiFileError("");
                                            }}>×</span>
                                        </Box>
                                    ))}
                                    {(aiFiles.length >= 5) && (
                                        <Box sx={{color: 'red', fontWeight: 500, fontSize: 15, mt: 1, mb: 1, px: 1}}>
                                            You can only import up to 5 files.
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {aiFileError && aiFiles.length < 5 && (
                                <Box sx={{color: 'red', fontWeight: 500, fontSize: 15, mt: 1, mb: 1, px: 1}}>
                                    {aiFileError}
                                </Box>
                            )}
                        </Box>
                        <Box sx={{fontWeight: 500, fontSize: 16, mb: 1}}>Number of flashcards</Box>
                        <input type="number" min={2} max={200} value={aiNum} onChange={e => {
                            let val = Number(e.target.value);
                            if (!val || val < 2) {
                                setAiNum(2);
                                setAiNumError('Number of flashcards must be between 2 and 200.');
                            } else if (val > 200) {
                                setAiNum(200);
                                setAiNumError('Number of flashcards must be between 2 and 200.');
                            } else {
                                setAiNum(val);
                                setAiNumError("");
                            }
                        }} style={{
                            width: '100%',
                            borderRadius: 12,
                            padding: '14px 18px',
                            fontSize: 18,
                            border: '1px solid #e0e0e0',
                            background: '#fff',
                            marginBottom: 18
                        }}/>
                        {aiNumError && (
                            <Box sx={{color: 'red', fontWeight: 500, fontSize: 15, mb: 1, px: 1}}>{aiNumError}</Box>
                        )}

                        <Button
                            fullWidth
                            sx={{
                                background: 'linear-gradient(90deg,#b983ff,#a259c6)',
                                color: '#fff',
                                borderRadius: 2,
                                fontWeight: 700,
                                fontSize: 20,
                                py: 2.2,
                                mt: 1,
                                boxShadow: '0 2px 8px rgba(160,80,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1.5,
                                '&:hover': {background: 'linear-gradient(90deg,#a259c6,#b983ff)'},
                            }}
                            onClick={() => {
                                if (aiFiles.length === 0 || aiFileError || aiNum < 2 || aiNum > 200) {
                                    setAiNumError('Not enough valid files or number of flashcards to generate.');
                                    return;
                                }
                                setAiNumError("");
                                console.log('Generate', aiFiles, aiNum);
                                handleGenerateAI().then().catch();
                            }}
                        >
                            <span style={{fontSize: 22}}>✨</span> Generate
                        </Button>
                    </Box>
                )}

                <span
                    style={{width: "100%", height: "3px", backgroundColor: "#e2e2fe", borderRadius: "15px"}}></span>

                <h3><b>Add your terms</b></h3>

                {listCard.map((card, index) => (
                    <Box key={card.id} p={1} bgcolor="#e0e0fe" id={`cardData-${card.id}`}
                         tabIndex={-1}
                         sx={{
                             display: "flex",
                             flexDirection: "column",
                             width: "100%",
                             borderRadius: "15px",
                             gap: 2,
                         }}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: "10px"
                        }}>
                            <span>{index + 1}</span>
                            <div
                                className={`!flex !gap-2 !items-center !justify-center`}
                            >
                                <div style={{
                                    display: "flex",
                                    gap: "10px",
                                    width: "320px",
                                    height: "100%",
                                    alignItems: "center",
                                    justifyContent: "end",
                                }}>

                                    <span
                                        className={`!h-full hover:!bg-blue-400 hover:!cursor-pointer !py-2`}
                                        onClick={() => {
                                            if (card.video) {
                                                setVideoPreviewData(card.videoPreview);
                                                setVideoPreviewModal(true);
                                            }
                                        }}
                                    >
                                        {card.video?.name}
                                    </span>
                                    <input
                                        type="file"
                                        id={`videoUpload-${card.id}`}
                                        accept="video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm,video/mkv,video/m4v"
                                        onClick={(e) => handlePremiumFilter(e,
                                            isFreeUser,
                                            () => {
                                            },
                                            PremiumUpgradeMessage
                                        )}
                                        onChange={(e) => {
                                            handleVideoUpload(e, card.id);
                                            const inp = document.getElementById(`videoUpload-${card.id}`);
                                            if (inp) inp.value = '';
                                        }}
                                        style={{display: "none"}}
                                    />
                                    <VideoToggleButton
                                        hasVideo={card.video}
                                        onRemove={(e) => handlePremiumFilter(e,
                                            isFreeUser,
                                            () => handleVideoRemove(card.id),
                                            PremiumUpgradeMessage
                                        )}
                                        onUpload={() => document.getElementById(`videoUpload-${card.id}`).click()}
                                        childComponent={!isFreeUser ? <></> : <LockIcon/>}
                                    />

                                    {/* Video Upload Progress */}
                                    {videoUploadProgress[card.id] && (
                                        <div style={{
                                            fontSize: "11px",
                                            color: videoUploadProgress[card.id] === 'uploading' ? '#ff9800' :
                                                videoUploadProgress[card.id] === 'completed' ? '#4caf50' : '#f44336',
                                            textAlign: "center",
                                            marginTop: "5px"
                                        }}>
                                            {videoUploadProgress[card.id] === 'uploading' && '⏳ Uploading...'}
                                            {videoUploadProgress[card.id] === 'completed' && '✅ Uploaded'}
                                            {videoUploadProgress[card.id] === 'failed' && '❌ Failed'}
                                        </div>
                                    )}
                                </div>
                                <Remove onClick={() => removeCard(card.id)}/>
                            </div>
                        </Box>

                        <Box sx={{
                            display: "flex",
                            flexDirection: {xs: "column", md: "row"},
                            gap: 2,
                            maxHeight: "500px",
                            overflowY: "auto"
                        }}>
                            <ReactQuill
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
                                    borderRadius: "15px",
                                }}
                                placeholder="Enter your question..."
                                onChange={(value) => handleWriteDataCard("front", value, card.id)}
                            />

                            <ReactQuill
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
                                height: "100%",
                                justifyContent: "center",
                                alignItems: "center",
                            }}>
                                <ImagePreview img={card.img} id={card.id}/>
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
                                    onChange={(e) => {
                                        handleImageUpload(e, card.id);
                                        const inp = document.getElementById(`imageUpload-${card.id}`);
                                        if (inp) inp.value = '';
                                    }}
                                    style={{display: "none"}}
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
                            </div>


                        </Box>
                    </Box>
                ))}

                {
                    !importFile &&
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
                }

                <div style={{
                    position: "absolute",
                    zIndex: "5000",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    display: isBlockPageByPremium ? "block" : "none",
                }}>
                    <button ref={blockPageBtn} style={{
                        width: "100%",
                        height: "100%",
                        background: "transparent",
                        border: "none"
                    }} onClick={(e) => handlePremiumFilter(
                        e,
                        true,
                        () => {
                        },
                        BlockMessage
                    )}>
                    </button>
                </div>
            </Box>

            {!isBlockPageByPremium && !importFile &&
                <button
                    style={{
                        position: "fixed",
                        bottom: "30px",
                        right: "50px",
                        border: "none",
                        backgroundColor: "#ededff",
                    }}
                    onClick={handleCreate}
                >
                    <CreateCardButton/>
                </button>
            }

            <VideoPreview
                videoPreview={videoPreviewData}
                showVideoPreview={videoPreviewModal}
                setShowVideoPreview={setVideoPreviewModal}
            />
        </>
    );
}

export default AddNewSet;