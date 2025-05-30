export function shuffleArrayFromIndex(arr, startIndex) {
    // Chia mảng thành hai phần
    const prefix = arr.slice(0, startIndex); // Các phần tử từ đầu tới `startIndex - 1`
    const suffix = arr.slice(startIndex); // Các phần tử từ `startIndex` trở đi

    // Shuffle phần `suffix`
    for (let i = suffix.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [suffix[i], suffix[randomIndex]] = [suffix[randomIndex], suffix[i]];
    }

    // Kết hợp lại phần đầu với phần đã shuffle
    return [...prefix, ...suffix];
}