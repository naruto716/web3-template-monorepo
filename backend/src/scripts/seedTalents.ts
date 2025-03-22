import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Talent } from '../models/Talent';
import { ethers } from 'ethers';

dotenv.config();

const talents = [
  {
    name: "John Doe",
    description: "Full Stack Blockchain Developer",
    skills: [
      {
        name: ".NET",
        hourlyRate: ethers.parseEther("0.1").toString(),
        yearsOfExperience: 5
      },
      {
        name: "Solidity",
        hourlyRate: ethers.parseEther("0.15").toString(),
        yearsOfExperience: 3
      }
    ],
    availability: true,
    experience: "expert",
    location: "New York",
    walletAddress: "0x1234567890123456789012345678901234567890"
  },
  {
    name: "Jane Smith",
    description: "Smart Contract Developer",
    skills: [
      {
        name: "Solidity",
        hourlyRate: ethers.parseEther("0.2").toString(),
        yearsOfExperience: 4
      },
      {
        name: "Rust",
        hourlyRate: ethers.parseEther("0.18").toString(),
        yearsOfExperience: 2
      }
    ],
    availability: true,
    experience: "intermediate",
    location: "London",
    walletAddress: "0x2345678901234567890123456789012345678901"
  },
  {
    name: "Bob Wilson",
    description: ".NET Developer",
    skills: [
      {
        name: ".NET",
        hourlyRate: ethers.parseEther("0.08").toString(),
        yearsOfExperience: 6
      },
      {
        name: "Azure",
        hourlyRate: ethers.parseEther("0.09").toString(),
        yearsOfExperience: 4
      }
    ],
    availability: false,
    experience: "expert",
    location: "Berlin",
    walletAddress: "0x3456789012345678901234567890123456789012"
  }
];

async function seedTalents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing talents
    await Talent.deleteMany({});
    console.log('Cleared existing talents');

    // Insert new talents
    const result = await Talent.insertMany(talents);
    console.log(`Inserted ${result.length} talents`);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding talents:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedTalents(); 