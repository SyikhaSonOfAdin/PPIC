const mysql = require('mysql2/promise');

class Access {
    #pool;

    constructor(database) {
        this.#pool = mysql.createPool({
            connectionLimit: 25,
            queueLimit: 20,
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: database,
        });
    }

    async getConnection() {
        return await this.#pool.getConnection();
    }
}
const PPIC = new Access(process.env.DATABASE)
module.exports = { PPIC }
