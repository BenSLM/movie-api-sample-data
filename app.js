const express = require('express');
const app = express();
const crypto = require('node:crypto');
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/moviesSchema');
const movies = require('./movies.json');
const port = 8080;

app.use(express.json());
app.use(cors())

//GET Todas las Movies
app.get('/movies',(req, res) => {
    res.json(movies);
})

// GET Movie en especifico
app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const { fields } = req.query
    
    const movie = movies.find(movie => movie.id === id)
    if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
    }
    
    //Si no se detectan campos, devuelve la pelicula completa
    if (!fields) return res.json(movie)

    //Filtrando con campos solicitados QUERY PARAMS
    const selectedFields = fields.split(',')
    const filteredMovie = selectedFields.reduce((acc, field) => {
        if (movie[field] !== undefined) {
            if (field === 'genre' && Array.isArray(movie[field])) {
                acc[field] = movie[field].join(', ')
            } else {
                acc[field] = movie[field]
            }
        }
        return acc;
    }, {})
    res.json(filteredMovie);
})

//POST Nueva Movie
app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)
    
    if (result.error) return res.status(400).json({ error: JSON.parse(result.error.message) })

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(newMovie)

    res.status(200).json(newMovie)
})

app.put('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
    
    if (!result.success) return res.status(400).json({ error: JSON.parse(result.error.message)})
        
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found'})

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.status(200).json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found'})

    movies.splice(movieIndex, 1)

    return res.status(200).json({ message: 'Movie deleted' })

});

app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`)
})