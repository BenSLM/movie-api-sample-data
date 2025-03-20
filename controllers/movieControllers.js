import { MovieModel } from "../models/movieModels.js";
import { validateMovie, validatePartialMovie } from '../schemas/moviesSchema.js';

export class MovieController {
  
    static async getAll(req, res) {
    try {
      const movies = await MovieModel.getAll();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    const { fields } = req.query;

    try {
      const movie = await MovieModel.getById({ id });

      if (movie.genre && Array.isArray(movie.genre)) {
        movie.genre = movie.genre.join(", ");
      }

      if (!fields) return res.json(movie);

      const selectedFields = fields.split(",");
      const filteredMovie = selectedFields.reduce((acc, field) => {
        if (movie[field] !== undefined) {
          acc[field] = movie[field];
        }
        return acc;
      }, {});
      res.json(filteredMovie);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  static async create(req, res) {
    const result = validateMovie(req.body);
  
    if (result.error)
      return res.status(400).json({ error: JSON.parse(result.error.message) });
  
    try {
      const newMovie = await MovieModel.create({ input: result.data });
      res.status(201).json(newMovie);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    const result = validatePartialMovie(req.body);
  
    if (!result.success)
      return res.status(400).json({ error: JSON.parse(result.error.message) });
  
    const { id } = req.params;
    try {
      const updatedMovie = await MovieModel.update({
        id,
        input: result.data
      });
  
      res.status(200).json(updatedMovie);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      const result = await MovieModel.delete({ id });
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}
