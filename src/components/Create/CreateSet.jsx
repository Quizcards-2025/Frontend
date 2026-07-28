import "./create.css";
import {Link} from "react-router-dom";

import bgCreateCard from '@/assets/images/3d_flashcard.png';

const CreateSetLabel = () => {
    return (
        <>
            <div className="label-create !flex flex-col lg:flex-row py-2 gap-4 lg:gap-0 items-center">
                <div className="w-full h-auto lg:h-[84px]">
                    <img
                        src={bgCreateCard}
                        alt="Flashcard"
                        className="w-16 h-16 lg:w-20 lg:h-20 object-contain"
                    />
                    <b className="label-text">
                        Create your flashcard sets to continue learning effectively!
                    </b>
                </div>
                <Link to="create">
                    <button
                        className="create-button px-6 py-2 bg-blue-600 text-white font-medium rounded-lg
                               hover:bg-blue-700 hover:shadow-lg hover:scale-105
                               active:bg-blue-800 active:scale-95 active:shadow-inner
                               transition-all duration-200 ease-in-out"
                    >
                        Create
                    </button>
                </Link>
            </div>
        </>
    );
}
export default CreateSetLabel;
