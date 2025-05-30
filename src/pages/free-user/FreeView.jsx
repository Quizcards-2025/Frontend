import {ColorModeContext, useMode} from "../../theme.js";
import {Box, CssBaseline, ThemeProvider, Button, CircularProgress} from "@mui/material";
import NavbarFreeUser from "../../scenes/layout/navbar-free-user/NavbarFreeUser.jsx";
import React, {useEffect, useState} from "react";
import {ToggledContext} from "../../App.jsx";
import SetCard from "../../components/SetCard/SetCard.jsx";
import Header from "../../components/Header.jsx";
import api, {base_api, getAccessToken, getRefreshToken, setAccessToken} from "src/apis/api.js";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {canAccess, Roles} from "src/roles/roles.js";
import navigateByRole from "src/utils/NavigateByRole.jsx";
import {navigateByUserData} from "../../utils/navigateByUserData.js";

function FreeView(props) {
    const itemsPerPage = 3;
    const [pageState, setPageState] = useState({});
    const navigate = useNavigate();

    const [onLoading, setOnLoading] = useState(true);
    const [onError, setOnError] = useState(false);

    const [data, setData] = useState([]);

    const fetchSetGuess = async () => {
        try {
            const resListSetData = await base_api.get("/v1/home/anonymous");
            // console.log(resListSetData.data.listSets);
            setData(resListSetData.data.listSets);
        } catch (e) {
            console.error(e);
            toast.error("Error: Cannot fetch set data");
            setOnError(true);
        } finally {
            setOnLoading(false);
        }
    };

    useEffect(() => {
        fetchSetGuess().then().catch();
    }, []);

    // Nhóm dữ liệu theo title hoặc subject
    const groupedData = data.reduce((acc, item) => {
        // const key = item.subject || item.title || item.categoryName;
        const key = item.categoryName;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});

    const handlePageChange = (newPage, key) => {
        setPageState(prev => ({...prev, [key]: newPage}));
    };

    const totalPages = (items) => Math.ceil(items.length / itemsPerPage);

    return (
        <>
            {
                onLoading ? (
                    <>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: "center",
                            height: '100%',
                            width: '100%',
                        }}>
                            <CircularProgress
                                size={40}
                                thickness={4}
                                sx={{
                                    color: '#1976d2',
                                }}
                            />
                        </Box>
                    </>
                ) : onError ? (
                    <>
                        <Box className="container flex !justify-center items-center w-full h-full">
                            <h3>
                                <b>
                                    No data display.
                                </b>
                            </h3>
                        </Box>
                    </>
                ) : (
                    <Box
                        bgcolor="#EDEDFF"
                        sx={{
                            flexGrow: 2,
                            display: "flex",
                            flexDirection: "column",
                            overflowY: "scroll",
                            padding: 20,
                        }}
                    >
                        {Object.keys(groupedData).map((key, index) => {
                            const items = groupedData[key];
                            const currentPage = pageState[key] || 1;
                            const startIndex = (currentPage - 1) * itemsPerPage;
                            const currentSet = items.slice(startIndex, startIndex + itemsPerPage);

                            return (
                                <Box key={index} display="flex" flexDirection="column" width="100%" gap={2}
                                     mt="20px">
                                    <Header title={key}/>
                                    <Box display="grid" gridTemplateColumns={`repeat(${itemsPerPage}, 1fr)`}
                                         gap="20px">
                                        {currentSet.map((item, i) => (
                                            <SetCard
                                                key={i}
                                                id={item.setId}
                                                title={item.title}
                                                totalCard={item.totalCard}
                                                avatarImg={item.avatar}
                                                name={item.firstName || item.lastName
                                                    ? `${item.firstName || ''} ${item.lastName || ''}`
                                                    : item.userName}
                                                isGuess={true}
                                            />
                                        ))}
                                    </Box>
                                    {totalPages(items) > 1 && (
                                        <Box mt={2} display="flex" justifyContent="center">
                                            <Button
                                                variant="outlined"
                                                onClick={() => handlePageChange(currentPage - 1, key)}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            {Array.from({length: totalPages(items)}, (_, i) => (
                                                <Button
                                                    key={i}
                                                    variant={currentPage === i + 1 ? "contained" : "outlined"}
                                                    onClick={() => handlePageChange(i + 1, key)}
                                                    style={{margin: "0 5px"}}
                                                >
                                                    {i + 1}
                                                </Button>
                                            ))}
                                            <Button
                                                variant="outlined"
                                                onClick={() => handlePageChange(currentPage + 1, key)}
                                                disabled={currentPage === totalPages(items)}
                                            >
                                                Next
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                )
            }

        </>
    );
}

export default FreeView;
