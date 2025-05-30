import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormLabel, Grid, InputLabel,
    Radio,
    RadioGroup, Select,
    TextField,
    Typography
} from "@mui/material";
import Preminum from "src/components/Preminum/Preminum.jsx";
import bgPayment from "src/assets/images/bgPayment.png";
import bgPaymentStripe from '@/assets/images/bgPayment.png';
import logoPayment from "src/assets/images/img.png";
import "./payment.css";
import Diamond from "src/components/DiamondIcon/Diamond.jsx";
import React, {useEffect, useState} from "react";
import {Elements} from "@stripe/react-stripe-js";
import CheckoutForm from "src/pages/payment/CheckoutForm.jsx";
import {loadStripe} from "@stripe/stripe-js";
import {Step, Stepper} from "react-form-stepper";
import {useNavigate} from "react-router-dom";
import {getYourProfile} from "src/services/AuthenticationService.js";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Option = ({onChooseBenefits}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);
    return (
        <>
            <Box className={`payment-box ${show ? 'show' : 'hide'}`}>
                <Box className="payment-header">Benefits</Box>
                <Box className="benefits-container">
                    <Box className="benefits-card">
                        <span className="benefits-title">QUiZCARDS</span>
                        <p className="benefits-subtitle">Free</p>
                        <Box mb={2}>
                            <span className="benefits-text">Daily sets creation</span>
                            <p className="benefits-description">5 sets per day</p>
                            <span className="benefits-text">Anonymous publishing</span>
                            <p className="benefits-description">Other users can find you through public sets</p>
                            <span className="benefits-text">Images per set</span>
                            <p className="benefits-description">Can add up to 2 images per set</p>
                            <span className="benefits-text">Medium game room</span>
                            <p className="benefits-description">Up to 5 friends</p>
                            <span className="benefits-text">Number of term per set</span>
                            <p className="benefits-description">Up to 500 terms</p>
                        </Box>
                        <button className="benefits-button">Current benefits</button>
                    </Box>

                    {/* Premium Plan */}
                    <Box className="benefits-card">
                        <Box>
                            <p className="benefits-title">QUiZCARDS</p>
                            <Preminum className="premium-icon"/>
                        </Box>
                        <Box mt={4}>
                            <span className="benefits-text">Daily sets creation</span>
                            <p className="benefits-description">
                                <span className="premium-highlight">Unlimited</span> sets per day
                            </p>
                            <span className="benefits-text">Anonymous publishing</span>
                            <p className="benefits-description">
                                Your account will be <span className="premium-highlight">undiscoverable</span> on your
                                chosen sets
                            </p>
                            <span className="benefits-text">Images per set</span>
                            <p className="benefits-description">
                                Can add <span className="premium-highlight">unlimited</span> images per set
                            </p>
                            <span className="benefits-text">Larger game room</span>
                            <p className="benefits-description">
                                Up to <span className="premium-highlight">50</span> friends
                            </p>
                            <span className="benefits-text">Number of term per set</span>
                            <p className="benefits-description">
                                Up to <span className="premium-highlight">2000</span> terms
                            </p>
                        </Box>
                        <button className="benefits-button benefits-button-premium" onClick={onChooseBenefits}>Choose
                            benefits
                        </button>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

const Pay = ({onPaymentSuccess}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);


    const [subcription, setSubcription] = useState("Premium Plan");
    const [paymentPlan, setPaymentPlan] = useState("monthly");
    const [totalPay, setTotalPay] = useState(4.99); // Use numeric value instead of string with dollar sign

    const handleChange = (e) => {
        const plan = e.target.value;
        setPaymentPlan(plan);
        setTotalPay(plan === "annually" ? 23.88 : 4.99); // Adjust numeric value without dollar sign
    };

    useEffect(() => {
        console.log(paymentPlan);
        console.log(totalPay);
    }, [paymentPlan]);
    return (
        <>
            <Box className={`payment-box ${show ? 'show' : 'hide'}`}>
                <Box className="benefits-container">
                    <Box className="benefits-card" sx={{width: "30%"}}>
                        <Box>
                            <img src={`${logoPayment}`} alt="" width={200}/>
                        </Box>
                        <Box mb={2}>
                            <Box sx={{display: "flex", flexDirection: "column", color: "white", fontSize: "15px"}}
                                 gap={1}>
                                <Box sx={{display: "flex", alignItems: "center", gap: "40px"}}>
                                    <Diamond/>
                                    <span>Unlimited sets per day</span>
                                </Box>
                                <Box sx={{display: "flex", alignItems: "center", gap: "40px"}}>
                                    <Diamond/>
                                    <span>Up to 2000 terms per set</span>
                                </Box>
                                <Box sx={{display: "flex", alignItems: "center", gap: "40px"}}>
                                    <Diamond/>
                                    <span>Unlimited images per set</span>
                                </Box>
                                <Box sx={{display: "flex", alignItems: "center", gap: "40px"}}>
                                    <Diamond/>
                                    <span>Anonymous publishing</span>
                                </Box>
                                <Box sx={{display: "flex", alignItems: "center", gap: "40px"}}>
                                    <Diamond/>
                                    <span>Larger game room</span>
                                </Box>
                                <FormControl onChange={() => setSubcription("Premium Plan")}>
                                    <RadioGroup
                                        aria-labelledby="demo-controlled-radio-buttons-group"
                                        name="controlled-radio-buttons-group"
                                        value={paymentPlan}
                                        onChange={handleChange}
                                        style={{gap: "10px"}}
                                    >
                                        <FormControlLabel
                                            value="annually"
                                            control={<Radio
                                                sx={{color: "white", "&.Mui-checked": {color: "#6a1b9a"}}}/>}
                                            label={
                                                <Box sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    textAlign: "left",
                                                    width: "200px",
                                                    backgroundColor: "#522e6e",
                                                    padding: "2px 15px",
                                                    borderRadius: "15px"
                                                }}>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: "bold",
                                                        color: "white",
                                                        fontSize: "15px"
                                                    }}>
                                                        Annually
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: "white"}}>
                                                        $23.88/year ($1.99/month)
                                                    </Typography>
                                                </Box>
                                            }
                                        />

                                        {/* Monthly Plan */}
                                        <FormControlLabel
                                            value="monthly"
                                            control={<Radio
                                                sx={{color: "white", "&.Mui-checked": {color: "#6a1b9a"}}}/>}
                                            label={
                                                <Box sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    textAlign: "left",
                                                    width: "200px",
                                                    backgroundColor: "#522e6e",
                                                    padding: "2px 15px",
                                                    borderRadius: "15px"
                                                }}>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: "bold",
                                                        color: "white",
                                                        fontSize: "15px"
                                                    }}>
                                                        Monthly
                                                    </Typography>
                                                    <Typography variant="body2" sx={{color: "white"}}>
                                                        $4.99/month
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                        </Box>
                        <Box color="white" display="flex" justifyContent="space-between">
                            <span>  Total payment:</span>
                            <span>{totalPay} $</span>
                        </Box>
                    </Box>
                    {/* Premium Plan */}
                    <Box style={{width: "100%"}}>
                        <Elements stripe={stripePromise}>
                            <CheckoutForm totalPay={totalPay} planType={paymentPlan} subcription={subcription}
                                          onPaymentSuccess={onPaymentSuccess}/>
                        </Elements>
                    </Box>
                </Box>
            </Box>
        </>
    )
}
const Done = () => {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setShow(true);
    }, []);
    const handleRedirect = async () => {
        try {
            const infor= await getYourProfile();
            console.log(infor);
        } catch (e) {
            console.log(e);
        }
        window.location.href="/user";
    }
    return (
        <Box className={`payment-box ${show ? 'show' : 'hide'}`} sx={{alignItems: "center"}} gap={5} p={5}>
            <Box sx={{position: "relative", fontSize: "30px", fontWeight: 700, color: 'white', textAlign: "left"}}>
                <span>Thank you for upgrading.</span><br/>
                <span>Now, enjoy your benefits with </span>
                <Preminum/>
            </Box>
            <button className="done-button" onClick={handleRedirect}>Start the new Journey</button>
        </Box>
    )
}

