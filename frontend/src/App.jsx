import React from "react";
import { Container, Typography, Box } from "@mui/material";
import LiquidityPoolForm from "./components/LiquidityPoolForm";
function App() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Stellar Swap
        </Typography>
        <LiquidityPoolForm />
      </Box>
    </Container>
  );
}
export default App;
