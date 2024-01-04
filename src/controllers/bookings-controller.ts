import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingsService } from '@/services';
import { notFoundError } from '@/errors';

export async function getBookingByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const booking = await bookingsService.getBooking(userId);

  return res.status(httpStatus.OK).send(booking);
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  if(!roomId) throw notFoundError();

  const bookingId = await bookingsService.postBooking(userId, roomId)

  return res.status(httpStatus.OK).send(bookingId)

}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingId  = Number(req.params.bookingId);
  const { roomId } = req.body;

  if(!bookingId || typeof(bookingId) !== 'number') throw notFoundError();
  if(!roomId) throw notFoundError();

  const newBookingId = await bookingsService.updateBooking(userId, bookingId, roomId);

  return res.status(httpStatus.OK).send(newBookingId);
}

