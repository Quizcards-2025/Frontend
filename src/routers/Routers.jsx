import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import App from "../App.jsx";
import NotFound from "../components/NotFound.jsx";
import {GoogleOAuthProvider} from "@react-oauth/google";
import googleClientConfig from "../configs/googleClientConfig.js";
import {adminRoutes, arenaRoutes, guestRoutes, matchingRoutes, userRoutes} from "./listRouters.js";
import PrivateRoute from "../utils/PrivateRoute.js";
import Study from "../pages/on-study/Study.jsx";
import Exam from "../pages/exam/Exam.jsx";
import Forgot from "src/scenes/forgotPassword/Forgot.jsx";
import LogoutPage from "src/pages/logout/LogoutPage.jsx";
import Loading from "src/components/Loading.jsx";
import Payment from "src/pages/payment/Payment.jsx";
import DoingMultipleChoiceTest from "src/pages/doing-test/DoingMultipleChoiceTest.jsx";
import DetailMultipleChoiceTest from "src/pages/detail-test/DetailMultipleChoiceTest.jsx";
import DoingEssayTest from "src/pages/doing-test/DoingEssayTest.jsx";
import DetailEqualTest from "src/pages/detail-test/DetailEssayTest.jsx";
import MainLayout from "src/scenes/layout/admin/main-layout/index.jsx";
import {AppGuess} from "../AppGuess.jsx";
import ConfirmEmail from "src/scenes/confirm-email/ConfirmEmail.jsx";
import SpaceRepetition from "src/pages/study-space-repetition/SpaceRepetition.jsx";
// import {CookiesProvider} from "react-cookie";


const AppRouter = () => {
    return (
        <GoogleOAuthProvider clientId={googleClientConfig.clientId}>
            <Router>
                <Routes>
                    <Route path="/" element={<AppGuess/>}>
                        {guestRoutes.map((route, index) => {
                            if (route.private) {
                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={<PrivateRoute element={route.component}/>}
                                    />
                                );
                            }

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={route.component}
                                />
                            );
                        })}
                    </Route>

                    <Route path="/arena">
                        {arenaRoutes.map((route, index) => {
                            if (route.private) {
                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={<PrivateRoute element={route.component}/>}
                                    />
                                );
                            }

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={route.component}
                                />
                            );
                        })}
                    </Route>

                    <Route path="/user" element={<App/>}>
                        {userRoutes.map((route, index) => {
                            if (route.private) {
                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={<PrivateRoute element={route.component}/>}
                                    />
                                );
                            }

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={route.component}
                                />
                            );
                        })}
                    </Route>

                    <Route path="/matching">
                        {matchingRoutes.map((route, index) => {
                            if (route.private) {
                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={<PrivateRoute element={route.component}/>}
                                    />
                                );
                            }

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={route.component}
                                />
                            );
                        })}
                    </Route>

                    <Route path="/admin" element={<MainLayout/>}>
                        {adminRoutes.map((route, index) => {
                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={route.component}
                                />
                            );
                        })}
                    </Route>


                    <Route path="/user/progress/set/:id" element={<PrivateRoute element={<Study/>}/>}/>
                    <Route path="/user/space-repetition/:id" element={<PrivateRoute element={<SpaceRepetition />}/>}/>

                    {/*<Route path="/user/progress/set/result-copy/:id" element={<PrivateRoute element={<AfterFinishLearningFlashcardCopy />}/>}/>*/}
                    {/*<Route path="/user/progress/set/result/:id" element={<PrivateRoute element={<AfterFinishLearningFlashcard />}/>}/>*/}

                    <Route path="/exam" element={<PrivateRoute element={<Exam/>}/>}/>
                    <Route path="/loading" element={<Loading/>}/>
                    <Route path="/payment" element={<Payment/>}/>

                    {/*<Route path="/set/:id/data" element={<ViewSet />} />*/}

                    <Route path="/doing-test/mul/:id" element={<DoingMultipleChoiceTest/>}/>
                    <Route path="/doing-test/es/:id" element={<DoingEssayTest/>}/>

                    <Route path="/detail-test/mul/:id" element={<DetailMultipleChoiceTest/>}/>
                    <Route path="/detail-test/es/:id" element={<DetailEqualTest/>}/>

                    <Route path="/confirm/:key" element={<ConfirmEmail/>}/>

                    <Route path="/forgot-password" element={<Forgot/>}/>
                    <Route path="/logout" element={<LogoutPage/>}/>


                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </Router>
        </GoogleOAuthProvider>
    );
};

export default AppRouter;
