import { notFoundError } from '@/errors';
import { cannotBookRoomBeyondCapacityError } from '@/errors/cannot-book-room-beyond-capacity-error';
import { cannotBookRoomWithoutValidTicketError } from '@/errors/cannot-book-room-without-valid-ticket-error';
import { bookingsRepository, enrollmentRepository, hotelRepository, ticketsRepository } from '@/repositories';

async function getBooking(userId: number) {
  const resultBooking = await bookingsRepository.findByUserId(userId);
  
  if(!resultBooking) throw notFoundError();

  const booking = {
    id: resultBooking.id,
    Room: resultBooking.Room
  }

  return booking;
}

async function postBooking(userId: number, roomId: number) {
  if(!roomId) throw notFoundError();
  
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket ||
  ticket.status !== 'PAID' || 
  ticket.TicketType.includesHotel === false || 
  ticket.TicketType.isRemote === true) throw cannotBookRoomWithoutValidTicketError()

  const room = await hotelRepository.findRoomById(roomId);
  if(!room) throw notFoundError();
  
  const numberOfBookings = await bookingsRepository.countByRoomId(roomId);
  if(numberOfBookings >= room.capacity) throw cannotBookRoomBeyondCapacityError();

  const booking = await bookingsRepository.create(userId, roomId)

  return booking.id;
}

export const bookingsService = {
  getBooking,
  postBooking,
};