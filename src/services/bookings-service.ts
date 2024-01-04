import { notFoundError } from '@/errors';
import { cannotBookRoomBeyondCapacityError } from '@/errors/cannot-book-room-beyond-capacity-error';
import { cannotBookRoomWithoutValidTicketError } from '@/errors/cannot-book-room-without-valid-ticket-error';
import { cannotUpdateInexistentBooking } from '@/errors/cannot-update-inexistent-booking-error';
import { bookingsRepository, enrollmentRepository, hotelRepository, ticketsRepository } from '@/repositories';
import { Booking, Room, TicketStatus } from '@prisma/client';

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
  if(!room) throw notFoundError();
  const numberOfBookings = await bookingsRepository.countByRoomId(roomId);

  await checkRoomAvailability(room, numberOfBookings);

  const booking = await bookingsRepository.create(userId, roomId);

  return {bookingId: booking.id};
}

async function checkTicketValidity(ticketStatus: TicketStatus, includesHotel: boolean, isRemote: boolean) {
  if(ticketStatus !== 'PAID' || 
  includesHotel === false || 
  isRemote === true) throw cannotBookRoomWithoutValidTicketError();
}

async function checkRoomAvailability(room: Room, numberOfBookings: number) {
  if(numberOfBookings >= room.capacity) throw cannotBookRoomBeyondCapacityError();
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  const newRoom = await hotelRepository.findRoomById(roomId);
  if(!newRoom) throw notFoundError();
  
  const numberOfBookings = await bookingsRepository.countByRoomId(newRoom.id);
  await checkRoomAvailability(newRoom, numberOfBookings);
  
  const bookingByUser = await bookingsRepository.findByUserId(userId);
  if(!bookingByUser) throw cannotUpdateInexistentBooking();
  
  const now = new Date();

  const updateData = {
    roomId,
    updatedAt: now
  }

  const updatedBooking = await bookingsRepository.update(bookingId, updateData);

  return {bookingId: updatedBooking.id};
}

export const bookingsService = {
  getBooking,
  postBooking,
  checkTicketValidity,
  checkRoomAvailability,
  updateBooking,
};