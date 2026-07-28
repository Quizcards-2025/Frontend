export function compareFunctionSort(firstCard, secondCard) {
        if (secondCard.mark !== firstCard.mark) {
            return secondCard.mark - firstCard.mark;
        }

        const orderFirst =
            firstCard.isRemembered === false ? 1
                : (firstCard.isRemembered === undefined || firstCard.isRemembered === null) ?
                    2 : 3;
        const orderSecond = secondCard.isRemembered === false ? 1
            : (secondCard.isRemembered === undefined || secondCard.isRemembered === null) ?
                2 : 3;

        if (orderFirst !== orderSecond) {
            return orderFirst - orderSecond;
        }

        return firstCard.id < secondCard.id;
    };