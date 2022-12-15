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
      validator: (v) => {
        if (!v.includes("-")) {
          return /^\d+$/.test(v);
        }
        return /^\d{2}-\d+$/.test(v) || /^\d{3}-\d+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid number`,
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
