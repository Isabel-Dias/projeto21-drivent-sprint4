import { notFoundError } from '@/errors';
import { cannotBookRoomBeyondCapacityError } from '@/errors/cannot-book-room-beyond-capacity-error';
import { cannotBookRoomWithoutValidTicketError } from '@/errors/cannot-book-room-without-valid-ticket-error';
import { bookingsRepository, enrollmentRepository, hotelRepository, ticketsRepository } from '@/repositories';
import { Room, TicketStatus } from '@prisma/client';

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

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if(!ticket) throw cannotBookRoomWithoutValidTicketError();
  
  await checkTicketValidity(ticket.status, ticket.TicketType.includesHotel, ticket.TicketType.isRemote);

  const room = await hotelRepository.findRoomById(roomId);
  const numberOfBookings = await bookingsRepository.countByRoomId(roomId);

  await checkRoomAvailability(room, numberOfBookings);

  const booking = await bookingsRepository.create(userId, roomId)

  return booking.id;
}

async function checkTicketValidity(ticketStatus: TicketStatus, includesHotel: boolean, isRemote: boolean) {
  if(ticketStatus !== 'PAID' || 
  includesHotel === false || 
  isRemote === true) throw cannotBookRoomWithoutValidTicketError()
}

async function checkRoomAvailability(room: Room, numberOfBookings: number) {
  if(!room) throw notFoundError();
  if(numberOfBookings >= room.capacity) throw cannotBookRoomBeyondCapacityError();
}

export const bookingsService = {
  getBooking,
  postBooking,
  checkTicketValidity,
  checkRoomAvailability
};