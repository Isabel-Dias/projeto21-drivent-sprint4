import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getBookingByUser, postBooking, updateBooking } from '@/controllers';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getBookingByUser)
  .post('/', postBooking)
  .put('/:bookingId', updateBooking);

export { bookingsRouter };
