// Dependencies;
// =============
const express = require("express");
const path = require("path");
const util = require("util");
const fs = require("fs");

// Notes Array;
// =============
const notesArray = path.join(__dirname, "db/db.json");

// Utilities
// =============
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Express;
// =============
const app = express();
// - Dynamic Port;
const PORT = process.env.PORT || 3000;
// - Listener;
app.listen(PORT, function () {
	console.log("Server listening on: http://localhost:" + PORT);
});

// - Data parsing;
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// - API Route;
app.get("/api/notes", function (req, res) {
	readFile(notesArray, "utf8")
		.then((data) => res.json(JSON.parse(data)))
		.catch((err) => {
			console.log(err);
		});
});

// - Express Routes;
app.get("/", function (req, res) {
	res.json(path.join(__dirname, "public/index.html"));
});
app.get("/notes", function (req, res) {
	res.sendFile(path.join(__dirname, "public/notes.html"));
});
app.get("*", function (req, res) {
	res.sendFile(path.join(__dirname, "public/index.html"));
});

// Post;
// =============
app.post("/api/notes", function (req, res) {
	// - Notes Array;
	const notes = JSON.parse(fs.readFileSync("./db/db.json"));
	// - New Note; push;
	const newNote = { ...req.body };
	notes.push(newNote);
	// Assign index number;
	newNote.id = notes.indexOf(newNote);
	// Update db.json;
	writeFile("./db/db.json", JSON.stringify(notes, null, 2)).then(() => {
		res.json(notesArray);
	});
});

// Delete;
// =============
app.delete("/api/notes/:id", function (req, res) {
	// - ID of the note clicked;
	const deletedNote = parseInt(req.params.id);
	readFile(notesArray, "utf8").then((data) => {
		let notes = JSON.parse(data);
		// - Find the ID; delete;
		notes = notes.filter((newNote) => newNote.id !== deletedNote);
		writeFile(notesArray, JSON.stringify(notes));
		res.json({
			isError: false,
			message: "Note successfully deleted",
			port: PORT,
			status: 200,
			success: true,
		});
	});
});
