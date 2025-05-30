import React, {useEffect, useState} from "react";
import "./DetailFolder.css";
import {useNavigate, useParams} from "react-router-dom";
import {Box, Button} from "@mui/material";
import api, {base_api} from "src/apis/api.js";
import {format} from "date-fns";
import Modal from "react-bootstrap/Modal";
import {toast} from "react-toastify";
import {getListCourse} from "src/services/SetService.js";
import * as setService from "src/services/SetService.js";
import axios from "axios";
import {parseISO, isValid} from "date-fns";

function DetailFolder() {
    const {id} = useParams();
    const [listCollection, setListCollection] = useState([]);
    const [detailFolder, setDetailFolder] = useState(null);
    const [listSets, setListSets] = useState([]);

    const [showDetail, setShowDetail] = useState(false);
    const handleCloseDetail = () => setShowDetail(false);
    const [deleteCollectionID, setDeleteCollectionID] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const handleShowConfirmDelete = (collectionID) => {
        setDeleteCollectionID(collectionID);
        setShowConfirmDelete(true);
    };
    const handleCloseConfirmDelete = () => {
        setDeleteCollectionID(null);
        setShowConfirmDelete(false);
    };

    const confirmRemoveCollection = async () => {
        if (!deleteCollectionID) return;

        try {
            const response = await api.delete(`/v1/collection/delete-collection/${deleteCollectionID}`);
            if (response.status === 200) {
                toast.success(response.data.message,{autoClose:300});
                fetchListOfCollectionById();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete collection.");
        }
        handleCloseConfirmDelete();
    };
    const handleShowDetail = async () => {
        await fetchSets();
        setShowDetail(true);
    }

    const navigate = useNavigate();

    const [showConfirm, setShowConfirm] = useState(false);
    const handleCloseConfirm = () => {
        setShowConfirm(false)
    };
    const handleShowConfirm = () => setShowConfirm(true);

    const fetchDetailFolderById = async () => {
        try {
            // const response = await api.get(`http://localhost:8080/api/v1/folder/${id}`);
            const response = await api.get(`/v1/folder/${id}`);
            const data = response.data;
            // console.log(data);
            const createdAt = data?.createdAt && isValid(new Date(data.createdAt))
                ? parseISO(data.createdAt)
                : null;

            setDetailFolder({
                ...data,
                createdAt,
            });
        } catch (error) {
            console.error("Error fetching folder details:", error);
        }
    };

    const fetchSets = async () => {
        try {
            // const response = await api.get(`http://localhost:8080/api/v1/collection/list-new-set/${id}`)
            const response = await api.get(`/v1/collection/list-new-set/${id}`)
            // console.log(response.data);
            setListSets(response.data);
        } catch (error) {
            console.error("Error fetching folder details:", error);
        }
    }
    const removeFolder = async () => {
        try {
            // const response = await api.delete(`http://localhost:8080/api/v1/folder/delete/${id}`);
            const response = await api.delete(`/v1/folder/delete/${id}`);
            console.log(response);
            if (response.status == 200) {
                toast.success(response.data,{autoClose:300});
                navigate('/user/flashcard');
            }
        } catch (error) {
            toast.error(error.message)
        }
        handleCloseConfirm();
    }
    const removeCollection = async (collectionID) => {
        console.log(collectionID);
        try {

            const response = await api.delete(`/v1/collection/delete-collection/${collectionID}`);
            // console.log(response);
            if (response.status == 200) {
                toast.success(response.data.message);
                fetchListOfCollectionById();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };
    const [titleFolder, setTitleFolder] = useState(detailFolder?.title);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleUpdateTitle = (e) => setTitleFolder(e.target.value);
    const updateFolder = async () => {
        try {
            const data = {
                title: titleFolder,
                folderId: detailFolder?.folderId,
            }
            // const response = await api.put("http://localhost:8080/api/v1/folder/update", data);
            const response = await api.put("/v1/folder/update", data);
            if (response.status == 200) {
                toast.success(response.data,{autoClose:300});
                fetchDetailFolderById();
            }
        } catch (error) {
            toast.error(error.message)
        }
        handleClose();
    }
    const handleAddSet = async (setId) => {
        try {
            const data = {
                folderId: id,
                setId: setId
            }
            console.log(data);
            // const response = await api.post(`http://localhost:8080/api/v1/collection/create-new-collection`, data);
            const response = await api.post(`/v1/collection/create-new-collection`, data);
            console.log(response);
            if (response.status == 201) {
                toast.success(response.data.message,{autoClose:300});
                fetchSets();
                fetchListOfCollectionById();
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    const fetchListOfCollectionById = async () => {
        try {
            // const response = await axios.get(` http://localhost:8080/api/v1/collection/folder/${id}`);
            const response = await base_api.get(`/v1/collection/folder/${id}`);
            console.log(response.data);
            setListCollection(response.data);
        } catch (error) {
            console.error("Error fetching folder details:", error);
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            await fetchDetailFolderById();
            await fetchSets();
            await fetchListOfCollectionById();
        };
        fetchData();
    }, []);
    useEffect(() => {
        if (detailFolder) {
            setTitleFolder(detailFolder.title);
        }
    },[detailFolder]);
    const handleRedirectStudy=(setID)=>{
        console.log(setID);
        navigate(`/user/progress/set/${setID}`)
    }
    const handleRedirectView=(setID)=>{
        console.log(setID);
        navigate(`/user/set/detail/${setID}`)
    }
    return (
        <Box p={5}>
            <Modal show={showConfirmDelete} onHide={handleCloseConfirmDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure about removing this collection ? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleCloseConfirmDelete} variant="secondary">
                        Cancel
                    </Button>
                    <Button onClick={confirmRemoveCollection} variant="contained" color="error">
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
            {/*<button onClick={fetchDetailFolderById}>fetch</button>*/}
            <Modal show={showDetail} onHide={handleCloseDetail}>
                <Modal.Header closeButton>
                    <Modal.Title style={{fontSize: "20px", fontWeight: "700"}}>{titleFolder}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{maxHeight: "700px", padding: "10px", overflowY: "auto", overflowX: "hidden"}}>
                    <Box>
                        {
                            listSets?.length > 0 &&
                            listSets.map((item, index) => (
                                <div className="folder-item" key={index}>
                                    <div className="folder-item-left">
                                        <div style={{
                                            backgroundColor: "#eaf9ff",
                                            color: "#0e22e9",
                                            padding: "10px",
                                            borderRadius: "10px"
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                 viewBox="0 0 24 24"
                                                 fill="none"
                                                 stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                 stroke-linejoin="round"
                                                 className="icon icon-tabler icons-tabler-outline icon-tabler-cards">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                <path
                                                    d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304z"/>
                                                <path d="M15 4h1a1 1 0 0 1 1 1v3.5"/>
                                                <path
                                                    d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374"/>
                                            </svg>

                                        </div>
                                        <div className="info">
                                            <span className="title-card">{item.title}</span>
                                            <p>Course • {item.totalCard} terms • Author: {item.userName}</p>
                                        </div>
                                    </div>
                                    <div className="actions">
                                        <Button style={{
                                            backgroundColor: "white",
                                            width: "fit-content",
                                            height: "40px",
                                            color: "blue",
                                            boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.3)"
                                        }}
                                                onClick={() => handleAddSet(item.setId)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                 viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                 stroke-linejoin="round"
                                                 className="icon icon-tabler icons-tabler-outline icon-tabler-plus">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                <path d="M12 5l0 14"/>
                                                <path d="M5 12l14 0"/>
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        }
                    </Box>

                </Modal.Body>
            </Modal>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title style={{fontSize: "20px", fontWeight: "700"}}>Update title folder</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="text" placeholder="Title"
                           value={titleFolder}
                           style={{width: "100%", padding: "10px"}}
                           onChange={(e) => handleUpdateTitle(e)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={updateFolder}>
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showConfirm} onHide={handleCloseConfirm}>
                <Modal.Header closeButton>
                    <Modal.Title style={{fontSize: "20px", fontWeight: "700"}}>Are you sure about removing this folder ?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <Button onClick={handleCloseConfirm}>
                        Cancel
                    </Button>
                    <Button onClick={removeFolder} color="error">
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                <Box>
                    <h1>{detailFolder?.title}</h1>
                    <p className="last-edited">🕒 Update on {detailFolder?.updatedAt ?
                        format(new Date(detailFolder?.updatedAt), 'dd/MM/yyyy HH:mm:ss')
                        : ""}</p>
                </Box>
                <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "10px"}}>
                    <Button style={{backgroundColor: "white", width: "fit-content", height: "40px", color: "blue"}}
                            onClick={handleShowDetail}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             className="icon icon-tabler icons-tabler-outline icon-tabler-plus">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 5l0 14"/>
                            <path d="M5 12l14 0"/>
                        </svg>
                    </Button>
                    <Button style={{backgroundColor: "white", width: "fit-content", height: "40px", color: "orange"}}
                            onClick={handleShow}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             className="icon icon-tabler icons-tabler-outline icon-tabler-pencil">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/>
                            <path d="M13.5 6.5l4 4"/>
                        </svg>
                    </Button>
                    <Button style={{backgroundColor: "white", width: "fit-content", height: "40px", color: "red"}}
                            onClick={handleShowConfirm}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                             className="icon icon-tabler icons-tabler-outline icon-tabler-trash">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M4 7l16 0"/>
                            <path d="M10 11l0 6"/>
                            <path d="M14 11l0 6"/>
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
                        </svg>
                    </Button>
                </Box>
            </Box>
            {listCollection.length > 0 ?
                listCollection.map((item, index) => (
                    <div className="folder-item" key={index} >
                        <div className="folder-item-left" onClick={()=>handleRedirectView(item.setId)}>
                            <div style={{
                                backgroundColor: "#eaf9ff",
                                color: "#0e22e9",
                                padding: "10px",
                                borderRadius: "10px"
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                     stroke-linejoin="round"
                                     className="icon icon-tabler icons-tabler-outline icon-tabler-cards">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path
                                        d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304z"/>
                                    <path d="M15 4h1a1 1 0 0 1 1 1v3.5"/>
                                    <path
                                        d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374"/>
                                </svg>

                            </div>
                            <div className="info">
                                <span className="title-card">{item.setTitle}</span>
                                <p>Course • {item.totalCard} terms • Author: {item.userName}</p>
                            </div>
                        </div>
                        <div className="actions">
                            <button className="learn-button" onClick={()=>handleRedirectStudy(item.setId)}>Study</button>
                            <Button
                                style={{ border: "2px solid red", color: "red" }}
                                onClick={() => handleShowConfirmDelete(item.id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                )) :
                <Box sx={{display: "center", justifyContent: "center", marginTop: "100px", color: "gray"}}>
                    No data display
                </Box>
            }


        </Box>
    );
}

export default DetailFolder;
