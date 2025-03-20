import express, { json } from 'express';
import cors from 'cors';
import { moviesRouter } from './routes/moviesRoutes.js';

const port = 8080;
const app = express();


//Middlewares
app.use(json());
app.use(cors())

app.use('/movies', moviesRouter)


//GET Todas las Movies
// app.get('/movies', to do);

// // GET Movie en especifico
// app.get('/movies/:id', to do)

// //POST Nueva Movie
// app.post('/movies', to do)

// //PUT Editar Movie
// app.put('/movies/:id', to do);

// //DELETE Movie
// app.delete('/movies/:id', );

app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`)
})