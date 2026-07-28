// Xác định màu sắc cho mỗi lựa chọn
export const getOptionColorMultiple = (option, question) => {
    // Trường hợp đây là đáp án đúng
    if (option.true) {
        // Nếu người dùng chọn đáp án này hoặc chưa trả lời
        if (question.answerId === option.id) {
            return "#83d377"; // Màu xanh lá - đáp án đúng được chọn hoặc chưa trả lời
        } else {
            return "#7979f8"; // Màu tím - đáp án đúng nhưng không được chọn
        }
    }
    // Trường hợp đây là đáp án sai
    else {
        // Nếu người dùng chọn đáp án này
        if (question.answerId === option.id) {
            return "#cc556a"; // Màu đỏ - đáp án sai được chọn
        } else {
            return "#ededff"; // Màu xám nhạt - đáp án sai không được chọn
        }
    }
};

// Hàm xác định màu sắc cho button câu hỏi
export const getColorButtonBaseOnOption = (question, isActiveQuestion) => {
    // Trường hợp người dùng đã trả lời đúng
    if (question.answerTrue === true) {
        return {
            backgroundColor: "#83d377 !important",
            hoverColor: "#83d377cc !important",
            textColor: !isActiveQuestion ? "#a66060 !important" : "",
        };
    }
    // Trường hợp người dùng chưa trả lời
    else if (!question.answerId) {
        return {
            // backgroundColor: "#7474b6 !important",
            // hoverColor: "#7474b6cc !important",
            backgroundColor: undefined,
            hoverColor: undefined
        };
    }
    // Trường hợp người dùng đã trả lời nhưng sai
    else {
        return {
            backgroundColor: "#ad4c4c !important",
            hoverColor: "#ad4c4ccc !important"
        };
    }
};