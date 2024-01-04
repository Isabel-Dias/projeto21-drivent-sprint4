import { ApplicationError } from '@/protocols';

export function cannotUpdateInexistentBooking(): ApplicationError {
  return {
    name: 'CannotUpdateInexistentBooking',
    message: 'Cannot update a booking that does not exist!',
  };
}