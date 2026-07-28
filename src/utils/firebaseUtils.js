import { ref, getDownloadURL, uploadString } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const uploadToFirebase = async (
    storage,
    base64Data,
    folder = "images",
    fileName = null,
    contentType = null
) => {
    try {
        // Nếu không có contentType, thử detect từ base64 data
        let detectedContentType = contentType;
        if (!detectedContentType && base64Data.includes('data:')) {
            const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,/);
            detectedContentType = matches ? matches[1] : null;
        }

        // Kiểm tra xem có phải là image không
        if (!detectedContentType || !detectedContentType.startsWith('image/')) {
            throw new Error('Only image files are allowed');
        }

        // Tính kích thước file từ base64
        const base64String = base64Data.split(',')[1] || base64Data;
        const fileSizeInBytes = (base64String.length * 3) / 4 - (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0);
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        // Kiểm tra giới hạn kích thước 25MB
        if (fileSizeInMB > 25) {
            throw new Error('File size exceeds 25MB limit');
        }

        // Lấy extension từ contentType
        const extension = detectedContentType.split('/')[1];
        const newFileName = fileName ? `${fileName}.${extension}` : `${Date.now()}-${uuidv4()}.${extension}`;

        const storageRef = ref(storage, `${folder}/${newFileName}`);

        await uploadString(storageRef, base64Data, 'data_url', {
            contentType: detectedContentType
        });

        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error("Error uploading file to Firebase:", error);
        throw error;
    }
};
