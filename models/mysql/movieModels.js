import mysql from 'mysql2/promise';

const config = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'root',
    database: 'moviesdb'
};

const connection = await mysql.createConnection(config);

export class MovieModel {
    static async getAll() {
        const [rows] = await connection.query(
            `
            SELECT 
                m.*, 
                BIN_TO_UUID(m.id) AS id, 
                GROUP_CONCAT(g.name ORDER BY g.name SEPARATOR ', ') AS genres
            FROM 
                Movie m
            LEFT JOIN 
                Movie_Genre mg ON m.id = mg.movie_id
            LEFT JOIN 
                Genre g ON mg.genre_id = g.id
            GROUP BY 
                m.id;
            `
        );
        return rows;
    }

    static async getById({ id, fields }) {
        const selectedFields = fields ? fields.split(",").join(", ") : "*";
        const fieldsToQuery = selectedFields.includes("id")
            ? selectedFields.replace("id", "BIN_TO_UUID(id) AS id")
            : selectedFields;

        const [rows] = await connection.query(
            `SELECT ${fieldsToQuery} FROM Movie WHERE id = UUID_TO_BIN(?);`,
            [id]
        );

        if (rows.length === 0) throw new Error("Movie not found");
        return rows[0];
    }

    static async create({ input }) {
        const { genre: genreInput, title, year, duration, director, rate, poster } = input;

        const [uuidResult] = await connection.query('SELECT UUID() as uuid;');
        const [{ uuid }] = uuidResult;

        try {
            await connection.query(
                `INSERT INTO Movie (id, title, year, director, duration, rate, poster)
                 VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);`,
                [uuid, title, year, director, duration, rate, poster]
            );

            if (Array.isArray(genreInput)) {
                for (const genreName of genreInput) {
                    const [genreRows] = await connection.query(
                        `SELECT id FROM Genre WHERE name = ?;`,
                        [genreName]
                    );

                    if (genreRows.length > 0) {
                        const genreId = genreRows[0].id;
                        await connection.query(
                            `INSERT INTO Movie_Genre (movie_id, genre_id)
                             VALUES (UUID_TO_BIN(?), ?);`,
                            [uuid, genreId]
                        );
                    }
                }
            }
        } catch (error) {
            console.error(error);
            throw new Error("Error creating movie");
        }

        const [movies] = await connection.query(
            `SELECT title, year, director, duration, rate, poster, BIN_TO_UUID(id) id 
             FROM Movie WHERE id = UUID_TO_BIN(?);`,
            [uuid]
        );

        return movies[0];
    }

    static async update({ id, input }) {
        const { genre: genreInput, ...rest } = input;
    
        if (Object.keys(rest).length > 0) {
            const fields = Object.keys(rest).map(field => `${field} = ?`).join(', ');
            const values = Object.values(rest);
            values.push(id);
    
            const [updateResult] = await connection.query(
                `UPDATE Movie SET ${fields} WHERE id = UUID_TO_BIN(?);`,
                values
            );
    
            if (updateResult.affectedRows === 0) throw new Error("Movie not found or no changes applied");
        }

        if (Array.isArray(genreInput)) {
            await connection.query(
                `DELETE FROM Movie_Genre WHERE movie_id = UUID_TO_BIN(?);`,
                [id]
            );
    
            for (const genreName of genreInput) {
                const [genreRows] = await connection.query(
                    `SELECT id FROM Genre WHERE name = ?;`,
                    [genreName]
                );
    
                if (genreRows.length > 0) {
                    const genreId = genreRows[0].id;
                    await connection.query(
                        `INSERT INTO Movie_Genre (movie_id, genre_id)
                         VALUES (UUID_TO_BIN(?), ?);`,
                        [id, genreId]
                    );
                }
            }
        }
    
        return this.getById({ id });
    }

    static async delete({ id }) {
        const [result] = await connection.query(
            'DELETE FROM Movie WHERE id = UUID_TO_BIN(?);',
            [id]
        );

        if (result.affectedRows === 0) throw new Error("Movie not found");
        return { message: "Movie deleted successfully" };
    }
}