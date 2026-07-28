import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import AppRouter from "./routers/Routers.jsx";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {SearchProvider} from "src/context/SearchContext.jsx";
import {DeadlineProvider} from "src/context/DeadlineContext.jsx";
import {StreakProvider} from "./context/StreakContext.jsx";
import StreakModal from "./components/streak-modal/StreakModal.jsx";
import {StreakBackgroundProvider} from "./context/StreakBackgroundContext.jsx";
import StreakBackgroundModal from "./components/streak-modal/StreakBackgroundModal.jsx";
import {NotificationProvider} from "src/context/NotificationContext.jsx";
import {SSENotiProvider} from "src/context/SSENotiContext.jsx";
import {SetPasswordProvider} from "src/context/SetPasswordContext.jsx";
import {TabIdProvider} from "src/context/TabIdContext.jsx";
import {SpeakTextProvider} from "src/context/SpeakTextContext.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <TabIdProvider>
            <SearchProvider>
                <DeadlineProvider>
                    <StreakProvider>
                        <StreakBackgroundProvider>
                            <NotificationProvider>
                                <SSENotiProvider>
                                    <SetPasswordProvider>
                                        <SpeakTextProvider>
                                            <ToastContainer autoClose={3000}/>
                                            <StreakModal/>
                                            <StreakBackgroundModal/>
                                            <AppRouter/>
                                        </SpeakTextProvider>
                                    </SetPasswordProvider>
                                </SSENotiProvider>
                            </NotificationProvider>
                        </StreakBackgroundProvider>
                    </StreakProvider>
                </DeadlineProvider>
            </SearchProvider>
        </TabIdProvider>
    </StrictMode>,
)
