import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Talent } from '../models/Talent';
import { User, UserRole } from '../models/User';
import { ethers } from 'ethers';

dotenv.config();

async function seedTalents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing talents
    await Talent.deleteMany({});
    console.log('Cleared existing talents');

    // Create or find users for talents
    const users = await Promise.all([
      User.findOne({ walletAddress: "0xa4aa70a49461b5fa3726a88f90fca2a6a56fe9cf" }),
      User.findOne({ walletAddress: "0xe6dc71a74f9223763520d5ae7d28bf9883336dd4" }),
      User.findOne({ walletAddress: "0xd8d3eac5a5361dbc60fcb8abd200467998804810" })
    ]);

    if (!users[0] || !users[1] || !users[2]) {
      throw new Error('Required users not found');
    }

    const talents = [
      {
        userId: users[0]._id,
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
        walletAddress: users[0].walletAddress,
        imageUrl: "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg?semt=ais_hybrid"
      },
      {
        userId: users[1]._id,
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
        walletAddress: users[1].walletAddress,
        imageUrl: "https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869153.jpg?semt=ais_hybrid"
      },
      {
        userId: users[2]._id,
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
        walletAddress: users[2].walletAddress,
        imageUrl: "https://img.freepik.com/free-vector/gradient-avatar-illustration_52683-142426.jpg?semt=ais_hybrid"
      }
    ];

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