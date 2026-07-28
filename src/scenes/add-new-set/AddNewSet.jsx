import {Box, Button, CircularProgress, Typography, useMediaQuery, useTheme} from "@mui/material";
import React, {useCallback, useEffect, useRef, useState} from "react";
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
    MaxVideosMessage,
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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {LuCircleX} from "react-icons/lu";

function AddNewSet() {
    const navigate = useNavigate();
    const [listCard, setListCard] = useState([]);
    const [importFile, setImportFile] = useState(false);
    const [showAIGenerate, setShowAIGenerate] = useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [benefits, setBenefits] = useState({});
    const [maxFlashcardsPerSet, setMaxFlashcardsPerSet] = useState(0);
    const [isNormalSubscription, setIsNormalSubscription] = useState(true);
    const [blockAddPage, setBlockAddPage] = useState(false);
    const [blockMessageBody, setBlockMessageBody] = useState(<></>);

    const [videoUploadProgress, setVideoUploadProgress] = useState({});
    const [videoPreviewModal, setVideoPreviewModal] = useState(false);
    const [videoPreviewData, setVideoPreviewData] = useState(null);

    const countVideos = () => {
        return listCard.filter(card => card.video || card.videoUrl || card.videoLink).length;
    };

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [privacy, setPrivacy] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [processingUploadingMedia, setProcessingUploadingMedia] = useState(false);
    const [processingAddingSet, setProcessingAddingSet] = useState(false);
    const [processingCommitVideos, setProcessingCommitVideos] = useState(false);

    const processingHandleAddingSet = useCallback(() => {
        return processingUploadingMedia || processingAddingSet || processingCommitVideos;
    }, [processingUploadingMedia, processingAddingSet, processingCommitVideos]);

    const upgradeModal = useRef(null);

    const blockPageBtn = useRef(null);

    const [categories, setCategories] = useState([
        {categoryId: 1, categoryName: 'Choose a category'},
    ]);

    const [importDropdownOpen, setImportDropdownOpen] = useState(false);

    const [aiFiles, setAiFiles] = useState([]);
    const [aiFileError, setAiFileError] = useState("");
    const [aiNum, setAiNum] = useState(2);
    const [aiNumError, setAiNumError] = useState("");

    const [mcqNumOptionsError, setMcqNumOptionsError] = useState('');

    const minMcqNumOptions = 3;
    const maxMcqNumOptions = 5;

    const defaultTypeOfGenQuiz = "mcq";
    const defaultTypeOfEssayQuiz = "qa";
    const defaultMcqNumOptions = 4;

    const [typeOfGenQuiz, setTypeOfGenQuiz] = useState(defaultTypeOfGenQuiz); // type: mcq (Multiple choice) (default), tf (True/False), es (Essay)
    const [typeOfEssayQuiz, setTypeOfEssayQuiz] = useState(defaultTypeOfEssayQuiz); // type: qa (Question - Answer: Default), td (Term - Definition)
    const [mcqNumOptions, setMcqNumOptions] = useState(defaultMcqNumOptions); // default: 4, from 3 to 5

    const minAiGenCards = 2;
    const maxAiGenCards = 150;

    const [genFromAIStatus, setGenFromAIStatus] = useState(false);

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const [
                    resCategories,
                    resRole,
                    resBenefit,
                    // resNumberSet,
                    // resMaxSetCreatedToday,
                    resAnalysis,
                ] = await Promise.all([
                    api.get("/v1/category/list"),
                    api.get("/v1/auth/user-info"),
                    api.get("/v1/category-subscription/my-subscription"),
                    // api.get("/v1/set/count-my-set"),
                    // api.get("/v1/set/count-set-in-current-date"),
                    api.get("/v1/set/analysis/current-user")
                ]);

                setCategories(resCategories.data);
                let freeUser = canAccess(resRole.data.role, [Roles.FREE_USER]);
                // setIsNormalSubscription(freeUser);
                setIsNormalSubscription(resBenefit.data.normalSubscription);

                setBenefits(resBenefit.data);
                setMaxFlashcardsPerSet(resBenefit.data.maxFlashcardsPerSet ?? 0);

                if (resAnalysis.data.setCardCreated >= resBenefit.data.maxSetsFlashcards) {
                    blockPageFunction(
                        `You cannot create more sets because the maximum number of sets is: ${resBenefit.data.maxSetsFlashcards}`
                    );
                    return;
                }
                if (resAnalysis.data.setCardCreatedPerDay >= resBenefit.data.maxSetsPerDay) {
                    blockPageFunction(
                        `You cannot create more sets because the maximum number of sets created per day is: ${resBenefit.data.maxSetsPerDay}`
                    );
                }
            } catch (err) {
                // if (err.response && err.response.status === 401) {
                //     loginRedirect();
                // }
                console.error(err);
                toast.error("An error occurred, please try again");
            }
        };

        checkUserStatus().then().catch();
    }, []);

    useEffect(() => {
        setMcqNumOptionsError('');
        if (typeOfGenQuiz === 'mcq') {
            setMcqNumOptions(4);
        } else if (typeOfGenQuiz === 'es') {
            setTypeOfEssayQuiz('qa');
        }
    }, [typeOfGenQuiz]);

    const handlePremiumFilter = usePremiumFilter(isNormalSubscription);

    const BlockMessage = ({toastId}) => (
        <div>
            <h2>Sorry</h2>
            {blockMessageBody}
            <button id="cancelBtn" onClick={() => toast.dismiss(toastId)}>
                Cancel
            </button>
            {isNormalSubscription && (
                <button id="saveButtonBtn" onClick={() => toast.dismiss(toastId)}>
                    Go to upgrade
                </button>
            )}
        </div>
    );

    const blockPageFunction = useCallback((message) => {
        setBlockAddPage(true);
        setBlockMessageBody(
            <>
                <p style={{marginTop: "14px"}}>{message}</p>
                {isNormalSubscription && <p style={{marginBottom: "14px"}}>Do you want to upgrade ?</p>}
            </>
        );
        blockPageBtn.current.click();
    }, [isNormalSubscription]);

    // const blockPageFunction = (message, normalSubscription) => {
    //     setBlockAddPage(true);
    //     setBlockMessageBody(
    //         <>
    //             <p style={{marginTop: "14px"}}>{message}</p>
    //             {normalSubscription && <p style={{marginBottom: "14px"}}>Do you want to upgrade ?</p>}
    //         </>
    //     );
    //     blockPageBtn.current.click();
    // };

    const addCard = useCallback(() => {
        setListCard((prev) => [...prev, {id: performance.now(), front: "", back: "", img: ""}]);
    }, [listCard]);

    const removeCard = useCallback(
        (id) => {
            setListCard((prev) => prev.filter(card => card.id !== id));
        }
        , [listCard]
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

    const uploadVideosToS3 = async (videoEntries) => {
        // videoEntries: mảng các object { index, id, file }
        //   - index: vị trí của card trong listCard gốc
        //   - id: dùng để update progress (setVideoUploadProgress)
        //   - file: File object cần upload

        const BATCH_SIZE = 10;
        // const videoUrls = new Array(videoEntries.length).fill(""); // sẽ chứa kết quả cuối
        const videoUrls = new Array(videoEntries.length).fill({}); // sẽ chứa kết quả cuối

        // 1. Đánh dấu tất cả các video cards đang 'uploading'
        videoEntries.forEach(({id}) => {
            setVideoUploadProgress((prev) => ({...prev, [id]: "uploading"}));
        });

        // 2. Chia thành các batch
        const batches = [];
        for (let i = 0; i < videoEntries.length; i += BATCH_SIZE) {
            batches.push(videoEntries.slice(i, i + BATCH_SIZE));
        }

        // 3. Tạo các Promise cho từng batch
        const batchPromises = batches.map((batch) => (async () => {
            // Chuẩn bị FormData cho batch này
            const formData = new FormData();
            batch.forEach(({file}) => {
                formData.append("files", file);
                formData.append("sizes", file.size);
            });

            // Gọi API upload batch
            const response = await api.post(
                "/v1/videos/upload",
                formData,
                {headers: {"Content-Type": "multipart/form-data"}}
            );

            if (response.data.success) {
                // Server trả về videoUrls đúng thứ tự tương ứng với batch
                // const returnedUrls = response.data.videoUrls;
                // returnedUrls.forEach((url, idx) => {
                //     const {index} = batch[idx];
                //     // videoUrls[index] = url;
                //     videoUrls[index] = {
                //         "videoUrl": url,
                //     };
                // });
                // const keyUrls = response.data.videoKeys;
                // keyUrls.forEach((key, idx) => {
                //     const {index} = batch[idx];
                //     videoUrls[index] = {
                //         ...videoUrls[index],
                //         "videoKey": key,
                //     }
                // });

                const returnedUrls = response.data.videoUrls;
                const keyUrls = response.data.videoKeys;
                const combined = returnedUrls.map((url, idx) => ({
                    videoUrl: url,
                    videoKey: keyUrls[idx]
                }));

                combined.forEach((item, idx) => {
                    const {index} = batch[idx];
                    videoUrls[index] = item;
                });
            } else {
                throw new Error(response.data.message || "Upload failed for this batch");
            }
        })());

        // 4. Chạy song song các batchPromises và xử lý success/fail
        try {
            await Promise.all(batchPromises);
            // Nếu thành công tất cả, đánh dấu completed
            videoEntries.forEach(({id}) => {
                setVideoUploadProgress((prev) => ({...prev, [id]: "completed"}));
            });
        } catch (err) {
            // Nếu có batch bất kỳ fail, đánh dấu những index chưa có URL là 'failed'
            videoEntries.forEach(({index, id}) => {
                if (!videoUrls[index]) {
                    setVideoUploadProgress((prev) => ({...prev, [id]: "failed"}));
                    toast.error(`Failed to upload video for card ${id}: ${err.message}`);
                }
            });
            throw err; // Ném tiếp để upstream biết có lỗi
        }

        return videoUrls;
    };

    // Handle video upload (thêm sau handleImageRemove function)
    const handleVideoUpload = (event, id) => {
        const file = event.target.files[0];
        // console.log("Video file:", file);
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

            setListCard((prev) =>
                prev.map((card) => card.id === id ? {
                    ...card,
                    video: file,
                    videoPreview: URL.createObjectURL(file)
                } : card)
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
        // if (isNormalSubscription) {
        if (cards.length >= maxFlashcardsPerSet) {
            toast.error(`Cannot parse card because max cards of set are: ${maxFlashcardsPerSet}.`);
            setListCard([]);
            return;
        }
        for (let card of cards) {
            if (card.img && benefits.canAddImage !== true) {
                toast.error("Cannot parse card because you don't have permission to insert image link.");
                setListCard([]);
                return;
            }
        }
        // }
        let newCards = cards.map(card => ({
            id: card.id,
            front: textToHtml(card.front),
            back: textToHtml(card.back),
            img: card.img,
        }));
        // console.log(newCards);
        console.log("Parse done");
        setListCard(newCards);
    }, [maxFlashcardsPerSet]);

    const parseChangedImportTextDelay = useCallback(
        debounce((text, useMotipQAChange, termSeparator, cardSeparator, hasImage) => {
            handleParseChangedImportText(text, useMotipQAChange, termSeparator, cardSeparator, hasImage);
        }, 1200),
        [maxFlashcardsPerSet]
    );

    const uploadAllMediasToCloud_temp = async (listCard) => {
        // 1. Upload ảnh song song (Firebase)
        const imagePromises = listCard.map((card) => {
            if (card.img) {
                return uploadToFirebase(storage, card.img, "images", null, null)
                    .then((url) => {
                        return url;
                    }).catch(err => {
                        console.error("Error uploading image:", err);
                        toast.error(`Failed to upload image for card ${card.id}: ${err.message}`);
                        return ""; // Trả về chuỗi rỗng nếu upload thất bại
                    });
            }
            return Promise.resolve("");
        });

        // 2. Tạo danh sách videoEntries (chỉ các card có card.video)
        const videoEntries = listCard
            .map((card, index) => {
                if (card.video) {
                    return {
                        index,   // dùng để gán vị trí sau
                        id: card.id, // để cập nhật progress
                        file: card.video
                    };
                }
                return null;
            })
            .filter((e) => e !== null);

        // 3. Nếu có ít nhất 1 video, gọi uploadVideosToS3; ngược lại khởi mảng rỗng
        // let videoUrls = new Array(listCard.length).fill({});
        let videoUrls = new Array(listCard.length).fill({});
        if (videoEntries.length > 0) {
            videoUrls = await uploadVideosToS3(videoEntries);
            // videoUrls = '';
        }

        // 4. Chờ ảnh upload xong
        const imageUrls = await Promise.all(imagePromises);

        console.log("Video URLs:", videoUrls);

        const newListCard = listCard.map((card, idx) => ({
            question: convertHtmlToText(card.front),
            answer: convertHtmlToText(card.back),
            imageLink: imageUrls[idx] || "",
            // videoLink: videoUrls[idx] || ""
            videoLink: videoUrls[idx]?.videoUrl || "",
            videoKey: videoUrls[idx]?.videoKey || "",
        }));

        // 6. Reset progress
        setVideoUploadProgress({});

        return newListCard;
    };

    const uploadAllMediasToCloud = async (listCard) => {
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
                // videoLink: videoUrl
                videoLink: '',
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
            form.append("setTitle", title);
            form.append("setDescription", description);
            form.append("typeOfQuestion", typeOfGenQuiz);
            form.append("typeOfEssayQuestion", typeOfEssayQuiz);
            form.append("numberOfOptions", mcqNumOptions);

            // const res = await api.post("/v1/generate/flashcards", form, {
            //     headers: {"Content-Type": "multipart/form-data"}
            // });
            const res = await api.post("/v1/ai/generate/flashcards", form, {
                headers: {"Content-Type": "multipart/form-data"}
            });
            const {success, message, flashcards} = res.data;

            if (success) {
                // map về cấu trúc của listCard
                const cards = flashcards.map((f, i) => ({
                    id: (i + 1) + "-AI_GEN-" + performance.now(),
                    front: textToHtml(f.question),
                    back: textToHtml(f.answer),
                    img: ""
                }));
                // setListCard(cards);
                setListCard((prev) => [...prev, ...cards]);
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

        if (listCard.length > maxFlashcardsPerSet) {
            toast.error(`You cannot add set flashcard because max cards of set are: ${maxFlashcardsPerSet}`);
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
            if (isOk && convertHtmlToText(card.front).length > 800 ||
                convertHtmlToText(card.back).length > 800) {
                messageError = "Length of question or answer must be less than 800.";
                isOk = false;
            }
            if (isOk && card.img && benefits.canAddImage !== true) {
                messageError = "You cannot add set flashcard because you can't have permission to add media.";
                isOk = false;
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

        if (benefits.isSetAnonymous !== true && isAnonymous) {
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
        // document.body.style.opacity = "0.5";
        document.body.style.pointerEvents = "none";
        const buttonCreate = document.getElementById("id-button-create");
        const oldStyleDisplay = buttonCreate.style.display;
        buttonCreate.style.display = "none";
        let failed = false;
        let setIdCreated = 0;

        try {
            setProcessingUploadingMedia(true);
            const newListCards = await uploadAllMediasToCloud_temp(listCard);
            setProcessingUploadingMedia(false);
            setProcessingAddingSet(true);
            const setData = {
                title,
                descriptionSet: description,
                isAnonymous,
                sharingMode: privacy,
                categoryId: selectedCategory,
                tagNames: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                password: password,
                flashcards: newListCards,
            };
            const res = await api.post("/v1/set/create-new-set", setData);
            console.log(res);
            if (res.status === 201) {
                setProcessingAddingSet(false);
                toast.success("Added card successfully", {
                    style: {
                        position: "fixed",
                        zIndex: 9999,
                        right: 0,
                    },
                    position: "top-right",
                });
                try {
                    setProcessingCommitVideos(true);
                    const keyVideos = res.data.keyVideos;
                    if (keyVideos && keyVideos.length > 0) {
                        console.log("Key videos:", keyVideos);
                        await api.put("/v1/videos/commit-videos", keyVideos);
                    }
                } catch (err) {
                    console.error("Error committing videos:", err);
                    toast.error("Error during commit some videos, may not be saved and will automatically " +
                        "delete after 5 minutes.", {
                        style: {
                            position: "fixed",
                            zIndex: 9999,
                            right: 0,
                        },
                        position: "top-right",
                    });
                } finally {
                    setProcessingCommitVideos(false);
                    setTimeout(() => {
                        navigate(`/user/set/detail/${res.data.setId}`);
                    }, 2000);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            // document.body.style.opacity = "1";
            buttonCreate.style.display = oldStyleDisplay;
            document.body.style.pointerEvents = "";
            setProcessingUploadingMedia(false);
            setProcessingAddingSet(false);
            setProcessingCommitVideos(false);
        }
    };

    const handleAIFilesChange = (e) => {
        let files = Array.from(e.target.files);
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'application/msword',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'application/vnd.ms-excel',
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/pjpeg',
            'image/x-png',
        ];
        const allowedExts = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'];
        let newFiles = [...aiFiles]; // files hiện tại trong state
        let invalid = false;

        // Lọc trùng trong danh sách files mới (trong cùng lần chọn): dùng Set theo reference
        const seenFiles = new Set(); // so sánh object reference
        const uniqueNewFiles = files.filter(file => {
            if (seenFiles.has(file)) return false;
            seenFiles.add(file);
            return true;
        });

        for (let file of uniqueNewFiles) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (
                !allowedExts.includes(ext) &&
                !allowedTypes.includes(file.type)
            ) {
                invalid = true;
                continue;
            }
            if (newFiles.length >= 5) break;

            // ❌ Lọc trùng với aiFiles hiện tại: vẫn dùng name + size (vì reference cũ đã mất sau unmount/reset)
            // Không thể dùng === vì file mới là object mới, kể cả cùng file trên disk
            const isDuplicate = newFiles.some(f => f.name === file.name && f.size === file.size);
            if (isDuplicate) continue;

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

        // ✅ Reset input để có thể chọn lại file đã xóa hoặc trùng sau này
        e.target.value = '';
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
                                        onClick={
                                            (e) => handlePremiumFilter(
                                                e,
                                                benefits.isUploadDocument !== true,
                                                () => {
                                                    setShowAIGenerate(true);
                                                    setImportFile(false);
                                                    setImportDropdownOpen(false);
                                                },
                                                PremiumUpgradeMessage
                                            )}
                                    >
                                        <span style={{flex: 1}}>AI-generate with document</span>
                                        {
                                            benefits.isUploadDocument !== true && <>
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
                                            </>
                                        }
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
                                    autoComplete="off"
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
                                            benefits.isSetAnonymous !== true,
                                            () => setIsAnonymous(isAnonymous => !isAnonymous),
                                            PremiumUpgradeMessage
                                        )}>
                                    Anonymous
                                    {
                                        benefits.isSetAnonymous !== true && <LockIcon/>
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
                            // setListCard([]);
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
                        position: 'relative'
                    }}>
                        <LuCircleX
                            className="!absolute !top-[5%] !right-[5%] !cursor-pointer !text-gray-600 hover:!text-gray-400 active:!text-black"
                            size={40}
                            onClick={() => {
                                setShowAIGenerate(false);
                                setImportFile(false);
                            }}
                        />
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
                                        <Box
                                            key={file.name + file.size}
                                            sx={{
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
                        <Box sx={{fontWeight: 500, fontSize: 16, mb: 1}}>Number of flashcards
                            (Min: {minAiGenCards} cards -- Max: {maxAiGenCards} cards)</Box>
                        <input type="number" min={minAiGenCards}
                               max={maxAiGenCards}
                               value={aiNum}
                               onChange={(e) => setAiNum(e.target.value)}
                               onBlur={e => {
                                   let val = Number(e.target.value);
                                   let warningText = `Number of generate flashcards by AI must be between ${minAiGenCards} and ${maxAiGenCards}`;
                                   if (!val || val < minAiGenCards || val > maxAiGenCards) {
                                       setAiNum(Math.max(minAiGenCards, Math.min(maxAiGenCards, val)));
                                       setAiNumError(warningText);
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
                            marginBottom: 12,
                        }}/>
                        {aiNumError && (
                            <Box sx={{color: 'red', fontWeight: 500, fontSize: 15, mb: 1, px: 1}}>{aiNumError}</Box>
                        )}

                        <Box
                            className={"w-full flex flex-col lg:flex-row justify-between items-center mb-3 mt-0 gap-3 lg:gap-8"}
                        >
                            <Box className="flex-1 flex flex-col w-full lg:w-auto">
                                <Typography variant="body1" className="!mb-1 !font-medium !text-base">
                                    Type of question
                                </Typography>
                                <Select
                                    value={typeOfGenQuiz}
                                    onChange={(e) => setTypeOfGenQuiz(e.target.value)}
                                    className={"w-full h-[60px] !bg-white !rounded-[15px] !border-0 !border-b-4 !border-solid !border-b-violet-300 !p-2"}
                                >
                                    <MenuItem value="mcq">Multiple Choice</MenuItem>
                                    <MenuItem value="tf">True/False</MenuItem>
                                    <MenuItem value="es">Essay</MenuItem>
                                </Select>
                            </Box>

                            {
                                typeOfGenQuiz === "mcq" && (
                                    <>
                                        <Box className="flex-1 flex flex-col w-full lg:w-auto">
                                            <Typography variant="body1" className="!mb-1 !font-medium !text-base">
                                                Number of options (Min: {minMcqNumOptions} options --
                                                Max: {maxMcqNumOptions} options)
                                            </Typography>
                                            <TextField
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '1.5rem', // tương đương rounded-3xl
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderRadius: '1.5rem',
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderRadius: '1.5rem',
                                                            borderWidth: '2px', // tùy chọn: tăng độ dày viền khi focus
                                                        },
                                                    },
                                                }}
                                                inputProps={{
                                                    style: {
                                                        fontSize: 18,
                                                        padding: "1rem 1rem"
                                                    },
                                                }}
                                                className="!bg-white !rounded-3xl"
                                                value={mcqNumOptions}
                                                type="number"
                                                onChange={(e) => setMcqNumOptions(e.target.value)}
                                                onBlur={(e) => {
                                                    let val = Number(e.target.value);
                                                    let warningText = `Number of options in multiple choice must be between ${minMcqNumOptions} and ${maxMcqNumOptions}`;
                                                    if (!val || val < minMcqNumOptions || val > maxMcqNumOptions) {
                                                        setMcqNumOptions(Math.max(minMcqNumOptions, Math.min(maxMcqNumOptions, val)));
                                                        setMcqNumOptionsError(warningText);
                                                    } else {
                                                        setMcqNumOptions(val);
                                                        setMcqNumOptionsError("");
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </>
                                )
                            }

                            {
                                typeOfGenQuiz === "es" && (
                                    <>
                                        <Box className="flex-1 flex flex-col w-full lg:w-auto">
                                            <Typography variant="body1" className="!mb-1 !font-medium !text-base">
                                                Type of essay question
                                            </Typography>
                                            <Select
                                                value={typeOfEssayQuiz}
                                                onChange={(e) => setTypeOfEssayQuiz(e.target.value)}
                                                className={"w-full h-[60px] !bg-white !rounded-[15px] !border-0 !border-b-4 !border-solid !border-b-violet-300 !p-2"}
                                            >
                                                <MenuItem value="qa">Question - Answer</MenuItem>
                                                <MenuItem value="td">Term - Definition</MenuItem>
                                            </Select>
                                        </Box>
                                    </>
                                )
                            }
                        </Box>

                        {
                            mcqNumOptionsError && (
                                <Box sx={{
                                    color: 'red',
                                    fontWeight: 500,
                                    fontSize: 15,
                                    mb: 1,
                                    px: 1,
                                }}>{mcqNumOptionsError}</Box>
                            )
                        }

                        {
                            !genFromAIStatus && <>
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
                                        setGenFromAIStatus(true);
                                        handleGenerateAI().then().catch()
                                            .finally(() => setGenFromAIStatus(false));
                                    }}
                                >
                                    <span style={{fontSize: 22}}>✨</span> Generate
                                </Button>
                            </>
                        }
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
                                            countVideos() >= benefits.numberVideosCanAdd,
                                            () => {
                                            },
                                            isNormalSubscription ? PremiumUpgradeMessage : MaxVideosMessage,
                                            {
                                                numberVideosCanAdd: benefits.numberVideosCanAdd,
                                            }
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
                                        // onRemove={(e) => handlePremiumFilter(e,
                                        //     isNormalSubscription,
                                        //     () => handleVideoRemove(card.id),
                                        //     PremiumUpgradeMessage
                                        // )}
                                        onRemove={(e) => handleVideoRemove(card.id)}
                                        onUpload={() => document.getElementById(`videoUpload-${card.id}`).click()}
                                        childComponent={!(countVideos() >= benefits.numberVideosCanAdd) ? <></> :
                                            <LockIcon/>}
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
                                        // isNormalSubscription,
                                        benefits.canAddImage !== true,
                                        () => {
                                        },
                                        PremiumUpgradeMessage
                                    )}
                                    onChange={(e) => {
                                        handleImageUpload(e, card.id);
                                        // what ?? e.target.value = '';
                                        const inp = document.getElementById(`imageUpload-${card.id}`);
                                        if (inp) inp.value = '';
                                    }}
                                    style={{display: "none"}}
                                />
                                <ImageToggleButton
                                    hasImage={card.img}
                                    // onRemove={(e) => handlePremiumFilter(e,
                                    //     benefits.canAddImage,
                                    //     () => handleImageRemove(card.id),
                                    //     PremiumUpgradeMessage
                                    // )}
                                    onRemove={() => handleImageRemove(card.id)}
                                    onUpload={() => document.getElementById(`imageUpload-${card.id}`).click()}
                                    childComponent={!(benefits.canAddImage !== true) ? <></> : <LockIcon/>}
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
                                listCard.length >= maxFlashcardsPerSet,
                                addCard,
                                MaxFlashcardsMessage
                            )} style={{cursor: "pointer"}}/>
                            {
                                listCard.length >= maxFlashcardsPerSet &&
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
                    display: blockAddPage ? "block" : "none",
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

            {!blockAddPage && !importFile && !genFromAIStatus &&
                <button
                    id="id-button-create"
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

            {
                processingHandleAddingSet() &&
                <>
                    <Box className={`!fixed 
                    !flex !flex-col !justify-center !items-center !h-full 
                    !top-0 !left-0 !w-full !z-[9999] !bg-black/70`}>
                        <CircularProgress
                            size={40}
                            thickness={4}
                            sx={{
                                color: '#1976d2',
                            }}
                        />
                        <Typography
                            className="!text-gray-200 !mt-4 !ml-2 !text-center !text-base"
                            variant="subtitle1">
                            Processing {
                            processingUploadingMedia ? "uploading media" :
                                processingAddingSet ? "adding set" :
                                    processingCommitVideos ? "committing videos" : ""
                        } ...
                        </Typography>
                    </Box>
                </>
            }

            {
                genFromAIStatus &&
                <>
                    <Box className={`!fixed 
                    !flex !flex-col !justify-center !items-center !h-full 
                    !top-0 !left-0 !w-full !z-[9999] !bg-black/70`}>
                        <CircularProgress
                            size={40}
                            thickness={4}
                            sx={{
                                color: '#1976d2',
                            }}
                        />
                        <Typography
                            className="!text-gray-200 !mt-4 !ml-2 !text-center !text-base"
                            variant="subtitle1">
                            Generating from AI ...
                        </Typography>
                    </Box>
                </>
            }
        </>
    );
}

export default AddNewSet;