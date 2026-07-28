const escapeRegex = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function extracted(index, flashcards, currentFlashcard) {
    index = index + 1;
    flashcards.push({
        ...currentFlashcard,
        front: currentFlashcard.front ? currentFlashcard.front.trim() : currentFlashcard.front,
        back: currentFlashcard.back ? currentFlashcard.back.trim() : currentFlashcard.back,
        img: currentFlashcard.img,
        id: index + "-SIMPLE_PARSE-" + performance.now(),
    });
    currentFlashcard = {front: "", back: "", img: null};
    return {index, currentFlashcard};
}

export const parseImportTextQToA = (text) => {
    const flashcards = [];
    let currentFlashcard = {id: 0, front: "", back: "", img: null}; // Flashcard đang được xử lý
    let currentState = null; // Trạng thái hiện tại: "front", "back", hoặc "img"

    // Tách text thành từng dòng
    const lines = text.split("\n");
    let index = 0;

    lines.forEach((line) => {
        line = line.trim(); // Loại bỏ khoảng trắng thừa

        if (line.startsWith("Q:")) {
            // Nếu flashcard hiện tại có dữ liệu, lưu nó và bắt đầu mới
            if (currentFlashcard.front || currentFlashcard.back || currentFlashcard.img) {
                const __ret = extracted(index, flashcards, currentFlashcard);
                index = __ret.index;
                currentFlashcard = __ret.currentFlashcard;
            }
            currentFlashcard.front = line.substring(2).trim();
            currentState = "front"; // Chuyển trạng thái sang "front"
        } else if (line.startsWith("A:")) {
            // Nếu có `A:` và trạng thái ban đầu là 2 trạng thái A hoặc img, tạo thẻ mới
            if (currentState !== "front") {
                const __ret = extracted(index, flashcards, currentFlashcard);
                index = __ret.index;
                currentFlashcard = {front: "", back: "", img: null};
            }
            currentFlashcard.back = line.substring(2).trim();
            currentState = "back"; // Chuyển trạng thái sang "back"
        } else if (line.startsWith("IMG:")) {
            // Nếu có `IMG:`, lưu đường dẫn ảnh (chỉ một dòng)
            if (currentState === "img") {
                const __ret = extracted(index, flashcards, currentFlashcard);
                index = __ret.index;
                currentFlashcard = {front: "", back: "", img: null};
            }
            currentFlashcard.img = line.substring(4).trim();
            currentState = "img"; // Chuyển trạng thái sang "img"
        } else {
            // Gộp nội dung vào phần tương ứng dựa trên trạng thái
            if (currentState === "front") {
                currentFlashcard.front += "\n" + line; // Gộp thêm vào mặt trước
            } else if (currentState === "back") {
                currentFlashcard.back += "\n" + line; // Gộp thêm vào mặt sau
            } else if (currentState === "img") {
                console.warn(`Ignoring extra content after IMG: "${line}".`); // Bỏ qua nội dung không hợp lệ
            }
        }
    });

    // Lưu flashcard cuối cùng nếu có dữ liệu
    if (currentFlashcard.front || currentFlashcard.back || currentFlashcard.img) {
        flashcards.push({
            ...currentFlashcard, front: currentFlashcard.front ?
                currentFlashcard.front.trim() : currentFlashcard.front,
            back: currentFlashcard.back ? currentFlashcard.back.trim() : currentFlashcard.back,
            img: currentFlashcard.img,
            id: (index + 1) + "-SIMPLE_PARSE-" + performance.now(),
        });
    }

    console.log(flashcards);

    return flashcards;
};


const splitBetweenCards = (text, separator) => {
    const escapedSep = escapeRegex(separator);

    const regex = new RegExp(`(?<!-)${escapedSep}(?!-)`, 'g');

    return text
        .split(regex)
        .map(part => part.trim())
        .filter(part => part !== '');
};

