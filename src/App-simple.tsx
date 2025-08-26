import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Card, CardContent, Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Opinion Admin Dashboard
        </Typography>
        
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Welcome to the Admin Interface
            </Typography>
            <Typography variant="body1">
              This is a simple test to ensure the React app is loading correctly.
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
              <Typography variant="body2">
                ✅ React is working
                <br />
                ✅ Material-UI is loaded
                <br />
                ✅ TypeScript is compiling
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default App;
