const router = require("express").Router();
const { getSeats, bookSeat } = require("./handlers");

const delay = (delay) => {
  return new Promise((res, rej) => {
    setTimeout(res, delay);
  });
}

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

// ----------------------------------
//////// HELPERS
const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

const randomlyBookSeats = (num) => {
  const bookedSeats = {};

  while (num > 0) {
    const row = Math.floor(Math.random() * NUM_OF_ROWS);
    const seat = Math.floor(Math.random() * SEATS_PER_ROW);

    const seatId = `${getRowName(row)}-${seat + 1}`;

    bookedSeats[seatId] = true;

    num--;
  }

  return bookedSeats;
};

let state;

router.get("/api/seat-availability", async (req, res) => {
    try {
      if (!state) {
        state = {
          bookedSeats: randomlyBookSeats(30),
        };
      }
    
      let seats = await getSeats();
    
      return res.status(200).json({
        seats: seats,
        bookedSeats: state.bookedSeats,
        numOfRows: 8,
        seatsPerRow: 12,
      });
    } catch(err) {
      console.log(err);
      res.status(404).json({ status: 404, err });
    }
});

let lastBookingAttemptSucceeded = false;

router.post("/api/book-seat", async (req, res) => {
  const { seatId, creditCard, expiration } = req.body;

  if (!state) {
    state = {
      bookedSeats: randomlyBookSeats(30),
    };
  }

  const isAlreadyBooked = !!state.bookedSeats[seatId];
  if (isAlreadyBooked) {
    return res.status(400).json({
      message: "This seat has already been booked!",
    });
  }

  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  if (lastBookingAttemptSucceeded) {
    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    return res.status(500).json({
      message: "An unknown error has occurred. Please try your request again.",
    });
  }

  lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;
  
  try {
    await bookSeat(seatId);
    return res.status(200).json({
      status: 200,
      success: true,
    });
  } catch(err) {
    return res.status(500).json({
      status: 500,
      success: false,
    });
  }

});

module.exports = router;
