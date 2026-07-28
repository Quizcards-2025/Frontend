import {Box, Button} from "@mui/material";
import React, {useEffect, useState} from "react";
import SetCard from "../SetCard/SetCard.jsx";
import FolderSticky from "../FolderSticky/FolderSticky.jsx";
import * as setService from "../../services/SetService.js";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

function PageWithTime({list, itemsPerPage, isFolderOpen, fetchData}) {

    const navigate = useNavigate();

    // Tính tổng số trang
    const calculateTotalPages = (items) => Math.ceil(items.length / itemsPerPage);

    // Khởi tạo trạng thái phân trang
    const [pageState, setPageState] = useState({});

    const initializePageState = () => {
        const initialState = list.reduce((acc, group) => {
            acc[group.key] = 1;
            return acc;
        }, {});
        setPageState(initialState);
    };
    useEffect(() => {
        initializePageState();
    }, [list]);

    // Chuyển đổi trang
    const handlePageChange = (newPage, groupKey, items) => {
        if (newPage >= 1 && newPage <= calculateTotalPages(items)) {
            setPageState((prevState) => ({
                ...prevState,
                [groupKey]: newPage,
            }));
        }
    };

    // Xử lý chuyển hướng khi người dùng nhấp vào một Set
    const handleRedirectViewSet = async (id) => {
        try {
            const res = await setService.getListCardBySetId(id);
            if (res.status === 200) {
                navigate(`/user/set/detail/${id}`);
            } else {
                toast.error(res.statusText);
            }
        } catch (e) {
            toast.warn(e.response?.data || "Something went wrong");
        }
    };

    return (
        <>
            {list?.map((group, index) => {
                const currentPage = pageState[group.key] || 1;
                const startIndex = (currentPage - 1) * itemsPerPage;
                const currentItems = group.items.slice(
                    startIndex,
                    startIndex + itemsPerPage
                );

                return (
                    <Box
                        display="flex"
                        flexDirection="column"
                        width="100%"
                        key={index}
                        gap={2}
                    >
                        {/* Tiêu đề nhóm */}
                        <span
                            style={{
                                width: "158px",
                                backgroundColor: "#ededff",
                                padding: "0 5px",
                            }}
                        >
                            {group.key}
                        </span>

                        {/* Hiển thị các item */}
                        <Box
                            display="grid"
                            gridTemplateColumns={`repeat(${itemsPerPage}, 1fr)`}
                            gap={1}
                        >
                            {
                                isFolderOpen
                                && currentItems.map((item, index) => (
                                    <FolderSticky
                                        key={index}
                                        title={item.title}
                                        setCount={item.setCount}
                                        id={item.folderId}
                                    />
                                ))
                            }
                            {
                                !isFolderOpen && currentItems.map((item, index) => (
                                    <SetCard key={index}
                                             id={item.setId}
                                             title={item.title}
                                             totalCard={item.totalCard}
                                             avatarImg={item.avatar}
                                             name={item.author || item.userName}
                                             isAnonymous={item?.isAnonymous}
                                             userId={item?.userId}
                                    />
                                ))
                            }
                        </Box>

                        {/* Phân trang */}
                        {calculateTotalPages(group.items) > 1 && (
                            <Box mt={2} display="flex" justifyContent="center">
                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        handlePageChange(
                                            currentPage - 1,
                                            group.key,
                                            group.items
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>

                                {Array.from(
                                    {
                                        length: calculateTotalPages(
                                            group.items
                                        ),
                                    },
                                    (_, idx) => (
                                        <Button
                                            key={idx}
                                            variant={
                                                currentPage === idx + 1
                                                    ? "contained"
                                                    : "outlined"
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    idx + 1,
                                                    group.key,
                                                    group.items
                                                )
                                            }
                                            style={{margin: "0 5px"}}
                                        >
                                            {idx + 1}
                                        </Button>
                                    )
                                )}

                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        handlePageChange(
                                            currentPage + 1,
                                            group.key,
                                            group.items
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        calculateTotalPages(group.items)
                                    }
                                >
                                    Next
                                </Button>
                            </Box>
                        )}
                    </Box>
                );
            })}
        </>
    );
}

export default PageWithTime;
