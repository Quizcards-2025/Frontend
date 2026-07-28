
export const validateUsername = (value) => {
    if (!value) return "* Username is required";
    if (!/^(?!.*--)[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(value))
        return "* Username must only contain letters, numbers, and single hyphens, and no consecutive hyphens";
    if (value.length < 8 || value.length > 50)
        return "* Username must be between 8 and 50 characters";
    if (!/^(?!\d+$)[a-zA-Z0-9]+$/.test(value))
        return "* Username must contain at least one letter or cannot contain only numbers.";
    return "";
};

export const validatePassword = (value) => {
    if (value.length < 8 || value.length > 100)
        return "* Password must be between 8 and 100 characters";
    if (!/[A-Z]/.test(value)) return "* Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value)) return "* Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value)) return "* Password must contain at least one digit";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
        return "* Password must contain at least one special character";
    if (/\s/.test(value)) return "* Password must not contain whitespace";
    return "";
};

export const validateEmail = (value) => {
    if (!value) return "* Email is required";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) return "* Email is not valid";
    return "";
};

export const validateName = (name) => {
    if (!name) return "* This field is required";
    // if (!/^[a-zA-Z]+$/.test(name)) return "* Name must only contain letters";
    return "";
};
