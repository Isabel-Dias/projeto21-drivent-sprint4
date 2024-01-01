import { notFoundError } from '@/errors';
import { bookingsRepository } from '@/repositories';

async function getBooking(userId: number) {
  const resultBooking = await bookingsRepository.findByUserId(userId);
  
  if(!resultBooking) throw notFoundError();

  const booking = {
    id: resultBooking.id,
    Room: resultBooking.Room
  }

  return booking;
}

export const bookingsService = {
  getBooking,
};