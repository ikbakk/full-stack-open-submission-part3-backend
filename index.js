require("dotenv").config();

const morgan = require("morgan");
const cors = require("cors");
const { response } = require("express");
const express = require("express");
const app = express();

const Person = require("./models/persons");

app.use(cors());
app.use(express.static("dist"));
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      req.method === "POST" ? JSON.stringify(req.body) : "",
    ].join(" ");
  })
);
app.use(express.json());

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      console.log("get/api/persons", persons);
      res.json(persons.map((person) => person.toJSON()));
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res, next) => {
  Person.countDocuments({})
    .then((count) => {
      let info = `<p>Phonebook has info for ${count} people</p>`;
      info += new Date();
      res.send(info);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const updatedPerson = {
    name: req.body.name,
    number: req.body.number,
  };
  Person.findByIdAndUpdate(req.params.id, updatedPerson, { new: true })
    .then((result) => {
      res.json(result);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const newPerson = new Person({
    name: req.body.name,
    number: req.body.number,
  });

  newPerson
    .save()
    .then((response) => {
      res.json(response);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  console.log(id, typeof id);

  Person.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log("errorHandler called");

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
