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
    TablePagination,
    InputAdornment,
} from '@mui/material';
import {Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon} from '@mui/icons-material';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider, DatePicker} from '@mui/x-date-pickers';
import dayjs from "dayjs";
import {toast} from "react-toastify";
import {MuiTelInput} from 'mui-tel-input';
import api from "src/apis/api.js";
import {validateEmail, validateName, validatePassword, validateUsername} from "src/utils/validate.js";

function UserManagement() {
    const DEFAULT_PAGE = 0;
    const DEFAULT_ITEMS_PER_PAGE = 10;

    const [totalElements, setTotalElements] = useState(100);
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

    const usersTableRef = useRef(null);

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
        usersTableRef.current && (usersTableRef.current.style.opacity = "0.5");
        usersTableRef.current && (usersTableRef.current.style.pointerEvents = "none");
        
        if (searchQuery.trim()) {
            searchUsers({
                page: newPage,
                size: rowsPerPage,
                search: searchQuery.trim()
            }).finally(() => {
                usersTableRef.current && (usersTableRef.current.style.opacity = "1");
                usersTableRef.current && (usersTableRef.current.style.pointerEvents = "auto");
            });
        } else {
            fetchUsers({
                page: newPage,
                size: rowsPerPage
            }).finally(() => {
                usersTableRef.current && (usersTableRef.current.style.opacity = "1");
                usersTableRef.current && (usersTableRef.current.style.pointerEvents = "auto");
            });
        }
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(DEFAULT_PAGE);
        usersTableRef.current && (usersTableRef.current.style.opacity = "0.5");
        usersTableRef.current && (usersTableRef.current.style.pointerEvents = "none");
        
        if (searchQuery.trim()) {
            searchUsers({
                page: DEFAULT_PAGE,
                size: newRowsPerPage,
                search: searchQuery.trim()
            }).finally(() => {
                usersTableRef.current && (usersTableRef.current.style.opacity = "1");
                usersTableRef.current && (usersTableRef.current.style.pointerEvents = "auto");
            });
        } else {
            fetchUsers({
                page: DEFAULT_PAGE,
                size: newRowsPerPage
            }).finally(() => {
                usersTableRef.current && (usersTableRef.current.style.opacity = "1");
                usersTableRef.current && (usersTableRef.current.style.pointerEvents = "auto");
            });
        }
    };

    const [users, setUsers] = useState([{}]);

    const [roles, setRoles] = useState([]); // Assuming you'll fetch roles from API

    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        userId: null,
        address: '',
        avatar: '',
        dateOfBirth: null,
        email: '',
        enabled: true,
        username: '',
        password: '',
        gender: true,
        phoneNumber: '',
        userCode: '',
        firstName: '',
        lastName: '',
        roleId: null,
        roleName: '',
    });

    const [errors, setErrors] = useState({});

    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;

    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.firstName) {
            newErrors.firstName = "First name is required";
        } else if (!nameRegex.test(formData.firstName)) {
            newErrors.firstName = "First name must not contain special characters";
        }
        if (!formData.lastName) {
            newErrors.lastName = "Last name is required";
        } else if (!nameRegex.test(formData.lastName)) {
            newErrors.lastName = "Last name must not contain special characters";
        }
        if (!formData.username) newErrors.username = "Username is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.password && !selectedUser) newErrors.password = "Password is required";
        if (!formData.roleId) newErrors.roleId = "Role is required";
        // Validate date of birth
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required";
        } else if (!dayjs(formData.dateOfBirth).isBefore(dayjs(), 'day')) {
            newErrors.dateOfBirth = "Date of birth must be in the past";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fetchRoles = async () => {
        try {
            const resListRoles = await api.get("/v1/roles");
            setRoles(resListRoles.data);
            console.log(roles);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load list of roles");
        }
    };

    const fetchUsers = async ({page, size}) => {
        try {
            const resListUsers = await api.get("/v1/users/data", {
                params: {
                    page: page,
                    size: size,
                }
            });
            setUsers(resListUsers.data.content);
            setTotalElements(resListUsers.data.totalElements);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to load list of users");
        }
    };

    const searchUsers = async ({page, size, search}) => {
        try {
            const resListUsers = await api.get("/v1/users/search", {
                params: {
                    page: page,
                    size: size,
                    username: search,
                    email: search,
                    fullName: search,
                    phoneNumber: search,
                    role: search
                }
            });
            setUsers(resListUsers.data.content);
            setTotalElements(resListUsers.data.totalElements);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to search users");
        }
    };

    // Fetch roles and users from API
    useEffect(() => {
        fetchRoles();
        fetchUsers({page: DEFAULT_PAGE, size: DEFAULT_ITEMS_PER_PAGE});
    }, []);

    const handleSearch = (value) => {
        setSearchQuery(value);
        
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout
        const timeoutId = setTimeout(() => {
            if (value.trim()) {
                searchUsers({
                    page: currentPage,
                    size: rowsPerPage,
                    search: value.trim()
                });
            } else {
                fetchUsers({
                    page: currentPage,
                    size: rowsPerPage
                });
            }
        }, 3000); // 3 seconds debounce

        setSearchTimeout(timeoutId);
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setFormData({
                ...user,
                roleId: user.roleId || null,
            });
            setSelectedUser(user);
        } else {
            setFormData({
                userId: null,
                address: '',
                avatar: '',
                dateOfBirth: null,
                email: '',
                enabled: true,
                username: '',
                password: '',
                gender: true,
                phoneNumber: '',
                userCode: '',
                firstName: '',
                lastName: '',
                roleId: null,
                roleName: '',
            });
            setSelectedUser(null);
        }
        setErrors({});
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedUser(null);
    };

    const handleOpenDeleteModal = (user) => {
        setSelectedUser(user);
        setOpenDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false);
        setSelectedUser(null);
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
        console.log("In payload...");
        if ((error = validateName(payload.firstName))) {
            toast.error(`Error first name: ${error}`);
            throw new Error();
        }
        console.log(error);
        if ((error = validateName(payload.lastName))) {
            toast.error(`Error last name: ${error}`);
            throw new Error();
        }
        if ((error = validateUsername(payload.username))) {
            toast.error(`Error username: ${error}`);
            throw new Error();
        }
        if ((error = validateEmail(payload.email))) {
            toast.error(`Error email: ${error}`);
            throw new Error();
        }
        if (payload.password && (error = validatePassword(payload.password))) {
            toast.error(`Error password: ${error}`);
            throw new Error();
        }
        if ((error = !payload.roleId && "You do not choose role")) {
            toast.error(`Error role: ${error}`);
            throw new Error();
        }
    }

    const updateUser = async (payload) => {
        try {
            await api.put(`/v1/users/update-user/${selectedUser.userId}`, payload);
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error(error.response?.data?.message || "Failed to update user");
        }
    };

    const createUser = async (payload) => {
        try {
            await api.post("/v1/users/create-user", payload);
        } catch (error) {
            console.log('Error creating user:', error);
            throw new Error(error.response?.data?.message || "Failed to create user");
        }
    };

    const deleteUser = async (id) => {
        try {
            await api.delete(`/v1/users/delete-user/${id}`);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error(error.response?.data?.message || "Failed to delete user");
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        try {
            const payload = {
                ...formData,
            };

            beforeSubmit(payload);

            let msg = "";

            if (selectedUser) {
                // Call API to update user
                const updatePayload = {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    username: payload.username,
                    phoneNumber: payload.phoneNumber,
                    address: payload.address,
                    dateOfBirth: payload.dateOfBirth,
                    gender: payload.gender,
                    enabled: payload.enabled,
                    roleId: payload.roleId,
                    // Only include password if it's not empty
                    ...(payload.password && { password: payload.password })
                };
                await updateUser(updatePayload);
                msg = "Updated successfully";
            } else {
                // Call API to create user
                const createPayload = {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    username: payload.username,
                    password: payload.password,
                    phoneNumber: payload.phoneNumber,
                    address: payload.address,
                    dateOfBirth: payload.dateOfBirth,
                    gender: payload.gender,
                    enabled: payload.enabled,
                    roleId: payload.roleId
                };
                await createUser(createPayload);
                msg = "Created successfully";
            }

            toast.success(msg);
            // Refresh users list with current pagination and search
            if (searchQuery.trim()) {
                await searchUsers({
                    page: currentPage,
                    size: rowsPerPage,
                    search: searchQuery.trim()
                });
            } else {
                await fetchUsers({
                    page: currentPage,
                    size: rowsPerPage
                });
            }
            handleCloseModal();
            setErrors({});
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || "Operation failed");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteUser(selectedUser.userId);
            // Refresh users list with current pagination and search
            if (searchQuery.trim()) {
                await searchUsers({
                    page: currentPage,
                    size: rowsPerPage,
                    search: searchQuery.trim()
                });
            } else {
                await fetchUsers({
                    page: currentPage,
                    size: rowsPerPage
                });
            }
            toast.success("Deleted successfully");
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || "Failed to delete user");
        }
    };

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
                        User Management
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
                        Add User
                    </Button>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search users by name, email, username, phone or role..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <TableContainer 
                    component={Paper} 
                    ref={usersTableRef}
                    sx={{
                        borderRadius: 2,
                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Full Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Birthdate</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow 
                                    key={user.userId}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f5f7fa'
                                        }
                                    }}
                                >
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.firstName || user.lastName ?
                                        `${user.firstName || ''} ${user.lastName || ''}` : 'Not set'}</TableCell>
                                    <TableCell>{`${!user.dateOfBirth ? 'Not set' : dayjs(user.dateOfBirth).format("MM/DD/YYYY")}`}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phoneNumber ?? 'Not set'}</TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            display: 'inline-block',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: user.roleName === 'ADMIN' ? '#e3f2fd' : '#f3e5f5',
                                            color: user.roleName === 'ADMIN' ? '#1565c0' : '#7b1fa2',
                                            fontWeight: 500
                                        }}>
                                            {user.roleName ? user.roleName : 'Unknown role'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            display: 'inline-block',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: user.enabled ? '#e8f5e9' : '#ffebee',
                                            color: user.enabled ? '#2e7d32' : '#c62828',
                                            fontWeight: 500
                                        }}>
                                            {user.enabled ? 'Active' : 'Inactive'}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenModal(user)}
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
                                            onClick={() => handleOpenDeleteModal(user)}
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
                open={openModal}
                onClose={handleCloseModal}
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
                        {selectedUser ? 'Edit User' : 'Add New User'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{pt: 2, display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)'}}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <MuiTelInput
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange({
                                target: {
                                    name: 'phoneNumber',
                                    value: e,
                                }
                            })}
                            label="Phone Number"
                            name="phoneNumber"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <TextField
                            select
                            label="Role"
                            name="roleId"
                            value={formData.roleId || ''}
                            onChange={(event) => {
                                const selectedRoleId = Number(event.target.value);
                                const selectedRole = roles.find((role) => role.roleId === selectedRoleId);
                                if (selectedRole) {
                                    setFormData((prevState) => ({
                                        ...prevState,
                                        roleId: selectedRole.roleId,
                                        roleName: selectedRole.roleName,
                                    }));
                                }
                            }}
                            required
                            error={!!errors.roleId}
                            helperText={errors.roleId}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.roleId} value={role.roleId}>
                                    {role.roleName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Date of Birth"
                                value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                                maxDate={dayjs().subtract(1, "day")}
                                onChange={(newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        dateOfBirth: newValue ? newValue.format("YYYY-MM-DD") : null
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        error={!!errors.dateOfBirth}
                                        helperText={errors.dateOfBirth}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1
                                            }
                                        }}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                        <TextField
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            sx={{
                                gridColumn: '1 / -1',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                            error={!!errors.username}
                            helperText={errors.username}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            sx={{
                                gridColumn: '1 / -1',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type={!showPassword ? "password" : "text"}
                            onChange={handleInputChange}
                            required={!selectedUser}
                            placeholder={selectedUser ? '**************' : ''}
                            sx={{
                                gridColumn: '1 / -1',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.enabled}
                                    onChange={(e) => setFormData(prev => ({...prev, enabled: e.target.checked}))}
                                    name="enabled"
                                    color="primary"
                                />
                            }
                            label="Enabled"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.gender}
                                    onChange={(e) => setFormData(prev => ({...prev, gender: e.target.checked}))}
                                    name="gender"
                                    color="primary"
                                />
                            }
                            label="Gender"
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
                        {selectedUser ? 'Update' : 'Add'}
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
                        Are you sure you want to delete user: <strong>{selectedUser?.username}</strong>?
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

export default UserManagement;