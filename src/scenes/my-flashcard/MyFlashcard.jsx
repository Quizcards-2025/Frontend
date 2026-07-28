import {Box, IconButton, InputBase} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import MySet from "../../components/button/MySet.jsx";
import MyFolder from "../../components/button/MyFolder.jsx";
import {IoIosSearch} from "react-icons/io";
import Pagination from "../../components/Pagination/PageWithTime.jsx";
import * as setService from "../../services/SetService.js"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import api from "src/apis/api.js";
import {useLocation, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import PageWithTime from "../../components/Pagination/PageWithTime.jsx";
import axios from "axios";
import SetCard from "src/components/SetCard/SetCard.jsx";
import FolderSticky from "src/components/FolderSticky/FolderSticky.jsx";

const MyFlashcard = (props) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [myFolder, setMyFolder] = useState([]);
    const [mySet, setMySet] = useState([]);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [listSearch, setListSearch] = useState([]);
    const handleSearch = useCallback(() => {
        if (!query) {
            setListSearch([]);
            return;
        }
        // const searchUrl = isFolderOpen
        //     ? "http://localhost:8080/api/v1/folder/search-folder"
        //     : "http://localhost:8080/api/v1/set/search-my-course";
        const searchUrl = isFolderOpen
            ? "/v1/folder/search-folder"
            : "/v1/set/search-my-course";

        api.get(searchUrl, {params: {query}})
            .then((res) => {
                console.log(res.data);
                setListSearch(res.data);
            })
            .catch((err) => console.error(err));
    }, [query, isFolderOpen]);
    useEffect(() => {
        document.title = "My set flashcard";
        const timer = setTimeout(() => {
            handleSearch()
        }, 1000);
        return () => {
            clearTimeout(timer);
        }
    }, [query, handleSearch]);

    const groupByMonthAndYear = (list) => {
        const result = {};

        list.forEach(item => {
            const date = new Date(item.createdAt);
            const month = date.getMonth() + 1; // Months are 0-indexed, so add 1
            const year = date.getFullYear();
            const name = `THÁNG ${month} NĂM ${year}`;

            if (!result[name]) {
                result[name] = [];
            }
            result[name].push(item);
        });

        return Object.entries(result).map(([key, items]) => ({
            key,
            items,
        }));
    };
    const groupByMonthAndYearAdmin = (list) => {
        const result = {};

        list.forEach(item => {
            const date = new Date(item.dateCreatedOrLastAccessed);
            const month = date.getMonth() + 1; // Months are 0-indexed, so add 1
            const year = date.getFullYear();
            const name = `THÁNG ${month} NĂM ${year}`;

            if (!result[name]) {
                result[name] = [];
            }
            result[name].push(item);
        });

        return Object.entries(result).map(([key, items]) => ({
            key,
            items,
        }));
    };
    const fetchFolders = async () => {
        try {
            const folders = await setService.getListFolder();
            const listFolder = groupByMonthAndYear(folders);
            setMyFolder(listFolder);
        } catch (e) {
            console.log(e.message);
        }

    };
    const fetchSets = async () => {
        try {
            // const response = await api.get(`http://localhost:8080/api/v1/flashcard-settings/sort`, {
            //     params: {sortBy: "recent"}
            // });
            const response = await api.get(`/v1/flashcard-settings/sort`, {
                params: {sortBy: "recent"}
            });
            // const data = await setService.getListCourse();
            const data = response.data;
            console.log(data);
            const listCourse = groupByMonthAndYearAdmin(data);
            // console.log(listCourse);
            setMySet(listCourse);
        } catch (e) {
            console.log(e.message);
        }
    };

    useEffect(() => {
        fetchFolders();
        fetchSets();
    }, []);


    const [title, setTitle] = useState("");
    const handleCreateFolder = async () => {
        const data = {title: title};
        try {
            // const res = await api.post("http://localhost:8080/api/v1/folder/create", data);
            const res = await api.post("/v1/folder/create", data);
            if (res.status === 201) {
                fetchFolders();
            }
        } catch (error) {
            console.error("Error creating folder:", error);
        }
        handleClose();
    };

    const handleShowModal = () => {
        if (isFolderOpen) {
            handleShow();
        } else {
            navigate("/user/create");
        }
    }
    const pageMyCourse = () => {
        setIsFolderOpen(false);
    }
    const pageMyFolder = () => {
        setIsFolderOpen(true);
    }
    const handleSortChange = (event) => {
        const selectedValue = event.target.value;
        console.log(selectedValue);
        fetchSortedData(selectedValue);
    };
    const fetchSortedData = async (sortOption) => {
        try {
            if (sortOption === "recent") {
                await fetchSets();
                setListSearch([]);
            } else {
                // const response = await api.get(`http://localhost:8080/api/v1/flashcard-settings/sort`, {
                //     params: {sortBy: sortOption}
                // });
                const response = await api.get(`/v1/flashcard-settings/sort`, {
                    params: {sortBy: sortOption}
                });
                console.log(response.data)
                setListSearch(response.data);
            }
        } catch (error) {
            console.error('Error fetching sorted data:', error);
        }
    };
    return (
        <>
            <Box m="20px" display="flex" flexDirection="column" gap={1}>
                <Box display="flex" flexDirection="row" gap="20px">
                    <MySet onClick={pageMyCourse}/>
                    <MyFolder onClick={pageMyFolder}/>
                </Box>
                <span style={{
                    width: "100%",
                    height: "3px",
                    backgroundColor: "#e2e2fe",
                    borderRadius: "15px"
                }}></span>
                <Box display="flex" justifyContent="space-between" gap={70}>
                    <Box
                        display="flex"
                        width="100%"
                        bgcolor="white"
                        borderRadius="10px"
                        maxWidth={500}

                    >
                        <InputBase placeholder="Search" sx={{ml: 2, flex: 1,fontFamily:"Wix Madefor Text",fontWeight:"700"}}
                                   onChange={(e) => setQuery(e.target.value)}/>
                        <IconButton type="button" sx={{p: 1}}>
                            <IoIosSearch/>
                        </IconButton>
                    </Box>
                    {
                        !isFolderOpen &&
                        <select name="period" id=""
                                style={{width: "100px", height: "40px", borderRadius: "15px", padding: "8px"}}
                                onChange={handleSortChange}
                                defaultValue={null}
                        >
                            <option value="recent">Gần đây</option>
                            <option value="created">Đã tạo</option>
                            <option value="learned">Đã học</option>
                        </select>
                    }
                </Box>
                {
                    listSearch?.length > 0 ?
                        <Box sx={{width: "100%", maxWidth: "100vw"}} >
                            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gridAutoRows="auto" gap={2}>
                                {isFolderOpen &&
                                    listSearch.map((item, index) =>
                                        <FolderSticky key={index}
                                                      title={item.title}
                                                      setCount={item.setCount}
                                                      id={item.folderId}
                                        />)
                                }
                                {!isFolderOpen &&
                                    listSearch.map((item, index) =>
                                        <SetCard key={index}
                                                 id={item.setId}
                                                 title={item.title}
                                                 totalCard={item.totalCard}
                                                 avatarImg={item.avatar}
                                                 name={item.userName || item.author}
                                                 isAnonymous={item?.isAnonymous}
                                        />)
                                }
                            </Box>
                        </Box>
                        :
                        <Box display={"flex"} flexDirection="column" gap={4}>
                            {
                                !isFolderOpen && mySet.length > 0 &&
                                <PageWithTime list={mySet} itemsPerPage={4} isFolderOpen={isFolderOpen}/>
                            }
                            {
                                isFolderOpen && myFolder.length > 0 &&
                                <>
                                    <PageWithTime list={myFolder} itemsPerPage={4} isFolderOpen={isFolderOpen}
                                                  fetchData={fetchFolders}/>
                                </>
                            }
                            {
                                (mySet?.length === 0 && myFolder?.length === 0) &&
                                <Box sx={{
                                    display: "center",
                                    justifyContent: "center",
                                    marginTop: "100px",
                                    color: "gray"
                                }}>
                                    No data display
                                </Box>
                            }
                            <button
                                onClick={handleShowModal}
                                style={{
                                    position: "fixed",
                                    bottom: "30px",
                                    right: "50px",
                                    border: "none",
                                    backgroundColor: "#0e22e9",
                                    color: "white",
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "15px"
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                     stroke-linejoin="round"
                                     className="icon icon-tabler icons-tabler-outline icon-tabler-plus">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M12 5l0 14"/>
                                    <path d="M5 12l14 0"/>
                                </svg>
                            </button>
                            <Modal show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title style={{fontWeight: "700"}}>Create new folder</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <input type="text" placeholder="Title"
                                           style={{width: "100%", padding: "10px"}}
                                           onChange={(e) => setTitle(e.target.value)}
                                    />
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleCreateFolder}>
                                        Add
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </Box>
                }
            </Box>
        </>
    )
};

export default MyFlashcard;


