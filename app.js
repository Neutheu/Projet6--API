const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect('mongodb+srv://Projet6_OC:Mcpelb1997@cluster0.wt2tyx3.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res) => {
   res.json({ message: 'Votre requête a bien été reçue !' }); 
});


app.use('/api/auth', userRoutes);

module.exports = app;