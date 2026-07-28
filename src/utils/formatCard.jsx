// import {textToHtml} from "src/utils/HtmlAndFileUtils.jsx";
//
//
// export const formatCardArray = (cards) => {
//     if (!Array.isArray(cards)) {
//         console.error("Invalid cards data:");
//         return [];
//     }
//     return cards.map((listCard) => ({
//         id: listCard.cardId,
//         frontHTML: textToHtml(listCard.question),
//         backHTML: textToHtml(listCard.answer),
//         img: listCard.imageUrl,
//     }));
// };