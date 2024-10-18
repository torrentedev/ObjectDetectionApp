const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Sirve los archivos estáticos de la aplicación React
app.use(express.static(path.join(__dirname, 'client/build')));

// Maneja todas las rutas para que sean manejadas por React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
