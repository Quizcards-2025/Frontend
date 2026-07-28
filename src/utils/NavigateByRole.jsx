import React from "react";
import {useNavigate} from "react-router-dom";
import {canAccess, Roles} from "src/roles/roles.js";

const navigateByRole = (userInfo, navigate) => {
    try {
        if (canAccess(userInfo.role, [Roles.ADMIN])) {
            navigate("/admin");
        } else if (canAccess(userInfo.role, [Roles.FREE_USER, Roles.PREMIUM_USER])) {
            navigate("/user");
        }
    }  catch (error) {
        console.error("Error when navigate:", error);
    }
};

export default navigateByRole;