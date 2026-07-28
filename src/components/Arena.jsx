import {Box} from "@mui/material";

function Arena (props) {
    function formatQuestions(input) {
        // Tách các chuỗi câu hỏi thành các phần tử riêng lẻ
        const questions = input.split('\n').filter(line => line.trim() !== '');

        return questions.map(question => {
            // Tìm vị trí của câu hỏi (trước đáp án)
            const match = question.match(/^(.*?)([A-Za-z0-9.]+\s.*)$/);
            if (match) {
                const questionText = match[1].trim(); // Lấy phần câu hỏi
                const answersText = match[2].trim(); // Lấy phần đáp án

                // Tách từng đáp án thành các phần tử riêng
                const answers = answersText.split(/(?=[A-Za-z0-9.]+\s)/).map(answer => answer.trim());

                // Tạo HTML output
                return (
                    <div>
                        <p>{questionText}</p>
                        {answers.map((answer, index) => (
                            <p key={index}>{answer}</p>
                        ))}
                    </div>
                );
            } else {
                // Trường hợp không tìm thấy đáp án
                return (
                    <div>
                        <p>{question}</p>
                    </div>
                );
            }
        });
    }

    const input = "<div>Hệ thống số thập phân có bao nhiêu chữ số?<div> A. 10</div><div> B. 8</div><div> C. 2</div><div> D. 16</div> M.111</div>";
    const formattedQuestions = formatQuestions(input);
    console.log(formattedQuestions)
    return (
        <Box m="20px">
            <div dangerouslySetInnerHTML={{__html:input}}></div>
        </Box>
    )
}
export default Arena;