function Payment() {
    const [activeStep, setActiveStep] = useState(0);
    const handleChooseBenefits = () => {
        setActiveStep(1); // Move to Pay step
    };

    // Handle successful payment (move to Done step)
    const handlePaymentSuccess = (status) => {
        if (status) {
            setActiveStep(2); // Move to Done step
        }
    };
    return (
        <Box
            className="payment-container"
            style={{backgroundImage: `url(${bgPaymentStripe})`}}
        >
            <Stepper>
                <Step label="Benefits option"
                      style={activeStep === 0 ? {backgroundColor: "lightblue"} : activeStep > 0 ? {backgroundColor: "green"} : {backgroundColor: "grey"}}/>
                <Step label="Payment"
                      style={activeStep === 1 ? {backgroundColor: "lightblue"} : activeStep > 1 ? {backgroundColor: "green"} : {backgroundColor: "grey"}}/>
                <Step label="Confirmation"
                      style={activeStep === 2 ? {backgroundColor: "lightblue"} : activeStep > 2 ? {backgroundColor: "green"} : {backgroundColor: "grey"}}/>
            </Stepper>
            {activeStep === 0 && <Option onChooseBenefits={handleChooseBenefits}/>}
            {activeStep === 1 && <Pay onPaymentSuccess={handlePaymentSuccess}/>}
            {activeStep === 2 && <Done/>}

        </Box>
    );
}

export default Payment;
