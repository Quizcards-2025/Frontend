import {htmlToText} from "html-to-text";

export const textToHtml = (plainText) => {
    const wrappedLines = plainText
        .split('\n')
        .map((line) => `<p>${line}</p>`)
        .join('');
    return `<div>${wrappedLines}</div>`;
};

export const convertHtmlToText = (htmlText) => {
    return htmlToText(htmlText, {
        wordwrap: false,
        preserveNewlines: true,
    });
}
export const removeNewlines=(text)=> {
    if (!text) return ""; // Kiểm tra xem chuỗi có rỗng không
    return text.replaceAll("\n", ""); // Thay thế tất cả "\n" bằng chuỗi rỗng
}