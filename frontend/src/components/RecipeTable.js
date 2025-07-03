import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Drawer, Typography, Box, Grid, Rating, IconButton, TablePagination,
  TextField, Stack
} from '@mui/material';
import { Star } from '@mui/icons-material';

const RecipeTable = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    title: '',
    calories: '',
    rating: ''
  });

  useEffect(() => {
    fetchRecipes();
  }, [page, rowsPerPage, searchParams]);

  const fetchRecipes = async () => {
    try {
      setError(null);
      let queryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage
      });

      // Add search parameters if they exist
      if (searchParams.title) queryParams.append('title', searchParams.title);
      if (searchParams.calories) queryParams.append('calories', searchParams.calories);
      if (searchParams.rating) queryParams.append('rating', searchParams.rating);

      const response = await fetch(`http://localhost:5000/recipes/search?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await response.json();
      if (data.success) {
        setRecipes(data.recipes || []);
        setTotalRecipes(data.count || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch recipes');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError(error.message);
      setRecipes([]);
      setTotalRecipes(0);
    }
  };

  const handleSearchChange = (field) => (event) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(0); // Reset to first page when search changes
  };

  const handleRowClick = (recipe) => {
    setSelectedRecipe(recipe);
    setDrawerOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Title"
          variant="outlined"
          size="small"
          value={searchParams.title}
          onChange={handleSearchChange('title')}
          placeholder="Search by title"
        />
        <TextField
          label="Calories"
          variant="outlined"
          size="small"
          value={searchParams.calories}
          onChange={handleSearchChange('calories')}
          placeholder="e.g. >=400"
        />
        <TextField
          label="Rating"
          variant="outlined"
          size="small"
          value={searchParams.rating}
          onChange={handleSearchChange('rating')}
          placeholder="e.g. >=3"
        />
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="recipe table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Cuisine</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Total Time</TableCell>
              <TableCell>Serves</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <TableRow
                  key={recipe.id}
                  hover
                  onClick={() => handleRowClick(recipe)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{
                    maxWidth: 200,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {recipe.title}
                  </TableCell>
                  <TableCell>{recipe.cuisine}</TableCell>
                  <TableCell>
                    <Rating
                      value={recipe.rating}
                      readOnly
                      precision={0.5}
                      icon={<Star fontSize="inherit" />}
                    />
                  </TableCell>
                  <TableCell>{recipe.total_time} mins</TableCell>
                  <TableCell>{recipe.serves}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {error ? 'Error loading recipes' : 'No recipes found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalRecipes}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[15, 25, 50]} // Updated to start with 10
      />
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '40%' } }}
      >
        {selectedRecipe && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {selectedRecipe.title} - {selectedRecipe.cuisine}
            </Typography>

            <Typography variant="body1" gutterBottom>
              Description: {selectedRecipe.description}
            </Typography>

            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Time Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>Prep Time: {selectedRecipe.prep_time} mins</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>Cook Time: {selectedRecipe.cook_time} mins</Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Nutrition Information
              </Typography>
              <TableContainer component={Paper} sx={{ my: 1 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Calories</TableCell>
                      <TableCell>{selectedRecipe.nutrients.calories}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Carbohydrates</TableCell>
                      <TableCell>{selectedRecipe.nutrients.carbs}g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Protein</TableCell>
                      <TableCell>{selectedRecipe.nutrients.protein}g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Fat</TableCell>
                      <TableCell>{selectedRecipe.nutrients.fat}g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Fiber</TableCell>
                      <TableCell>{selectedRecipe.nutrients.fiber}g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sugar</TableCell>
                      <TableCell>{selectedRecipe.nutrients.sugar}g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sodium</TableCell>
                      <TableCell>{selectedRecipe.nutrients.sodium}mg</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cholesterol</TableCell>
                      <TableCell>{selectedRecipe.nutrients.cholesterol}mg</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default RecipeTable;