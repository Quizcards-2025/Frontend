import React, {useState} from "react";
import {CardElement, useStripe, useElements} from "@stripe/react-stripe-js";
import {Box, Button, CircularProgress, Grid, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";
import {base_api} from "src/apis/api.js";

const CheckoutForm = ({totalPay, planType,subcription,onPaymentSuccess}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate=useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        if (!totalPay || !planType) {
            alert("Invalid payment details. Please check and try again.");
            return;
        }

        setIsProcessing(true);

        const cardElement = elements.getElement(CardElement);

        try {
            // Create payment method
            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: "card",
                card: cardElement,
            });

            if (error) {
                toast.error("Invalid card details.\n Please try again.");
                console.error(error);
                setIsProcessing(false);
                return;
            }

            // Get user data
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) {
                alert("You must log in before making a payment.");
                setIsProcessing(false);
                navigate('/login')
                return;
            }
            const dataSend={
                paymentMethodId: paymentMethod.id,
                amount: totalPay,
                userId: user.id,
                planType:planType,
                subcription:subcription
            }
            // console.log(dataSend);

            // Send payment request to backend
            // const response = await axios.post("http://localhost:8080/api/payment/process", dataSend);
            const response = await base_api.post("/payment/process", dataSend);
            console.log(response)
            if (response.status==200) {
                toast.success(response.data)
                onPaymentSuccess(true);
                // alert("Payment successful! Your account has been upgraded.");
            } else {
                toast.error(result.error || "Payment failed. Please try again.");
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const cardElementStyle = {
        style: {
            base: {
                backgroundColor: "#743f9b",
                color: "white",
                fontFamily: "Roboto, sans-serif",
                fontSize: "16px",
                "::placeholder": {
                    color: "white",
                },
                border: "1px solid white",
                padding: "10px",
                borderRadius: "5px",
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a",
            },
        },
    };

    return (
        <Box color="white">
            <Typography variant="h6" sx={{fontWeight: "bold", marginBottom: "16px"}}>
                Payment Details
            </Typography>

            <form onSubmit={handleSubmit}>
                <Box sx={{backgroundColor: "#743f9b", borderRadius: "5px", padding: "10px", marginBottom: "16px"}}>
                    <CardElement options={cardElementStyle}/>
                </Box>
                <Typography variant="h6" color="white" sx={{marginBottom: "16px"}}>
                    Total to Pay: ${totalPay}
                </Typography>
                <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={!stripe || isProcessing}
                    sx={{
                        backgroundColor: isProcessing ? "gray" : "#6a1b9a",
                        color: "white",
                        textTransform: "none",
                        fontWeight: "bold",
                        fontSize: "16px",
                        padding: "10px",
                    }}
                >
                    {isProcessing ? <CircularProgress size={24} sx={{color: "white"}}/> : "Upgrade to Premium"}
                </Button>
            </form>
            <Typography
                variant="body2"
                sx={{marginTop: "20px", textAlign: "center", fontSize: "12px", color: "gray"}}
            >
                Your next bill is on October 01, 2025
            </Typography>
        </Box>
    );
};
export default CheckoutForm;