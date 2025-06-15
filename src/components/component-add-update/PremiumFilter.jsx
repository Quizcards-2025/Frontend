import React from "react";
import {toast} from "react-toastify";

// Component hiển thị toast cho premium upgrade
export function PremiumUpgradeMessage({toastId}) {
    return (
        <div>
            <h2>Sorry</h2>
            <p style={{marginTop: "14px"}}>This is a premium user</p>
            <p style={{marginBottom: "14px"}}>Do you want to upgrade?</p>
            <div style={{
                display: "flex",
                justifyContent: "space-around",
            }}>
                <button onClick={() => toast.dismiss(toastId)}>Cancel</button>
                <button onClick={() => toast.dismiss(toastId)}>Go to upgrade</button>
            </div>
        </div>
    );
}

// Component hiển thị toast cho trường hợp số flashcard vượt quá cho phép
export function MaxFlashcardsMessage({toastId, normalSubscription}) {
    return (
        <div>
            <h2>Sorry</h2>
            <p style={{marginTop: "14px"}}>
                You have reached the maximum number of cards that can be created in a set.
            </p>
            {normalSubscription && <p style={{marginBottom: "14px"}}>Do you want to upgrade?</p>}
            <div style={{
                display: "flex",
                justifyContent: "space-around",
            }}>
                <button onClick={() => toast.dismiss(toastId)}>Cancel</button>
                {normalSubscription && <button onClick={() => toast.dismiss(toastId)}>Go to upgrade</button>}
            </div>
        </div>
    );
}

export function MaxVideosMessage({toastId, numberVideosCanAdd, normalSubscription}) {
    return (
        <div>
            <h2>Sorry</h2>
            <p style={{marginTop: "14px"}}>
                You have reached the maximum number of videos that can be added to a set.
            </p>
            <p style={{marginBottom: "14px"}}>
                You can only add {numberVideosCanAdd} videos per set.
            </p>
            {normalSubscription && <p style={{marginBottom: "14px"}}>Do you want to upgrade?</p>}
            <div style={{
                display: "flex",
                justifyContent: "space-around",
            }}>
                <button onClick={() => toast.dismiss(toastId)}>Cancel</button>
                {normalSubscription && <button onClick={() => toast.dismiss(toastId)}>Go to upgrade</button>}
            </div>
        </div>
    );
}

// Hook trả về hàm handlePremiumFilter để sử dụng trong các component
export function usePremiumFilter(normalSubscription) {
    const showToastr = (ToastComponent, type, params) => {
        const options = {autoClose: true, closeButton: true};
        if (type === "error") {
            toast.error(<ToastComponent normalSubscription={normalSubscription} {...params}/>, options);
        } else if (type === "warning") {
            toast.warning(<ToastComponent normalSubscription={normalSubscription} {...params}/>, options);
        } else if (type === "success") {
            toast.success(<ToastComponent normalSubscription={normalSubscription} {...params}/>, options);
        }
    };

    return (event, conditionalBlock, nextFunction, ToastComponent, params = null) => {
        if (conditionalBlock) {
            event.preventDefault();
            showToastr(ToastComponent, "error", params);
        } else {
            nextFunction();
        }
    };
}