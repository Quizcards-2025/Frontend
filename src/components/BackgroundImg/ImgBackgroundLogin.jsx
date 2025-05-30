import React from 'react';
import "./index.css";  // Đảm bảo import đúng CSS
import SvgContentLogin from "../background/ContentLogin.jsx";
import Quizcard from "../background/Quizcard.jsx";

import bgLogin from '@/assets/images/background_login.png';

const ImgBackgroundLogin = () => {
    return (
        <div className="image-container">
            <div className="svg-content">
                <SvgContentLogin/>
            </div>
            {/*<img src="src/assets/images/background_login.png" alt="Background Login" />*/}
            <img src={bgLogin} alt="Background Login"/>
            <div className="quizcard-content">
                <Quizcard/>
            </div>
        </div>
    );
};

export default ImgBackgroundLogin;
