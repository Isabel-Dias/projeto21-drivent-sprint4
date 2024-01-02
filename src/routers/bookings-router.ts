import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getBookingByUser, postBooking } from '@/controllers';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getBookingByUser)
  .post('/', postBooking)

export { bookingsRouter };