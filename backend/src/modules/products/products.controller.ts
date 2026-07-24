import { Request, Response, NextFunction } from 'express';
import { linkParserService } from './link-parser.service';

export const parseProductLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { url } = req.body;

    const product = await linkParserService.parseProductLink(url, userId);
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await linkParserService.getProductById(id);
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error) {
    next(error);
  }
};