const splitFirstBySpecialSeparator = (text, separator) => {
    const firstIndex = text.indexOf(separator);
    if (firstIndex === -1) {
        return [text, ""]; // Không tìm thấy separator
    }

    // Tách chuỗi thành 2 phần
    const firstPart = text.slice(0, firstIndex); // Phần trước separator cuối cùng
    const secondPart = text.slice(firstIndex + separator.length); // Phần sau separator cuối cùng

    return [firstPart, secondPart];
};

const splitLastBySpecialSeparator = (text, separator) => {
    const lastIndex = text.lastIndexOf(separator);
    if (lastIndex === -1) {
        return [text, ""]; // Không tìm thấy separator
    }

    // Tách chuỗi thành 2 phần
    const firstPart = text.slice(0, lastIndex); // Phần trước separator cuối cùng
    const secondPart = text.slice(lastIndex + separator.length); // Phần sau separator cuối cùng

    return [firstPart, secondPart];
};

const textSplit = (text, subStringToRemove, hasImage = false) => {
    const [firstText, secondText] = splitFirstBySpecialSeparator(
        text,
        subStringToRemove
    );
    if (!hasImage) {
        return {
            front: firstText?.trim() || "",
            back: secondText?.trim() || "",
        };
    }
    const [midText, lastText] = splitLastBySpecialSeparator(
        secondText,
        subStringToRemove
    );
    return {
        front: firstText?.trim() || "",
        back: midText?.trim() || "",
        img: lastText?.trim(),
    };
};

const initCards = (id, term, definition, image) => {
    const card = {
        id: id + "-SIMPLE_PARSE-" + performance.now(),
        front: term.trim(),
        back: definition.trim(),
    };
    if (image) card.img = image.trim();
    return card;
};

const parseImportTextIfSameSeparator = (text, termSeparator, cardSeparator, hasImage) => {
    if (termSeparator && cardSeparator && text?.trim() && termSeparator === cardSeparator) {
        const splitArray = text.split(termSeparator).filter((str) => str && str.trim() !== '');
        const len = splitArray.length;
        let cards = [];
        let i = 0;
        while ((i + 1 + (hasImage ? 1 : 0)) < len) {
            cards.push(initCards(i + 1, splitArray[i], splitArray[i + 1],
                !hasImage ? undefined : splitArray[i + 2]));
            i = i + 2 + (hasImage ? 1 : 0);
        }
        if (i < len) {
            cards.push(initCards(i + 1, splitArray[i], splitArray[i + 1],
                !hasImage ? undefined : splitArray[i + 2]));
        }
        return [...cards];
    }
    return [];
}

const parseImportTextIfNotSameSeparator = (text, termSeparator, cardSeparator, hasImage) => {
    if (termSeparator && cardSeparator && text?.trim() && termSeparator !== cardSeparator) {
        const listTextCards = splitBetweenCards(text, cardSeparator);
        let id = 0;

        return listTextCards.map((text) => {
            id = id + 1;
            let card = textSplit(text, termSeparator, hasImage);

            if (hasImage && (card.front?.trim() || card.back?.trim() || card.img?.trim())) {
                return {
                    id: id + "-SIMPLE_PARSE-" + performance.now(),
                    front: card.front?.trim() || "",
                    back: card.back?.trim() || "",
                    img: card.img?.trim(),
                };
            }
            if (!hasImage && (card.front?.trim() || card.back?.trim())) {
                return {
                    id: id + "-SIMPLE_PARSE-" + performance.now(),
                    front: card.front?.trim() || "",
                    back: card.back?.trim() || "",
                };
            }
            id = id - 1;
        });
    }
    return [];
}

export const parseImportTextBaseOnString = (text, termSeparator, cardSeparator, hasImage) => {
    termSeparator = termSeparator?.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
    cardSeparator = cardSeparator?.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
    if (termSeparator === cardSeparator) {
        return parseImportTextIfSameSeparator(text, termSeparator, cardSeparator, hasImage);
    }
    return parseImportTextIfNotSameSeparator(text, termSeparator, cardSeparator, hasImage);
};