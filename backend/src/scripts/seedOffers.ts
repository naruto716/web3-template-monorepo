import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Offer } from '../models/Offer';
import { User } from '../models/User';
import { Talent } from '../models/Talent';
import { ethers } from 'ethers';

dotenv.config();

async function seedOffers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Get some existing users and talents
    const employer = await User.findOne({ roles: 'employer' });
    const talents = await Talent.find().limit(3);

    if (!employer || talents.length === 0) {
      throw new Error('No employer or talents found. Please run seedUsers and seedTalents first.');
    }

    // Clear existing offers
    await Offer.deleteMany({});
    console.log('Cleared existing offers');

    const offers = [
      {
        jobDescription: "Build a DeFi protocol dashboard",
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-05-01'),
        totalWorkHours: 160,
        totalPay: ethers.parseEther("10").toString(),
        employerId: employer._id,
        talentId: talents[0]._id,
        status: 'waiting'
      },
      {
        jobDescription: "Smart contract security audit",
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-30'),
        totalWorkHours: 80,
        totalPay: ethers.parseEther("8").toString(),
        employerId: employer._id,
        talentId: talents[1]._id,
        status: 'accepted',
        workStartedAt: new Date('2024-04-15')
      },
      {
        jobDescription: "Develop NFT marketplace features",
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-06-30'),
        totalWorkHours: 320,
        totalPay: ethers.parseEther("25").toString(),
        employerId: employer._id,
        talentId: talents[2]._id,
        status: 'paid',
        paymentTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      },
      {
        jobDescription: "Backend API development",
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        totalWorkHours: 160,
        totalPay: ethers.parseEther("12").toString(),
        employerId: employer._id,
        talentId: talents[0]._id,
        status: 'finished',
        workStartedAt: new Date('2024-03-01'),
        workCompletedAt: new Date('2024-03-31'),
        paymentTxHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      },
      {
        jobDescription: "Smart Contract Development",
        startDate: new Date('2024-04-10'),
        endDate: new Date('2024-05-10'),
        totalWorkHours: 200,
        totalPay: ethers.parseEther("15").toString(),
        employerId: employer._id,
        talentId: talents[1]._id,
        status: 'working',
        workStartedAt: new Date('2024-04-10'),
        paymentTxHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
      }
    ];

    // Insert new offers
    const result = await Offer.insertMany(offers);
    console.log(`Inserted ${result.length} offers`);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding offers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedOffers(); 