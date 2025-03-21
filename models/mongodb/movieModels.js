import movies from '../../movies.json' with { type: 'json' }
import { randomUUID } from 'node:crypto';

// Clase que encapsula la logica de acceso a los datos de las peliculas

export class MovieModel {
    
    // Devuelve todas las peliculas
    static async getAll() {
        return movies;
    }

    // Busca una película por su ID
    static async getById({ id }) {
        const movie = movies.find((movie) => movie.id === id);
        if (!movie) throw new Error("Movie not found");
        return movie;
    }

    // Crea una nueva pelicula con un ID unico generado por randomUUID
    static async create({ input }) {
        const newMovie = {
            id: randomUUID(),
            ...input
        }
        movies.push(newMovie)
        return newMovie;
    }

    // Actualiza una película existente
    static async update({id, input}) {
        const movieIndex = movies.findIndex((movie) => movie.id === id);
        if (movieIndex === -1) throw new Error("Movie not found");

        const updatedMovie = {
            ...movies[movieIndex],
            ...input,
        };

        movies[movieIndex] = updatedMovie;
        return updatedMovie;
    }

    // Elimina una película.
    static async delete({ id }) {
        const movieIndex = movies.findIndex((movie) => movie.id === id);
        if (movieIndex === -1) throw new Error("Movie not found");

        movies.splice(movieIndex, 1);
        return { message: "Movie deleted" };
    }
}