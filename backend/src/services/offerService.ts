import { Offer, IOffer } from '../models/Offer';
import mongoose from 'mongoose';
import logger from '../utils/logger';

interface CreateOfferData {
  jobDescription: string;
  startDate: Date;
  endDate: Date;
  totalWorkHours: number;
  totalPay: string;
  employerId: string;
  talentId: string;
}

interface UpdateOfferData {
  status?: 'waiting' | 'accepted' | 'paid' | 'working' | 'finished';
  paymentTxHash?: string;
}

export const createOffer = async (data: CreateOfferData): Promise<IOffer> => {
  try {
    const offer = new Offer(data);
    await offer.save();
    return offer;
  } catch (error) {
    logger.error('Error in createOffer service:', error);
    throw error;
  }
};

export const updateOffer = async (
  offerId: string,
  data: UpdateOfferData,
): Promise<IOffer | null> => {
  try {
    const offer = await Offer.findOne({
      _id: offerId,
    });

    if (!offer) {
      return null;
    }

    Object.assign(offer, data);
    await offer.save();
    return offer;
  } catch (error) {
    logger.error('Error in updateOffer service:', error);
    throw error;
  }
};

export const getOfferById = async (offerId: string): Promise<IOffer | null> => {
  try {
    return await Offer.findById(offerId)
      .populate('employerId', 'name walletAddress')
      .populate('talentId', 'name walletAddress');
  } catch (error) {
    logger.error('Error in getOfferById service:', error);
    throw error;
  }
};

export const getAllOffers = async (
  page: number = 1,
  limit: number = 10
): Promise<{ offers: IOffer[]; total: number }> => {
  try {
    const [offers, total] = await Promise.all([
      Offer.find()
        .populate('employerId', 'walletAddress')
        .populate('talentId', 'walletAddress')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Offer.countDocuments()
    ]);

    logger.info('Offers query result:', {
      offersCount: offers.length
    });

    return { offers, total };
  } catch (error) {
    logger.error('Error in getAllOffers service:', error);
    throw error;
  }
}; 