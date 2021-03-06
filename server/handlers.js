'use strict';
const assert = require("assert");
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

const bookSeat = async (_id, email, fullName) => {
    try {
        const client = await MongoClient(MONGO_URI, options);
        await client.connect();

        const db = client.db('ticket_booker');
        const r = await db.collection("seats").updateOne({ _id }, {$set: {isBooked: true, email, fullName}});
        assert.equal(1, r.matchedCount);
        assert.equal(1, r.modifiedCount);

        client.close();

    } catch(err) {
        console.log(err);
    }
}

module.exports = { getSeats, bookSeat };
