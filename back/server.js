const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

const PORT = 5000;
const DATA_FILE = "./data.json";
const MEDICAL_FILE = "./medical_details.json";
const APPOINTMENT_FILE = "./appointment.json";

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Ensure 3   data files exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}
if (!fs.existsSync(MEDICAL_FILE)) {
  fs.writeFileSync(MEDICAL_FILE, "[]");
}

if (!fs.existsSync(APPOINTMENT_FILE)) {
  fs.writeFileSync(APPOINTMENT_FILE, "[]");
}

// ✅ Route to handle basic patient info submission
app.post("/submit", (req, res) => {
  const newEntry = req.body;

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data file" });

    let existing = [];
    try {
      existing = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ message: "Corrupted data file" });
    }

    existing.push(newEntry);

    fs.writeFile(DATA_FILE, JSON.stringify(existing, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing to data file" });
      res.status(200).json({ message: "Data saved successfully" });
    });
  });
});

// ✅ Get all basic patients
app.get("/patients", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    try {
      const parsed = JSON.parse(data || "[]");
      res.json(parsed);
    } catch {
      res.status(500).json({ message: "Invalid JSON format" });
    }
  });
});

// ✅ Route to handle medical details submission
app.post("/medical_details", (req, res) => {
  console.log("🔔 Incoming request to /medical_details");

  const newEntry = req.body;
  console.log("📦 Received data:", newEntry);

  fs.readFile(MEDICAL_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("❌ Error reading medical_details.json:", err);
      return res.status(500).json({ message: "Error reading file" });
    }

    let existing = [];
    try {
      existing = JSON.parse(data);
    } catch (parseErr) {
      console.error("❌ JSON parsing error:", parseErr);
      return res.status(500).json({ message: "Corrupted JSON file" });
    }

    existing.push(newEntry);

    fs.writeFile(MEDICAL_FILE, JSON.stringify(existing, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("❌ Error writing to medical_details.json:", writeErr);
        return res.status(500).json({ message: "Failed to write data" });
      }

      console.log("✅ Medical details saved.");
      res.status(200).json({ message: "Medical details saved!" });
    });
  });
});



// POST route to store appointment data
app.post("/appointment", (req, res) => {
  const newAppt = req.body;

  fs.readFile(APPOINTMENT_FILE, "utf8", (err, data) => {
    const existing = data ? JSON.parse(data) : [];
    existing.push({ ...newAppt, status: "pending" }); // status added

    fs.writeFile(APPOINTMENT_FILE, JSON.stringify(existing, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving appointment");
      res.status(200).json({ message: "Appointment saved" });
    });
  });
});

app.get("/appointment", (req, res) => {
  fs.readFile(APPOINTMENT_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading appointments");
    res.json(JSON.parse(data));
  });
});


// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at: http://localhost:${PORT}`);
});
