import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingsService } from '@/services';

export async function getBookingByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const booking = await bookingsService.getBooking(userId);

  return res.status(httpStatus.OK).send(booking);
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  const bookingId = await bookingsService.postBooking(userId, roomId)

  return res.status(httpStatus.OK).send({bookingId})

}

