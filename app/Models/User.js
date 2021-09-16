const client = require('../database');
const jwt = require('jsonwebtoken');
const setQuerySave = require('../service/setQuerySave');

class User {

     constructor(obj={}) {
        for (const propName in obj) {
            this[propName] = obj[propName];
        }
    }

    static async findAll(){
        try {
            const {rows} = await client.query('SELECT * FROM "user"');
            return rows.map(row => new User(row));
        } catch (error) {
            throw error;
        }
    }

     static async findOne(id) {
        try {
            const {rows} = await client.query('SELECT * FROM "user" WHERE id=$1', [id]);
            return new User(rows[0]);
        } catch (error) {
            throw error;
        }
    }

    static async delete(id){
        try {
            await client.query('DELETE FROM "user" WHERE id=$1', [id]);
            return true;
        } catch (error) {
            throw error;
        }
    }

    async login(){
        const identifier = Object.keys(this).find(e=>e!=='password');

        const queryDb = {
            text: `SELECT * FROM "user" WHERE ${identifier}=$1`,
            values: [this[identifier]]
        };

        try {
            const {rows} = await client.query(queryDb);

            if(rows[0]){
                if(this.password === rows[0].password){
                    const access_token = jwt.sign(rows[0], process.env.SECRET, { expiresIn: '60s' });

                    const refresh_token = jwt.sign(rows[0], process.env.REFRESH_SECRET, { expiresIn: '1y' })
                    
                    return {
                        isadmin : rows[0].isadmin,
                        access_token,
                        refresh_token
                    }
                }else{
                    throw new Error('Wrong password');
                }
            }else{
                throw new Error('No user found');
            }
        } catch (error) {
            throw error;
        }
    }

    async save(){
        const queryDb = setQuerySave(this, 'user');
        try {
            const {rows} = await client.query(queryDb);
            const token = jwt.sign({
                id: rows[0].id,
                isadmin: rows[0].isadmin
            }, process.env.SECRET, { expiresIn: '24 hours' });
            
            return {
                pseudo: rows[0].pseudo,
                isadmin: rows[0].isadmin,
                access_token: token 
            }
        } catch (error) {
            throw error;
        }
    }

    async newToken(){
        const queryDb = {
            text: `SELECT * FROM "user" WHERE id=$1`,
            values: [this.id]
        };

        try {
            const {rows} = await client.query(queryDb);
            
            if(!rows[0]){
                throw new Error('User no longer exist')
            }

            if(rows[0].pseudo === this.pseudo && rows[0].password === this.password && rows[0].email === this.email && rows[0].isadmin === this.isadmin && rows[0].avatar === this.avatar){
                const access_token = jwt.sign(rows[0], process.env.SECRET, { expiresIn: '24 hours' });
                return {
                    isadmin: rows[0].isadmin,
                    access_token
                }
            }
        } catch (error) {
            throw error;
        }

    }
}

module.exports = User;