'use strict';

const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
    try {
        const client = await MongoClient(MONGO_URI, options);
        await client.connect();

        const db = client.db('ticket_booker');
        const seats = await db.collection('seats').find().toArray();

        let transformedSeatObj = seats.reduce((prev, curr) => {
            const {_id, price, isBooked} = curr;
            prev[_id] = {price, isBooked};
            return prev;
        }, {});

        client.close();
        return transformedSeatObj;

    } catch(err) {
        console.log(err);
    }
};

module.exports = { getSeats };
