const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        required_error: 'Movie title is required. Please check URL or Body',
        invalid_type_error: 'Movie title must be a string'
    }),
    year: z.number().int().positive().min(1900).max(2030),
    director: z.string(),
    duration: z.number().int().positive(),
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(z.enum([
        "Drama", 
        "Action", 
        "Crime", 
        "Romance", 
        "Adventure", 
        "Sci-Fi", 
        "Animation", 
        "Biography", 
        "Fantasy"
      ]), {
        required_error: 'Movie genre is required.',
        invalid_type_error: 'Movie genre must be an array of enum Genre'
      }),
    rate: z.number().min(1).max(10).default(1)
})

function validateMovie(object) {
    return movieSchema.safeParse(object)
}

//Partial hace que las validaciones que las propiedades que pusimos arriba las hace opcionales
//De manera de que si no esta o no se actualiza no pasa nada. 
function validatePartialMovie(input) {
    return movieSchema.partial().safeParse(input)
}

module.exports = { validateMovie,  validatePartialMovie }