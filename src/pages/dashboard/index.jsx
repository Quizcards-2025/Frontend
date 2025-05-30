import {Box, IconButton, InputBase, useMediaQuery, useTheme,} from "@mui/material";
import Header from "../../components/Header.jsx"
import SetCard from "../../components/SetCard/SetCard.jsx";
import CreateSet from "../../components/Create/CreateSet.jsx";
import "./dashboard.css"
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import api, {base_api} from "src/apis/api.js";
import {useSearch} from "src/context/SearchContext.jsx";
import Pagination from "src/components/Pagination/Pagination.jsx";
import CreatorCard from "src/components/CreatorCards/CreatorCard.jsx";
import {IoIosSearch} from "react-icons/io";
import {ColorModeContext, tokens} from "src/theme.js";
import {useNavigate} from "react-router-dom";

function Dashboard() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const isXsDevices = useMediaQuery("(max-width:466px)");
    const isXlDevices = useMediaQuery("(min-width: 1260px)");
    const isMdDevices = useMediaQuery("(min-width: 724px)");
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const {setSearchResults, searchResults} = useSearch();

    const [onLoading, setOnLoading] = useState(false);
    const intervalRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (onLoading) {
            let dots = 0;
            intervalRef.current = setInterval(() => {
                dots = (dots + 1) % 6;
                document.title = "Dashboard ";
                for (let i = 0; i < dots; i++) {
                    document.title += ".";
                }
                console.log(document.title);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            clearInterval(intervalRef.current);
        }
    }, [onLoading]);

    useEffect(() => {
    }, [searchResults]);
    const fetchDataFreeUser = async () => {
        // const response = await api.get("http://localhost:8080/api/v1/home/data")
        const response = await api.get("/v1/home/data");
        setData(response.data);
    }
    useEffect(() => {
        setOnLoading(true);
        document.title = "Dashboard ";
        fetchDataFreeUser().then().catch().finally(
            () => {
                setOnLoading(false);
                document.title = "Dashboard ";
            }
        );
    }, [])
    const handleSearch = useCallback(() => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        // axios
        //     .get(`http://localhost:8080/api/v1/set/search`, {params: {query}})
        //     .then((res) => {
        //         console.log("du lieu be co la :", res)
        //         setSearchResults(res.data);
        //     })
        //     .catch((err) => console.error(err));
        base_api
            .get(`/v1/set/search`, {params: {query}})
            .then((res) => {
                console.log("du lieu be co la :", res)
                setSearchResults(res.data);
            })
            .catch((err) => console.error(err));
    }, [query]);
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch()
        }, 1000);
        return () => {
            clearTimeout(timer);
        }
    }, [query, handleSearch]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    return (
        <Box p="20px">
            <Box
                onChange={handleInputChange}
                display="flex"
                alignItems="center"
                bgcolor={colors.primary[400]}
                borderRadius="10px"
                sx={{display: `${isXsDevices ? "none" : "flex"}`, width: isMdDevices ? "200px" : "500px",margin:"10px 0",minWidth:"500px"}}
            >
                <InputBase placeholder="Search" sx={{ml: 2, flex: 1}}/>
                <IconButton value={query} type="button" sx={{p: 1}}>
                    <IoIosSearch color="0E22E9"/>
                </IconButton>
            </Box>
            {
                searchResults.length > 0 ?

                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: "100vw",
                            margin: "30px 0",
                        }}
                    ><Box
                        display="grid"
                        gridTemplateColumns="repeat(4, 1fr)"
                        gridAutoRows="auto"
                        gap={1}
                    >
                        {
                            searchResults.map((item, index) =>
                                <SetCard key={index}
                                         id={item.setId}
                                         title={item.title}
                                         totalCard={item.totalCard}
                                         avatarImg={item.avatar}
                                         name={item.userName}
                                         isAnonymous={item?.isAnonymous}
                                />)
                        }
                    </Box>
                    </Box>
                    :
                    <>
                        {
                            data.setsRecentAccessed?.length > 0 &&
                            <>
                                <Box display="flex" justifyContent="space-between">
                                    <Header title="Recently learned"/>
                                </Box>
                                <Pagination
                                    data={data.setsRecentAccessed}
                                    itemsPerPage={4}
                                    renderItem={(item, index) => (

                                        <SetCard
                                            key={index}
                                            isAnonymous={item.isAnonymous}
                                            userId={item.userId}
                                            avatarImg={item.avatar}
                                            title={item.title}
                                            totalCard={item.totalCard}
                                            name={item.userName}
                                            id={item.setId}

                                        />
                                    )}
                                />

                            </>
                        }

                        <Box mt="20px">
                            <CreateSet></CreateSet>
                        </Box>

                        {
                            data.setsRelevantCategory?.length > 0 &&
                            <>
                                <Box display="flex" justifyContent="space-between" mt="20px">
                                    <Header title={"Relevant to: " + data.relevantCategory}/>
                                </Box>
                                <Pagination
                                    data={data.setsRelevantCategory}
                                    itemsPerPage={4}
                                    renderItem={(item, index) => (

                                        <SetCard
                                            key={index}
                                            isAnonymous={item.isAnonymous}
                                            userId={item.userId}
                                            avatarImg={item.avatar}
                                            title={item.title}
                                            totalCard={item.totalCard}
                                            name={item.userName}
                                            id={item.setId}

                                        />
                                    )}
                                />

                            </>
                        }

                        {
                            data.topCreators?.length > 0 &&
                            <Box mt="20px">
                                <Box display="flex" justifyContent="space-between">
                                    <Header title="Top contributors"/>
                                </Box>
                                <Pagination
                                    data={data.topCreators}
                                    itemsPerPage={4}
                                    renderItem={(item, index) => (
                                        <CreatorCard
                                            key={item.userId}
                                            avatar={item.avatar}
                                            setCount={item.setCount}
                                            userName={item.userName}
                                            onTopCreatorClick={() => {
                                                navigate(`/user/detail-list-set?user_id=${item.userId}`);
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        }
                        {
                            data.setsPopular?.length > 0 &&
                            <Box mt="20px">
                                <Box display="flex" justifyContent="space-between">
                                    {/*<Header title="Hot flashcard sets"/>*/}
                                    <Header title="Most view flashcard sets"/>
                                </Box>
                                <Pagination
                                    data={data.setsPopular}
                                    itemsPerPage={4}
                                    renderItem={(item, index) => (
                                        <SetCard
                                            key={index}
                                            isAnonymous={item.isAnonymous}
                                            userId={item.userId}
                                            avatarImg={item.avatar}
                                            title={item.title}
                                            totalCard={item.totalCard}
                                            name={item.userName}
                                            id={item.setId}
                                            userInteractionCount={item.userInteractionCount}

                                        />
                                    )}
                                />
                            </Box>
                        }
                    </>
            }


        </Box>
    );
}

export default Dashboard;
