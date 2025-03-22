import { Request, Response } from 'express';
import { AuthRequest } from '../../utils/auth';
import * as offerService from '../../services/offerService';
import logger from '../../utils/logger';
import { UserRole } from '../../models/User';
import { Talent } from '../../models/Talent';

export const createOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobDescription, startDate, endDate, totalWorkHours, totalPay, talentId } = req.body;
    const employerId = req.user!.id;

    const offer = await offerService.createOffer({
      jobDescription,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalWorkHours,
      totalPay,
      employerId,
      talentId
    });

    res.status(201).json({
      status: 201,
      data: offer
    });
  } catch (error) {
    console.error('Detailed error:', error);
    logger.error('Error in createOffer controller:', {
      error: error,
      stack: error instanceof Error ? error.stack : undefined,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({
      status: 500,
      error: error instanceof Error ? error.message : 'Failed to create offer'
    });
  }
};

export const updateOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentTxHash } = req.body;

    const offer = await offerService.updateOffer(id, { status, paymentTxHash });

    if (!offer) {
      res.status(404).json({
        status: 404,
        error: 'Offer not found or access denied'
      });
      return;
    }

    res.status(200).json({
      status: 200,
      data: offer
    });
  } catch (error) {
    logger.error('Error in updateOffer controller:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to update offer'
    });
  }
};

export const getOfferById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const offer = await offerService.getOfferById(id);

    if (!offer) {
      res.status(404).json({
        status: 404,
        error: 'Offer not found'
      });
      return;
    }

    res.status(200).json({
      status: 200,
      data: offer
    });
  } catch (error) {
    logger.error('Error in getOfferById controller:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to retrieve offer'
    });
  }
};

export const getAllOffers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let query = {};

    // Filter based on user role
    if (user.roles.includes(UserRole.EMPLOYER)) {
      query = { employerId: user.id };
    } else if (user.roles.includes(UserRole.PROFESSIONAL)) {
      // Find talent by userId
      const talent = await Talent.findOne({ userId: user.id });
      if (talent) {
        query = { talentId: talent._id };
      }
    }

    const { page = 1, limit = 10 } = req.query;
    const offers = await offerService.getAllOffers(
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      status: 200,
      data: offers
    });
  } catch (error) {
    console.error('Detailed error:', error);
    logger.error('Error in getAllOffers controller:', {
      error: error,
      stack: error instanceof Error ? error.stack : undefined,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({
      status: 500,
      error: error instanceof Error ? error.message : 'Failed to fetch offers'
    });
  }
}; 