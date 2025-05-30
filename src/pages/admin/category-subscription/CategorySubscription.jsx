import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import api from 'src/apis/api';
import { useSnackbar } from 'notistack';

const CategorySubscription = () => {
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: 0, description: '', maxSetsPerDay: 0, maxSetsFlashcards: 0, maxFlashcardsPerSet: 0, maxRoomsCreatePerDay: 0, maxTermsPerRoom: 0, expiredMonth: 0 });
  const { enqueueSnackbar } = useSnackbar();

  const fetchCategories = async () => {
    try {
      const res = await api.get('/v1/category-subscription/all-subscriptions');
      setCategories(res.data.data || res.data || []);
    } catch (error) {
      enqueueSnackbar('Lỗi khi tải danh sách!', { variant: 'error' });
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenModal = (cat = null) => {
    setEditing(cat);
    setForm(cat
      ? {
          name: cat.name || '',
          price: cat.price || 0,
          description: cat.description || '',
          maxSetsPerDay: cat.maxSetsPerDay || 0,
          maxSetsFlashcards: cat.maxSetsFlashcards || 0,
          maxFlashcardsPerSet: cat.maxFlashcardsPerSet || 0,
          maxRoomsCreatePerDay: cat.maxRoomsCreatePerDay || 0,
          maxTermsPerRoom: cat.maxTermsPerRoom || 0,
          expiredMonth: cat.expiredMonth || 0,
          id: cat.id
        }
      : { name: '', price: 0, description: '', maxSetsPerDay: 0, maxSetsFlashcards: 0, maxFlashcardsPerSet: 0, maxRoomsCreatePerDay: 0, maxTermsPerRoom: 0, expiredMonth: 0 }
    );
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

  const validateForm = () => {
    if (!form.name.trim()) {
      enqueueSnackbar('Tên category không được để trống!', { variant: 'warning' });
      return false;
    }
    if (form.price < 0) {
      enqueueSnackbar('Giá không được âm!', { variant: 'warning' });
      return false;
    }
    if (form.maxSetsPerDay < 0 || form.maxSetsFlashcards < 0 || form.maxFlashcardsPerSet < 0 || 
        form.maxRoomsCreatePerDay < 0 || form.maxTermsPerRoom < 0 || form.expiredMonth < 0) {
      enqueueSnackbar('Các giới hạn không được âm!', { variant: 'warning' });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      maxSetsPerDay: Number(form.maxSetsPerDay),
      maxSetsFlashcards: Number(form.maxSetsFlashcards),
      maxFlashcardsPerSet: Number(form.maxFlashcardsPerSet),
      maxRoomsCreatePerDay: Number(form.maxRoomsCreatePerDay),
      maxTermsPerRoom: Number(form.maxTermsPerRoom),
      expiredMonth: Number(form.expiredMonth)
    };

    try {
      if (editing && editing.id) {
        const response = await api.put(`/v1/category-subscription/admin/update/${editing.id}`, payload);
        if (response.data.success) {
          enqueueSnackbar('Cập nhật thành công!', { variant: 'success' });
          setOpenModal(false);
          fetchCategories();
        } else {
          enqueueSnackbar(response.data.message || 'Cập nhật thất bại!', { variant: 'error' });
        }
      } else {
        const response = await api.post('/v1/category-subscription/admin/create', payload);
        if (response.data.success) {
          enqueueSnackbar('Tạo mới thành công!', { variant: 'success' });
          setOpenModal(false);
          fetchCategories();
        } else {
          enqueueSnackbar(response.data.message || 'Tạo mới thất bại!', { variant: 'error' });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar(
        error.response?.data?.message || 
        'Có lỗi xảy ra! Vui lòng thử lại sau.', 
        { variant: 'error' }
      );
    }
  };

  const handleDeleteClick = (cat) => {
    setSelectedCategory(cat);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/v1/category-subscription/admin/delete/${selectedCategory.id}`);
      enqueueSnackbar('Xóa thành công!', { variant: 'success' });
      setOpenDeleteDialog(false);
      fetchCategories();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Xóa thất bại!', { variant: 'error' });
      console.error(error);
    }
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
            Category Subscription Management
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
            Add Category
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', background: '#fff' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#f7f8fa' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Max Sets/Day</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Max Sets Flashcards</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Max Flashcards/Set</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Max Rooms/Day</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Max Terms/Room</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#23235b' }}>Expired (Month)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#23235b' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id} sx={{ '&:hover': { background: '#f5f6fa' } }}>
                  <TableCell sx={{ color: '#23235b', fontWeight: 500 }}>{cat.name}</TableCell>
                  <TableCell>
                    <Chip label={`$${cat.price}`} sx={{ bgcolor: '#e3eafd', color: '#23235b', fontWeight: 500 }} />
                  </TableCell>
                  <TableCell>{cat.description}</TableCell>
                  <TableCell>{cat.maxSetsPerDay}</TableCell>
                  <TableCell>{cat.maxSetsFlashcards}</TableCell>
                  <TableCell>{cat.maxFlashcardsPerSet}</TableCell>
                  <TableCell>{cat.maxRoomsCreatePerDay}</TableCell>
                  <TableCell>{cat.maxTermsPerRoom}</TableCell>
                  <TableCell>
                    <Chip label={cat.expiredMonth} sx={{ bgcolor: '#e0f7fa', color: '#00796b', fontWeight: 500 }} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenModal(cat)} sx={{ color: '#1976d2' }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(cat)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogContent>
            <TextField 
              label="Name" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              fullWidth 
              margin="normal"
              required
              error={!form.name.trim()}
              helperText={!form.name.trim() ? 'Tên category là bắt buộc' : ''}
            />
            <TextField 
              label="Price" 
              name="price" 
              value={form.price} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              type="number"
              required
              error={form.price < 0}
              helperText={form.price < 0 ? 'Giá không được âm' : ''}
            />
            <TextField 
              label="Description" 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              fullWidth 
              margin="normal"
              multiline
              rows={2}
            />
            <TextField 
              label="Max Sets/Day" 
              name="maxSetsPerDay" 
              value={form.maxSetsPerDay} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              type="number"
              required
              error={form.maxSetsPerDay < 0}
              helperText={form.maxSetsPerDay < 0 ? 'Giá trị không được âm' : ''}
            />
            <TextField 
              label="Max Sets Flashcards" 
              name="maxSetsFlashcards" 
              value={form.maxSetsFlashcards} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              type="number"
              required
              error={form.maxSetsFlashcards < 0}
              helperText={form.maxSetsFlashcards < 0 ? 'Giá trị không được âm' : ''}
            />
            <TextField 
              label="Max Flashcards/Set" 
              name="maxFlashcardsPerSet" 
              value={form.maxFlashcardsPerSet} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              type="number"
              required
              error={form.maxFlashcardsPerSet < 0}
              helperText={form.maxFlashcardsPerSet < 0 ? 'Giá trị không được âm' : ''}
            />
            <TextField 
              label="Max Rooms/Day" 
              name="maxRoomsCreatePerDay" 
              value={form.maxRoomsCreatePerDay} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              type="number"
              required
              error={form.maxRoomsCreatePerDay < 0}
              helperText={form.maxRoomsCreatePerDay < 0 ? 'Giá trị không được âm' : ''}
            />
            <TextField 
              label="Max Terms/Room" 
              name="maxTermsPerRoom" 
              value={form.maxTermsPerRoom} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              type="number"
              required
              error={form.maxTermsPerRoom < 0}
              helperText={form.maxTermsPerRoom < 0 ? 'Giá trị không được âm' : ''}
            />
            <TextField 
              label="Expired (Month)" 
              name="expiredMonth" 
              value={form.expiredMonth} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              type="number"
              required
              error={form.expiredMonth < 0}
              helperText={form.expiredMonth < 0 ? 'Giá trị không được âm' : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={openDeleteDialog} 
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: {
              width: '400px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'error.main',
            fontWeight: 600
          }}>
            <DeleteIcon color="error" />
            Delete Category
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Are you sure you want to delete this category?
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'error.lighter',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'error.light'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.dark' }}>
                {selectedCategory?.name}
              </Typography>
              <Typography variant="body2" color="error.dark" sx={{ mt: 0.5 }}>
                This action cannot be undone. All associated data will be permanently deleted.
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button 
              onClick={() => setOpenDeleteDialog(false)}
              variant="outlined"
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              startIcon={<DeleteIcon />}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                px: 3
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default CategorySubscription; 