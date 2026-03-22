/**
 * Run once: node backend/setDeptDescriptions.js
 * Sets default descriptions for departments that have none.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');

const descriptions = {
  'ict': 'Manages all information and communication technology infrastructure, software systems, network security, and digital tools that power the organization\'s operations.',
  'information technology': 'Manages all information and communication technology infrastructure, software systems, network security, and digital tools that power the organization\'s operations.',
  'it': 'Manages all information and communication technology infrastructure, software systems, network security, and digital tools that power the organization\'s operations.',
  'marketing': 'Drives brand awareness, customer acquisition, and market growth through strategic campaigns, digital marketing, content creation, and client engagement initiatives.',
  'sales': 'Handles client outreach, lead conversion, revenue generation, and maintains strong customer relationships to grow the organization\'s business portfolio.',
  'design': 'Creates visually compelling graphics, card layouts, branding materials, and digital assets that represent the organization\'s premium identity and client deliverables.',
  'finance': 'Oversees budgeting, financial reporting, payroll, invoicing, and ensures the organization\'s fiscal health and compliance with financial regulations.',
  'hr': 'Manages staff recruitment, onboarding, welfare, performance reviews, and ensures a positive and productive work environment across all departments.',
  'human resources': 'Manages staff recruitment, onboarding, welfare, performance reviews, and ensures a positive and productive work environment across all departments.',
  'operations': 'Coordinates day-to-day business activities, production workflows, logistics, and ensures all departments run efficiently and meet organizational goals.',
  'production': 'Handles the end-to-end production of cards and printed materials — from design handoff to printing, quality control, and final delivery to clients.',
  'customer service': 'Serves as the frontline for client communication, handling inquiries, complaints, feedback, and ensuring every customer has a seamless experience.',
  'admin': 'Provides administrative support across the organization, managing records, scheduling, correspondence, and ensuring smooth internal operations.',
  'administration': 'Provides administrative support across the organization, managing records, scheduling, correspondence, and ensuring smooth internal operations.',
  'logistics': 'Manages the movement, storage, and delivery of products and materials, ensuring timely dispatch and tracking of all client orders.',
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/companyDB');
  const depts = await Department.find({});
  let updated = 0;
  for (const dept of depts) {
    if (!dept.description) {
      const key = dept.name.toLowerCase().trim();
      const desc = descriptions[key];
      if (desc) {
        dept.description = desc;
        await dept.save();
        console.log(`✅ Updated: ${dept.name}`);
        updated++;
      } else {
        console.log(`⚠️  No preset description for: ${dept.name}`);
      }
    } else {
      console.log(`⏭️  Already has description: ${dept.name}`);
    }
  }
  console.log(`\nDone. ${updated} department(s) updated.`);
  mongoose.disconnect();
}

run().catch(console.error);
