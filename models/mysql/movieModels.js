import mysql from 'mysql2/promise';
import movies from '../../movies.json' with { type: 'json' };

const config = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'root',
    database: 'moviesdb'
}

const connection = await mysql.createConnection(config)

 

export class MovieModel {
    static async getAll() {
        // const [rows, metadata] = await connection.query(
        //     'SELECT *, BIN_TO_UUID(id) id FROM Movie;'
        // );
        // return metadata;
        const [rows] = await connection.query(
            'SELECT *, BIN_TO_UUID(id) id FROM Movie;'
        )
        return rows
    }

    static async getById({ id, fields }) {
        const selectedFields = fields ? fields.split(",").join(", ") : "*";

        const fieldsToQuery = selectedFields.includes("id")
        ? selectedFields.replace("id", "BIN_TO_UUID(id) AS id")
        : selectedFields;

        const [rows] = await connection.query(
             // Los "?" son placeholders que se reemplazan con los valores en el array [id]. Evitan los SQL Injection
            `SELECT ${fieldsToQuery} FROM Movie WHERE id = UUID_TO_BIN(?);`,
            [id]
        )

        if (rows.length === 0) throw new Error("Movie not found");
        
        return rows[0];
    }

    static async create ({ input }) {
        const {
            genre: genreInput,
            title,
            year,
            duration,
            director,
            rate,
            poster
        } = input
   
        const [uuidResult] = await connection.query('SELECT UUID() as uuid;');
        const [{ uuid }] = uuidResult;
    
        try {
            // Cambié la consulta a UUID_TO_BIN directamente
            await connection.query(
                `INSERT INTO Movie (id, title, year, director, duration, rate, poster, genre)
                 VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?);`,
                 [uuid, title, year, director, duration, rate, poster, genreInput]
            );
        } catch (error) {
            console.error(error);
            throw new Error("Error creating movie");
        }
        
        const [movies] = await connection.query(
            'SELECT title, year, director, duration, rate, poster, genre, BIN_TO_UUID(id) id FROM Movie WHERE id = UUID_TO_BIN(?);',
            [uuid]
        );
   
        return movies[0];
    }
   

    static async update ({ id, input }) {
        const fields = Object.keys(input).map(field => `${field} = ?`).join(', ');
        const values = Object.values(input);
        values.push(id);

        const [result] = await connection.query(
            `UPDATE Movie SET ${fields} WHERE id = UUID_TO_BIN(?);`,
            values
        );

        if (result.affectedRows === 0) throw new Error("Movie not found or no changes applied");

        return this.getById({ id });
    }

    static async delete ({ id }) {
        const [result] = await connection.query(
            'DELETE FROM Movie WHERE id = UUID_TO_BIN(?);',
            [id]
        )

        if (result.affectedRows === 0) throw new Error("Movie not found");

        return { message: "Movie deleted successfully" };
    }
}