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

    static async getById({ id }) {

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

        const [uuidResult] = await connection.query('SELECT UUID() uuid;')
        const [{ uuid }] = uuidResult;
    
        const result = await connection.query(
            `INSERT INTO Movie (id, title, year, director, duration, rate, poster)
             VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);`,
             [uuid, title, year, director, duration, rate, poster]
        )

        const [movies] = await connection.query(
            'SELECT title, year, director, duration, rate, poster, BIN_TO_UUID(id) id FROM Movie WHERE id = BIN_TO_UUID(?)'
        )
    
    }

    static async update ({ id, input }) {

    }

    static async delete ({ id }) {

    }
}