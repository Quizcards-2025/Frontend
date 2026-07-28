import {api} from "src/apis/api.js";

export const getListCardByCardIds = async (cardIds, setId) => {
    try {
        const resCards = await api.post("/v1/flashcards/get-by-ids",
            {
                cardIds,
                setId,
            }
        );
        return resCards.data;
    } catch (err) {
        throw err;
    }
};