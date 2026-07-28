import React, { useEffect, useState, useCallback } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Chip, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from 'src/apis/api';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import Avatar from '@mui/material/Avatar';

const FolderManagement = () => {
  const [folders, setFolders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    folderId: '', 
    userId: ''
  });
  const [search, setSearch] = useState('');

  const fetchFolders = async (params = {}) => {
    try {
      const res = await api.get('/v1/admin/folders', { params });
      if (res.data.success) {
        setFolders(res.data.data || []);
      } else {
        toast.error(res.data.message || 'Failed to load folder list!');
      }
    } catch (error) {
      toast.error('Failed to load folder list!');
    }
  };

  useEffect(() => { fetchFolders(); }, []);

  const handleOpenModal = (folder = null) => {
    setEditing(folder);
    if (folder) {
      setForm({
        title: folder.title || '',
        folderId: folder.folderId || '',
        userId: folder.userId || ''
      });
    } else {
      setForm({ 
        title: '', 
        folderId: '', 
        userId: '' 
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.warning('Folder name is required!');
      return;
    }
    if (!form.userId || isNaN(Number(form.userId))) {
      toast.warning('User ID is required and must be a number!');
      return;
    }

    try {
      const requestData = {
        title: form.title,
        userId: Number(form.userId)
      };

      if (editing && editing.folderId) {
        const response = await api.put(`/v1/admin/folders/${editing.folderId}`, requestData);
        if (response.data.success) {
          toast.success('Folder updated successfully!');
          setOpenModal(false);
          fetchFolders();
        } else {
          toast.error(response.data.message || 'Update failed!');
        }
      } else {
        const response = await api.post('/v1/admin/folders', requestData);
        if (response.data.success) {
          toast.success('Folder created successfully!');
          setOpenModal(false);
          fetchFolders();
        } else {
          toast.error(response.data.message || 'Creation failed!');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred! Please try again later.');
    }
  };

  const handleDeleteClick = (folder) => {
    setSelectedFolder(folder);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(`/v1/admin/folders/${selectedFolder.folderId}`);
      if (response.data.success) {
        toast.success('Folder deleted successfully!');
        setOpenDeleteDialog(false);
        fetchFolders();
      } else {
        toast.error(response.data.message || 'Delete failed!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed!');
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm.trim()) {
        fetchFolders();
        return;
      }

      try {
        const params = {
          title: searchTerm,
          page: 0,
          size: 10
        };

        const res = await api.get('/v1/admin/folders/search', { params });
        if (res.data.success) {
          setFolders(res.data.data || []);
          if (res.data.data?.length === 0) {
            toast.info('No matching results found');
          }
        } else {
          toast.error(res.data.message || 'Failed to search folder!');
        }
      } catch (error) {
        toast.error('Failed to search folder!');
      }
    }, 2000),
    []
  );

  useEffect(() => {
    debouncedSearch(search);
    return () => {
      debouncedSearch.cancel();
    };
  }, [search, debouncedSearch]);

  const getRandomColor = (str) => {
    const colors = [
      '#2196F3', // Blue
      '#4CAF50', // Green
      '#FF9800', // Orange
      '#9C27B0', // Purple
      '#F44336', // Red
      '#00BCD4', // Cyan
      '#FFEB3B', // Yellow
      '#795548', // Brown
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box p={3}>
      <Paper
        sx={{
          p: 3,
          backgroundColor: '#f7f8fa',
          borderRadius: 3,
          boxShadow: '0 2px 12px 0 rgba(44,62,80,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#23235b' }}>
            Folder Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              background: '#23235b',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 2px 8px 0 rgba(44,62,80,0.08)',
            }}
          >
            Add Folder
          </Button>
        </Box>
        <TextField
          fullWidth
          placeholder="Search by title, user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="medium"
          sx={{
            borderRadius: 3,
            background: '#fff',
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              background: '#f7f8fa',
              fontSize: 16,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#23235b' }} />
              </InputAdornment>
            ),
          }}
        />
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', background: '#fff' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#f7f8fa' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>User ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Updated</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#23235b' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {folders.map((folder) => (
                <TableRow key={folder.folderId} sx={{ '&:hover': { background: '#f5f6fa' } }}>
                  <TableCell sx={{ color: '#23235b', fontWeight: 500 }}>{folder.folderId}</TableCell>
                  <TableCell>
                    <Chip
                      label={folder.title}
                      sx={{
                        background: '#e3eafd',
                        color: '#23235b',
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={folder.userId}
                      sx={{
                        background: '#e0f7fa',
                        color: '#00796b',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#23235b' }}>{new Date(folder.createdAt).toLocaleString()}</TableCell>
                  <TableCell sx={{ color: '#23235b' }}>{new Date(folder.updatedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenModal(folder)} sx={{ color: '#1976d2' }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(folder)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>{editing ? 'Edit Folder' : 'Add Folder'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!form.title.trim()}
                  helperText={!form.title.trim() ? 'Title is required' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="User ID"
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                  required
                  error={!form.userId}
                  helperText={!form.userId ? 'User ID is required' : ''}
                />
              </Grid>
              {editing && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At: {new Date(form.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Updated At: {new Date(form.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              color="primary"
              disabled={!form.title.trim()}
            >
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Delete Folder</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this folder?</Typography>
            <Typography fontWeight={600} color="error.main">{selectedFolder?.title}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" startIcon={<DeleteIcon />}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default FolderManagement; 