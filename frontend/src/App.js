import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import RecipeTable from './components/RecipeTable';
import './App.css';

function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recipe Database
        </Typography>
        <RecipeTable />
      </Box>
    </Container>
  );
}

export default App;
