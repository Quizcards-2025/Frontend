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
export function MaxFlashcardsMessage({toastId, isFreeUser}) {
    return (
        <div>
            <h2>Sorry</h2>
            <p style={{marginTop: "14px"}}>
                You have reached the maximum number of cards that can be created in a set.
            </p>
            {isFreeUser && <p style={{marginBottom: "14px"}}>Do you want to upgrade?</p>}
            <div style={{
                display: "flex",
                justifyContent: "space-around",
            }}>
                <button onClick={() => toast.dismiss(toastId)}>Cancel</button>
                {isFreeUser && <button onClick={() => toast.dismiss(toastId)}>Go to upgrade</button>}
            </div>
        </div>
    );
}

// Hook trả về hàm handlePremiumFilter để sử dụng trong các component
export function usePremiumFilter(isFreeUser) {
    const showToastr = (ToastComponent, type) => {
        const options = {autoClose: true, closeButton: true};
        if (type === "error") {
            toast.error(<ToastComponent isFreeUser={isFreeUser}/>, options);
        } else if (type === "warning") {
            toast.warning(<ToastComponent isFreeUser={isFreeUser}/>, options);
        } else if (type === "success") {
            toast.success(<ToastComponent isFreeUser={isFreeUser}/>, options);
        }
    };

    return (event, conditional, nextFunction, ToastComponent) => {
        if (conditional) {
            event.preventDefault();
            showToastr(ToastComponent, "error");
        } else {
            nextFunction();
        }
    };
}