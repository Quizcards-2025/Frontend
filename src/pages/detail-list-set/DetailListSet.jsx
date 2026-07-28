import {useLocation} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {Box, CircularProgress, TablePagination} from "@mui/material";
import SetCard from "../../components/SetCard/SetCard.jsx";
import api from "../../apis/api.js";
import {toast} from "react-toastify";

const DetailListSet = () => {
    const location = useLocation();
    const DEFAULT_PAGE = 0;
    const DEFAULT_ITEMS_PER_PAGE = 10;
    const cardsTableRef = useRef(null);
    const [onLoading, setOnLoading] = useState(true);
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('user_id');
    const categoryName = queryParams.get('category_name');
    const tagName = queryParams.get('tag_name');
    const [totalElements, setTotalElements] = useState(100);
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

    const [setFiltered, setSetFiltered] = useState([]);
    const [analysisResponse, setAnalysisResponse] = useState({
        countSet: 0,
        userId: userId,
        userName: "",
        categoryName: categoryName,
    });

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
        if (cardsTableRef.current) {
            cardsTableRef.current.style.opacity = "0.5";
            cardsTableRef.current.style.pointerEvents = "none";
        }
        fetchSetFilter({
            userId,
            categoryName,
            tagName,
            page: newPage,
            size: rowsPerPage,
        }).finally(() => {
            if (cardsTableRef.current) {
                cardsTableRef.current.style.opacity = "1";
                cardsTableRef.current.style.pointerEvents = "auto";
            }
        });
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(DEFAULT_PAGE);
        if (cardsTableRef.current) {
            cardsTableRef.current.style.opacity = "0.5";
            cardsTableRef.current.style.pointerEvents = "none";
        }
        fetchSetFilter({
            userId,
            categoryName,
            tagName,
            page: DEFAULT_PAGE,
            size: newRowsPerPage,
        }).finally(() => {
            if (cardsTableRef.current) {
                cardsTableRef.current.style.opacity = "1";
                cardsTableRef.current.style.pointerEvents = "auto";
            }
        });
    };

    const fetchSetFilter = async ({userId, categoryName, tagName, page, size}) => {
        try {
            let res;
            if (tagName) {
                res = await api.get("/v1/set/filter-by-tag", {
                    params: {
                        tag_name: tagName,
                        page: page,
                        size: size,
                    },
                });
            } else {
                res = await api.get("/v1/set/filter", {
                    params: {
                        user_id: userId,
                        category_name: categoryName,
                        page: page,
                        size: size,
                    },
                });
            }
            setSetFiltered(res.data.content);
            setTotalElements(res.data.totalElements);
            if (res.data.content && userId) {
                setAnalysisResponse((prev) => ({
                    ...prev,
                    userName: res.data.content[0].userName
                }));
            }
            setAnalysisResponse((prev) => ({
                ...prev,
                countSet: res.data.numberOfElements,
            }));
        } catch (err) {
            console.error(err);
            toast.error("Error while fetching data");
        }
    };

    useEffect(() => {
        fetchSetFilter({
            userId,
            categoryName,
            tagName,
            page: currentPage,
            size: rowsPerPage,
        }).finally(() => setOnLoading(false));
    }, []);

    return (
        <>
            {onLoading ? (
                <Box className="flex justify-center items-center h-full">
                    <CircularProgress
                        size={40}
                        thickness={4}
                        sx={{ color: '#1976d2' }}
                    />
                </Box>
            ) : (
                <Box className="m-8 flex flex-col min-h-0 h-full overflow-y-scroll">
                    <h3>
                        <b>
                            <b>
                                {analysisResponse.countSet} public sets
                                {analysisResponse.userName && (
                                    <> on user: <u><i>{analysisResponse.userName}</i></u></>
                                )}
                                {analysisResponse.categoryName && (
                                    <> with category: <u><i>{analysisResponse.categoryName}</i></u></>
                                )}
                                {tagName && (
                                    <> with tag: <u><i>{tagName}</i></u></>
                                )}
                            </b>
                        </b>
                    </h3>

                    <Box className="flex flex-col grow-0 shrink basis-[90%] min-h-0" ref={cardsTableRef}>
                        {setFiltered.length > 0 ? (
                            <Box className="w-full min-h-0 overflow-y-auto">
                                <Box className="grid grid-cols-1 gap-[2px] sm:flex sm:flex-wrap sm:justify-between sm:gap-5 md:grid md:grid-cols-3 md:gap-[2px] lg:grid-cols-4">
                                    {setFiltered.map((item, index) => (
                                        <SetCard
                                            key={index}
                                            id={item.setId}
                                            title={item.title}
                                            totalCard={item.totalCard}
                                            avatarImg={item.avatar}
                                            name={item.userName || item.author}
                                            isAnonymous={item?.isAnonymous}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ) : (
                            <Box className="flex justify-center items-center mt-[100px] text-gray-500 text-2xl min-h-0">
                                No data display
                            </Box>
                        )}
                    </Box>

                    <Box className="min-h-0 w-full flex flex-wrap justify-center items-center">
                        <TablePagination
                            component="div"
                            count={totalElements}
                            page={currentPage}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Box>
                </Box>
            )}
        </>
    );
};

export default DetailListSet;