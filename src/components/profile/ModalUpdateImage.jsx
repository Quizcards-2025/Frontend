import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useMediaQuery, useTheme
} from "@mui/material";
import {Image} from "react-bootstrap";
import React, {useEffect, useRef, useState} from "react";

const ModalUpdateImage = ({
                              isOpening = false,
                              setIsOpening = () => {
                              },
                              onAvatarChange = () => {
                              },
                              limitSizeInMb = 25,
                              imagePreview = null,
                              onModalOpen = () => {
                              },
                              onModalClose = () => {
                              },
                              onUserCancel = () => {
                              },
                              onUserAgree = () => {
                              },
                          }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const avatarInputRef = useRef(null);

    const [dragOver, setDragOver] = useState(false); // Trạng thái khi kéo file qua

    const handleCloseModalUpdateAvatar = () => {
        setIsOpening(false);
        onModalClose();
    };

    useEffect(() => {
        if (isOpening) {
            onModalOpen();
        }
    }, [isOpening]);

    // Xử lý khi kéo file vào khu vực
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    // Xử lý khi rời khỏi khu vực kéo thả
    const handleDragLeave = () => {
        setDragOver(false);
    };

    const assignImageToAvatar = (file) => {
        return new Promise(() => {
            if (file) {
                // Tiêu chí 1: Kiểm tra loại file có phải image không
                if (!file.type.startsWith('image/')) {
                    alert('Only image files are accepted. Please select the correct file format!');
                    return; // Dừng lại nếu không phải file ảnh
                }

                // Tiêu chí 2: Kiểm tra kích thước file (25MB = 25 * 1024 * 1024 bytes)
                const maxSizeInBytes = limitSizeInMb * 1024 * 1024; // 25MB
                if (file.size > maxSizeInBytes) {
                    alert(`File exceeds allowed size (${limitSizeInMb}MB). Please choose a smaller file!`);
                    return; // Dừng lại nếu file quá lớn
                }
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                // setAvatar(event.target.result);
                onAvatarChange(event.target.result);
            };
            reader.readAsDataURL(file); // Đọc file dưới dạng Data URL
        });
    };

    // Xử lý khi thả file
    const handleDrop = async (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);

        // Lấy thông tin từ từng file ảnh
        await assignImageToAvatar(droppedFiles[0]);
    };

    // Xử lý khi chọn file qua input
    const handleFileInput = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        await assignImageToAvatar(selectedFiles[0]);
    };

    const handleUserCancel = () => {
        onUserCancel();
        handleCloseModalUpdateAvatar();
    };

    const handleUserAgree = () => {
        onUserAgree();
        handleCloseModalUpdateAvatar();
    };

    return (
        <>
            <Dialog
                fullScreen={fullScreen}
                open={isOpening}
                onClose={handleCloseModalUpdateAvatar}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title"
                             className="!text-[1.8rem] !font-[700]"
                >
                    Update your avatar here
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className="!text-[1.2rem]">
                        Drag and drop your avatar below or click
                        <Button
                            className="!text-[inherit] !border-[2px] !border-solid !border-blue-500 !m-0 !mx-2"
                            sx={{
                                textTransform: 'none',
                            }}
                            onClick={() => {
                                avatarInputRef.current && avatarInputRef.current.click();
                            }}
                        >
                            here
                        </Button>
                        to upload:
                    </DialogContentText>

                    {/* Khu vực kéo thả */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mt-4 p-6 border-2 border-dashed rounded-lg text-center ${
                            dragOver ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-50'
                        }`}
                    >
                        {
                            imagePreview ? <>
                                <Image
                                    src={imagePreview || ""}
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                    }}
                                    roundedCircle
                                />
                            </> : <>
                                <p className="text-gray-600">
                                    {dragOver ? 'Drop your image here!' : 'Drag your image here or click to select'}
                                </p>
                                <label
                                    htmlFor="fileInput"
                                    className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                                >
                                    Select Image
                                </label>
                            </>
                        }
                        {/* Input file ẩn, cho phép nhấp để chọn file */}
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                            id="fileInput"
                        />
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => {
                        handleUserCancel();
                    }}
                            sx={{
                                textTransform: 'none',
                            }}
                            className="!text-[1.1rem]"
                    >
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        handleUserAgree();
                    }}

                            autoFocus
                            sx={{
                                textTransform: 'none',
                            }}
                            className="!text-[1.1rem]"
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ModalUpdateImage;
