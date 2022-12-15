const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const url = process.env.MONGODB_URI;
console.log("connecting to", url);

// url  mongodb+srv://fullstack:<password>@cluster0.eusd4.mongodb.net/<dbname>?retryWrites=true&w=majority

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: [true, "name is required"],
    unique: true,
  },
  number: {
    type: String,
    minlength: 8,
    required: [true, "number is required"],
    unique: true,
    validate: {
      validator: (value) => value.replace(/[^0-9]/g, "").length >= 8,
    },
  },
});

personSchema.plugin(uniqueValidator);
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
