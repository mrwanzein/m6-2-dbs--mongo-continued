const { MongoClient } = require("mongodb");
const assert = require("assert");

require("dotenv").config({ path: '../.env'});
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const seats = [];
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    let _id = `${row[r]}-${s}`;
    seats.push({
        _id,
        price: 225,
        isBooked: false,
    })
  }
}

const migrateSeatsToMDB = async () => {
    try {
        const client = await MongoClient(MONGO_URI, options);
        await client.connect();

        const db = client.db('ticket_booker');
        const r = await db.collection('seats').insertMany(seats);
        assert.equal(seats.length, r.insertedCount);

        client.close();
        console.log("Data sent");
    } catch(err) {
        console.log(err);
    }
}

migrateSeatsToMDB();
