const mongoose = require('mongoose');
const ClientProject = require('./models/ClientProject');

const MONGO_URI = "mongodb://localhost:27017/companyDB";

async function testDeduction() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Create a dummy project
    const project = new ClientProject({
      companyName: "Test Co " + Date.now(),
      planType: "Retainership",
      totalCardsPaid: 1000,
      cardsUsed: 0,
      dateReceived: new Date(),
      dateStarted: new Date(),
      status: "Designed"
    });
    await project.save();
    console.log("Project created:", project._id);

    // 2. Perform deduction using the same logic as admin.js
    const p = await ClientProject.findById(project._id);
    const addCardsUsed = 50;
    const deductionNote = "Test Note";

    if (addCardsUsed) {
      const amount = Number(addCardsUsed);
      p.cardsUsed += amount;
      if (!p.deductionHistory) p.deductionHistory = [];
      p.deductionHistory.push({
        amount,
        note: deductionNote || '',
        date: new Date(),
        performedBy: 'Admin'
      });
    }

    const saved = await p.save();
    console.log("Resulting cardsUsed:", saved.cardsUsed);
    console.log("Resulting deductionHistory length:", saved.deductionHistory.length);
    
    if (saved.deductionHistory.length > 0) {
      console.log("SUCCESS: Deduction recorded in history.");
    } else {
      console.log("FAILURE: Deduction NOT recorded.");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
}

testDeduction();
