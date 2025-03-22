import { Request, Response } from 'express';
import { AuthRequest } from '../../utils/auth';
import * as offerService from '../../services/offerService';
import logger from '../../utils/logger';

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
    logger.error('Error in createOffer controller:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to create offer'
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
    const { page = 1, limit = 10 } = req.query;

    const { offers, total } = await offerService.getAllOffers(
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      status: 200,
      data: {
        offers,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total
        }
      }
    });
  } catch (error) {
    logger.error('Error in getAllOffers controller:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to retrieve offers'
    });
  }
}; 