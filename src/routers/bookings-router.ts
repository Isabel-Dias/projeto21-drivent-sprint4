import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getBookingByUser } from '@/controllers';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getBookingByUser)
  .post('/')

export { bookingsRouter };