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
    MenuItem, TablePagination
} from '@mui/material';
import {Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon} from '@mui/icons-material';
import {toast} from "react-toastify";
import api from "src/apis/api.js";

function CategorySetManagement() {
    const [categories, setCategories] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        categoryId: null,
        categoryName: '',
    });

    const DEFAULT_PAGE = 0;
    const DEFAULT_ITEMS_PER_PAGE = 10;

    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

    const categoriesTableRef = useRef(null);

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
        categoriesTableRef.current && (categoriesTableRef.current.style.opacity = "0.5");
        categoriesTableRef.current && (categoriesTableRef.current.style.pointerEvents = "none");
        fetchCategories({
            page: newPage,
            size: rowsPerPage,
        }).finally(() => {
            categoriesTableRef.current && (categoriesTableRef.current.style.opacity = "1");
            categoriesTableRef.current && (categoriesTableRef.current.style.pointerEvents = "auto");
        });
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(DEFAULT_PAGE);
        categoriesTableRef.current && (categoriesTableRef.current.style.opacity = "0.5");
        categoriesTableRef.current && (categoriesTableRef.current.style.pointerEvents = "none");
        fetchCategories({
            page: DEFAULT_PAGE,
            size: newRowsPerPage,
        }).finally(() => {
            categoriesTableRef.current && (categoriesTableRef.current.style.opacity = "1");
            categoriesTableRef.current && (categoriesTableRef.current.style.pointerEvents = "auto");
        });
    };

    const fetchCategories = async ({page, size}) => {
        try {
            const resListCategories = await api.get("/v1/category/list-pagination", {
                params: {
                    page: page,
                    size: size,
                }
            });
            setCategories(resListCategories.data.content);
            setTotalElements(resListCategories.data.totalElements);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load list of categories");
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setFormData({
                categoryId: category.categoryId,
                categoryName: category.categoryName,
            });
            setSelectedCategory(category);
        } else {
            setFormData({
                categoryId: null,
                categoryName: '',
            });
            setSelectedCategory(null);
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedCategory(null);
        setFormData({
            categoryId: null,
            categoryName: '',
        });
    };

    const handleOpenDeleteModal = (category) => {
        setSelectedCategory(category);
        setOpenDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false);
        setSelectedCategory(null);
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const beforeSubmit = (payload) => {
        let error = "";
        if (!payload) {
            toast.error("Cannot have data");
            throw new Error();
        }
        if ((error = !payload.categoryName?.trim() && "You do not input category")) {
            toast.error(`Error category: ${error}`);
            throw new Error();
        }
    }

    const updateCategory = async (payload) => {
        await api.put("/v1/category/update", payload);
    };

    const createCategory = async (payload) => {
        await api.post("/v1/category/create", payload);
    };

    const deleteCategory = async (id) => {
        await api.delete(`/v1/category/delete/${id}`);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
            };

            beforeSubmit(payload);

            let msg = "";

            if (selectedCategory) {
                await updateCategory(payload);
                msg = "Updated successfully";
            } else {
                await createCategory(payload);
                msg = "Created successfully";
            }

            toast.success(msg);
            await fetchCategories({
                page: currentPage,
                size: rowsPerPage,
            });
            handleCloseModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error("Operation failed");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCategory(selectedCategory.categoryId);
            await fetchCategories({
                page: currentPage,
                size: rowsPerPage,
            });
            toast.success("Deleted successfully");
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error("Delete failed");
        }
    };

    useEffect(() => {
        fetchCategories({
            page: DEFAULT_PAGE,
            size: DEFAULT_ITEMS_PER_PAGE,
        });
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
                        Category Set Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={() => handleOpenModal()}
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
                        Add new category
                    </Button>
                </Box>

                <TableContainer 
                    component={Paper} 
                    ref={categoriesTableRef}
                    sx={{
                        borderRadius: 2,
                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Category Name</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow 
                                    key={category.categoryId}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f5f7fa'
                                        }
                                    }}
                                >
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
                                            {category.categoryName}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenModal(category)}
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
                                            onClick={() => handleOpenDeleteModal(category)}
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
                    count={totalElements}
                    page={currentPage}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
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
                open={openModal}
                onClose={handleCloseModal}
                maxWidth="sm"
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
                        {selectedCategory ? 'Edit Category' : 'Add New Category'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{pt: 2}}>
                        <TextField
                            label="Category Name"
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button 
                        onClick={handleCloseModal}
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
                        onClick={handleSubmit} 
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
                        {selectedCategory ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog 
                open={openDeleteModal} 
                onClose={handleCloseDeleteModal}
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
                        Are you sure you want to delete category: <strong>{selectedCategory?.categoryName}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button 
                        onClick={handleCloseDeleteModal}
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
                        onClick={handleDelete} 
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

export default CategorySetManagement;