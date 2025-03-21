import mysql from 'mysql2/promise'

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

    }

    static async update ({ id, input }) {

    }

    static async delete ({ id }) {

    }
}