import React from "react";
import {Box} from "@mui/material";

const Header = ({ title, round }) => (
    <header className="flex flex-wrap gap-5 justify-between items-center px-16 py-7 w-full leading-none bg-violet-100 shadow-[0px_10px_60px_rgba(0,0,0,0.15)] text-zinc-950 max-md:px-5 max-md:max-w-full">
        <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f20b1ef4e6beecbde3596984ffbedda071ba7c50?placeholderIfAbsent=true&apiKey=c9a9f3f30f254b94b2eef114f49a32b9"
            alt="Quiz icon"
            className="object-contain shrink-0 self-stretch rounded-none aspect-square w-[3.125rem]"
        />
        <h1 className="self-stretch my-auto text-2xl font-bold">
            {title}
        </h1>
        <span className="gap-2.5 self-stretch p-3.5 my-auto text-base font-medium bg-indigo-100 rounded-3xl min-h-10">
      {round}
    </span>
    </header>
);

const SatisfactionSurvey = () => (
    <section className="w-full rounded-2xl">
        <div className="flex flex-col px-4 py-5 w-full rounded-2xl bg-slate-50">
            <h3 className="self-start text-base font-bold leading-none text-center text-zinc-950">
                Satisfy with your work?
            </h3>
            <div className="flex gap-3.5 mt-5">
                <div className="flex flex-col whitespace-nowrap">
          <span className="self-center text-3xl font-bold leading-none text-zinc-950">
            😄
          </span>
                    <span className="mt-1.5 text-xs font-medium leading-none text-gray-400">
            Satisfied
          </span>
                </div>
                <div className="flex flex-col">
                    <div className="flex gap-6 self-start text-3xl font-bold leading-none whitespace-nowrap text-zinc-950">
                        <span>😊</span>
                        <span>😐</span>
                        <span>😓</span>
                        <span>😭</span>
                    </div>
                    <span className="self-end mt-1.5 text-xs font-medium leading-none text-gray-400">
            Not at all
          </span>
                </div>
            </div>
        </div>
    </section>
);

const ScoreCard = ({ type, score, bgColor, textColor }) => (
    <article className={`mt-4 w-full font-bold leading-none ${textColor} rounded-2xl max-w-[19.75rem]`}>
        <div className={`flex gap-5 justify-between p-4 ${bgColor} rounded-2xl`}>
            <span className="my-auto text-base">{type}</span>
            <span className="text-3xl text-right">{score}</span>
        </div>
    </article>
);

const PracticeCard = () => (
    <article className="pt-2.5 mt-4 w-full rounded-2xl text-zinc-950">
        <div className="flex shrink-0 bg-indigo-100 rounded-2xl h-[8.063rem]" />
        <div className="flex z-10 flex-col justify-center py-5 pr-5 pl-6 mt-0 bg-gray-50 rounded-2xl border-2 border-indigo-100 border-solid max-md:px-5">
            <div className="w-full max-w-[17.063rem]">
                <div className="w-full">
                    <h3 className="text-2xl font-bold leading-none">
                        Practice missed cards
                    </h3>
                    <p className="mt-1.5 text-base font-medium leading-4">
                        Back to flipping mode to review your missed cards.
                    </p>
                </div>
                <span className="gap-2.5 self-stretch px-3.5 py-2.5 mt-5 w-24 text-base font-medium leading-none bg-indigo-100 rounded-3xl min-h-[1.938rem] inline-block">
          3 terms
        </span>
            </div>
        </div>
    </article>
);

const RestartCard = () => (
    <article className="pt-2.5 mt-4 w-full text-base font-medium leading-none rounded-none text-zinc-950">
        <div className="flex flex-col justify-center py-0.5 bg-violet-300 rounded-2xl">
            <div className="flex z-10 flex-col items-start py-5 pr-8 pl-6 mt-0 w-full bg-indigo-100 rounded-2xl border-2 border-violet-300 border-solid max-md:px-5">
                <h3 className="text-2xl font-bold leading-none">
                    Restart matching
                </h3>
                <p className="self-stretch mt-1.5">
                    Do it again and memorize better.
                </p>
                <span className="gap-2.5 self-stretch px-3.5 py-2.5 mt-5 bg-violet-300 rounded-3xl min-h-[1.938rem] inline-block">
          15 terms
        </span>
            </div>
        </div>
    </article>
);

const ResultSummary = () => (
    <section className="flex flex-col w-full max-md:mt-7">
        <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/79308931caf66aeba0ad55c3159cdb85eb46f765?placeholderIfAbsent=true&apiKey=c9a9f3f30f254b94b2eef114f49a32b9"
            alt="Achievement badge"
            className="object-contain self-center max-w-full aspect-[2.03] w-[9.25rem]"
        />
        <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/4a12af78a245d31465b719f9f97d08e43c2119e5?placeholderIfAbsent=true&apiKey=c9a9f3f30f254b94b2eef114f49a32b9"
            alt="Progress chart"
            className="object-contain aspect-[4.72] w-[22.75rem]"
        />
        <h2 className="self-start mt-6 text-3xl font-extrabold leading-10 text-zinc-950">
            You are doing great, keep learning!
        </h2>
        <button className="gap-2.5 self-stretch px-10 py-4 mt-8 text-xl font-bold leading-none text-center text-violet-100 bg-blue-700 rounded-2xl min-h-[3.125rem] shadow-[0px_5px_0px_rgba(2,14,199,1)] max-md:px-5">
            Continue to next round
        </button>
    </section>
);

const ResultDetails = () => (
    <section className="grow pb-36 mt-4 max-md:pb-24 max-md:mt-10">
        <div className="max-w-full w-[19.75rem]">
            <ScoreCard
                type="Right match"
                score="12"
                bgColor="bg-violet-300"
                textColor="text-blue-700"
            />
            <ScoreCard
                type="Wrong match"
                score="3"
                bgColor="bg-rose-300"
                textColor="text-red-500"
            />
            <PracticeCard />
            <RestartCard />
        </div>
        <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/678c69bc47c6ea4a634ed912117b1a7885405fdf?placeholderIfAbsent=true&apiKey=c9a9f3f30f254b94b2eef114f49a32b9"
            alt="Decorative element"
            className="object-contain z-10 mt-0 w-full aspect-[1.39] max-md:mt-0"
        />
    </section>
);

const AfterFinishLearningFlashcardCopy = () => {
    return (
        <main className="flex overflow-hidden flex-col pb-40 bg-violet-100 rounded-[1.875rem] max-md:pb-24">
            <div className="self-center mt-3.5 ml-3.5 max-w-full w-[46.063rem]">
                <div className="flex gap-5 max-md:flex-col">
                    <div className="w-6/12 max-md:ml-0 max-md:w-full">
                        <ResultSummary />
                    </div>
                    <div className="ml-5 w-6/12 max-md:ml-0 max-md:w-full">
                        <ResultDetails />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AfterFinishLearningFlashcardCopy;