import React, {useState, useEffect, useRef} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    IconButton,
    Typography,
    FormControlLabel,
    Switch,
    MenuItem,
    InputAdornment,
    TablePagination
} from '@mui/material';
import {Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon} from '@mui/icons-material';
import {toast} from "react-toastify";
import api from "src/apis/api.js";
import SearchIcon from '@mui/icons-material/Search';

function SetManagement() {
    const [categories, setCategories] = useState([{}]);
    const [setCards, setSetCards] = useState([{}]);
    const [openSetModal, setOpenSetModal] = useState(false);
    const [openDeleteSetModal, setOpenDeleteSetModal] = useState(false);
    const [openCardModal, setOpenCardModal] = useState(false);
    const [openDeleteCardModal, setOpenDeleteCardModal] = useState(false);
    const [selectedSet, setSelectedSet] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);

    const DEFAULT_PAGE = 0;
    const DEFAULT_ITEMS_PER_PAGE = 10;

    const [totalSets, setTotalSets] = useState(0);
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

    const setsTableRef = useRef(null);

    const [users, setUsers] = useState([]);

    const defaultSetInfo = {
        setId: 0,
        title: '',
        descriptionSet: '',
        createdAt: null,
        updatedAt: null,
        isApproved: null,
        isAnonymous: false,
        sharingMode: true,
        firstName: '',
        lastName: '',
        userName: '',
        userId: null,
        avatar: '',
        categoryId: 1,
        categoryName: '',
        totalCard: 0
    };

    const defaultCardInfo = {
        cardId: null,
        question: '',
        answer: '',
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const handleOpenSetModal = async (setCard = null) => {
        if (setCard) {
            setFormSetData({
                ...setCard,
                categoryId: categories.find((c) => setCard.categoryName === c.categoryName)?.categoryId || 1,
                tags: setCard.tags || ''
            });
            setSelectedSet(setCard);
        } else {
            setFormSetData(defaultSetInfo);
            setSelectedSet(null);
        }
        setOpenSetModal(true);
    };

    const handleOpenSetDeleteModal = async (setCard) => {
        setSelectedSet(setCard);
        setOpenDeleteSetModal(true);
    };

    const handleCloseSetModal = () => {
        setSelectedSet(null);
        setOpenSetModal(false);
    };

    const fetchUsers = async () => {
        try {
            const resListUsers = await api.get("/v1/users/data", { params: { page: 0, size: 1000 } });
            setUsers(Array.isArray(resListUsers.data?.content) ? resListUsers.data.content : []);
        } catch (error) {
            console.error(error);
            setUsers([]);
            toast.error("Failed to load list of users");
        }
    };

    const handleCloseSetDeleteModal = () => {
        setSelectedSet(null);
        setOpenDeleteSetModal(false);
    };

    const handleOpenCardModal = async (card = null) => {

    };

    const handleOpenCardDeleteModal = async (card) => {

    };

    const handleCloseCardModal = async () => {
    };

    const handleCloseCardDeleteModal = async () => {
    };

    const [formSetData, setFormSetData] = useState(defaultSetInfo);
    const [formCardData, setFormCardData] = useState(defaultCardInfo);

    const fetchCategories = async () => {
        try {
            const resListCategories = await api.get("/v1/category/list");
            setCategories(resListCategories.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load list of categories");
        }
    };

    const fetchSets = async ({ page, size }) => {
        try {
            const res = await api.get('/v1/set/data', {
                params: { page, size }
            });
            setSetCards(res.data.content);
            setTotalSets(res.data.totalElements);
        } catch (error) {
            console.error(error);
            setSetCards([]);
            setTotalSets(0);
            toast.error('Failed to load list of sets');
        }
    };

    const handleInputSetChange = (e) => {
        const {name, value} = e.target;
        setFormSetData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleInputCardChange = (e) => {
        const {name, value} = e.target;
        setFormCardData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const createSet = async (payload) => {
        await api.post(`/v1/set/create`, payload);
    };

    const updateSet = async (payload) => {
        await api.put(`/v1/set/update`, payload);
    };

    const deleteSet = async (id) => {
        await api.delete(`/v1/set/delete/${id}`);
    };

    const handleSubmitSet = async () => {
        try {
            const payload = {
                setId: formSetData.setId,
                title: formSetData.title,
                descriptionSet: formSetData.descriptionSet,
                isApproved: formSetData.isApproved,
                isAnonymous: formSetData.isAnonymous,
                sharingMode: formSetData.sharingMode,
                userId: formSetData.userId,
                categoryId: formSetData.categoryId,
                tagNames: formSetData.tags
            };

            let msg = "";

            if (selectedSet) {
                await updateSet(payload);
                msg = "Updated successfully";
            } else {
                await createSet(payload);
                msg = "Created successfully";
            }

            toast.success(msg);
            await fetchSets({ page: currentPage, size: rowsPerPage });
            handleCloseSetModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };

    const handleDeleteSet = async() => {
        try {
            await deleteSet(selectedSet.setId);
            await fetchSets({ page: currentPage, size: rowsPerPage });
            toast.success("Deleted successfully");
            handleCloseSetDeleteModal();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
        fetchSets({ page: newPage, size: rowsPerPage });
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(0);
        fetchSets({ page: 0, size: newRowsPerPage });
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeoutId = setTimeout(() => {
            fetchSets({
                page: currentPage,
                size: rowsPerPage,
                search: value.trim()
            });
        }, 2000);
        setSearchTimeout(timeoutId);
    };

    useEffect(() => {
        fetchCategories();
        fetchUsers();
        fetchSets({ page: currentPage, size: rowsPerPage });
    }, []);

    return (
        <Box sx={{
            p: 3,
            backgroundColor: '#f5f7fa',
            minHeight: '100vh'
        }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    pb: 2,
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <Typography variant="h5" component="h1" sx={{
                        fontWeight: 600,
                        color: '#1a237e'
                    }}>
                        Set Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={() => handleOpenSetModal()}
                        sx={{
                            backgroundColor: '#1a237e',
                            '&:hover': {
                                backgroundColor: '#0d47a1'
                            },
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        Add new set
                    </Button>
                </Box>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by title, description, user, category..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#fff',
                                '&:hover fieldset': {
                                    borderColor: '#1a237e',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#1a237e',
                                }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#1a237e' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                <TableContainer
                    component={Paper}
                    ref={setsTableRef}
                    sx={{
                        borderRadius: 2,
                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Anonymous</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Sharing Mode</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Creator Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>User ID</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Avatar</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Cards</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Tags</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Created</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Updated</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {setCards.map((s, index) => (
                                <TableRow
                                    key={s.setId || `set-${index}`}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f5f7fa'
                                        }
                                    }}
                                >
                                    <TableCell>{s.setId}</TableCell>
                                    <TableCell>{s.title}</TableCell>
                                    <TableCell>{s.descriptionSet || 'No description'}</TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            display: 'inline-block',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: s.isApproved ? '#e8f5e9' : '#fff3e0',
                                            color: s.isApproved ? '#2e7d32' : '#ef6c00',
                                            fontWeight: 500
                                        }}>
                                            {s.isApproved ? 'Approved' : 'Pending'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            display: 'inline-block',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: s.isAnonymous ? '#f3e5f5' : '#e3f2fd',
                                            color: s.isAnonymous ? '#7b1fa2' : '#1565c0',
                                            fontWeight: 500
                                        }}>
                                            {s.isAnonymous ? 'Anonymous' : 'Public'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            display: 'inline-block',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: s.sharingMode ? '#e8f5e9' : '#ffebee',
                                            color: s.sharingMode ? '#2e7d32' : '#c62828',
                                            fontWeight: 500
                                        }}>
                                            {s.sharingMode ? 'Public' : 'Private'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{s.firstName || s.lastName ? `${s.firstName || ''} ${s.lastName || ''}` : ''}</TableCell>
                                    <TableCell>{s.userName}</TableCell>
                                    <TableCell>{s.userId}</TableCell>
                                    <TableCell>
                                        {s.avatar ? (
                                            <Box component="img" src={s.avatar} alt="avatar" sx={{ width: 32, height: 32, borderRadius: '50%' }} />
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">No avatar</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{s.categoryName}</TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            display: 'inline-block',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: '#e3f2fd',
                                            color: '#1565c0',
                                            fontWeight: 500
                                        }}>
                                            {s.totalCard} cards
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {s.tags ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {s.tags.split(',').map((tag, idx) => (
                                                    <Box
                                                        key={idx}
                                                        sx={{
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            backgroundColor: '#f5f5f5',
                                                            color: '#616161',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        {tag.trim()}
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No tags</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenSetModal(s)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: '#e3f2fd'
                                                }
                                            }}
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleOpenSetDeleteModal(s)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: '#ffebee'
                                                }
                                            }}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={totalSets}
                    page={currentPage}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        mt: 2,
                        '.MuiTablePagination-select': {
                            borderRadius: 1
                        }
                    }}
                />
            </Paper>
            {/* Add/Edit Modal */}
            <Dialog
                open={openSetModal}
                onClose={handleCloseSetModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.15)'
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: '#f5f7fa',
                    borderBottom: '1px solid #e0e0e0',
                    pb: 2
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                        {selectedSet ? 'Edit Set' : 'Add New Set'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{pt: 2, display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)'}}>
                        <TextField
                            label="Title"
                            name="title"
                            value={formSetData.title}
                            onChange={handleInputSetChange}
                            sx={{gridColumn: '1 / -1', '& .MuiOutlinedInput-root': { borderRadius: 1 }}}
                            required
                        />
                        <TextField
                            label="Description set"
                            name="descriptionSet"
                            value={formSetData.descriptionSet}
                            onChange={handleInputSetChange}
                            sx={{gridColumn: '1 / -1', '& .MuiOutlinedInput-root': { borderRadius: 1 }}}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formSetData.isAnonymous}
                                    onChange={(e) => setFormSetData(prev => ({...prev, isAnonymous : e.target.checked}))}
                                    name="isAnonymous"
                                    color="primary"
                                />
                            }
                            label="Is anonymous"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formSetData.sharingMode}
                                    onChange={(e) => setFormSetData(prev => ({...prev, sharingMode: e.target.checked}))}
                                    name="sharingMode"
                                    color="primary"
                                />
                            }
                            label="Sharing mode"
                        />
                        <TextField
                            select
                            label="Category"
                            name="categoryId"
                            value={formSetData.categoryId}
                            onChange={(event) => {
                                const selectedCategoryId = Number(event.target.value);
                                const selectedCategory = categories.find((c) => c.categoryId === selectedCategoryId);
                                if (selectedCategory) {
                                    setFormSetData((prevState) => ({
                                        ...prevState,
                                        categoryId: selectedCategory.categoryId,
                                        categoryName: selectedCategory.categoryName,
                                    }));
                                }
                            }}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        >
                            {categories.map((c) => (
                                <MenuItem key={c.categoryId} value={c.categoryId}>
                                    {c.categoryName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Username"
                            name="userId"
                            value={formSetData.userId}
                            onChange={(event) => {
                                const selectedUserId = Number(event.target.value);
                                const selectedUsername = (Array.isArray(users) ? users : []).find((u) => u.userId === selectedUserId);
                                if (selectedUsername) {
                                    setFormSetData((prevState) => ({
                                        ...prevState,
                                        userId: selectedUsername.userId,
                                        userName: selectedUsername.username,
                                    }));
                                }
                            }}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        >
                            {(Array.isArray(users) ? users : []).map((user) => (
                                <MenuItem key={user.userId} value={user.userId}>
                                    {user.username}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Tags (comma separated)"
                            name="tags"
                            value={formSetData.tags}
                            onChange={handleInputSetChange}
                            sx={{ gridColumn: '1 / -1', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button
                        onClick={handleCloseSetModal}
                        sx={{
                            color: '#666',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitSet}
                        variant="contained"
                        sx={{
                            backgroundColor: '#1a237e',
                            '&:hover': {
                                backgroundColor: '#0d47a1'
                            },
                            borderRadius: 1,
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        {selectedSet ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation Modal */}
            <Dialog
                open={openDeleteSetModal}
                onClose={handleCloseSetDeleteModal}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.15)'
                    }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: '#ffebee',
                    borderBottom: '1px solid #ffcdd2',
                    pb: 2
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#c62828' }}>
                        Confirm Delete
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography>
                        Are you sure you want to delete set card: <strong>{selectedSet?.title}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button
                        onClick={handleCloseSetDeleteModal}
                        sx={{
                            color: '#666',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteSet}
                        color="error"
                        variant="contained"
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SetManagement;