export function formatTime(time) {
    if (time !== undefined && time !== null) {
        const totalSeconds = Math.floor(time / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return '';
}

export function calculateRemainingTime(createdAt, endAt) {
    if (createdAt && endAt) {
        const now = new Date();
        const end = new Date(endAt);
        return Math.max(end - now, 0);
    }
    return null;
}