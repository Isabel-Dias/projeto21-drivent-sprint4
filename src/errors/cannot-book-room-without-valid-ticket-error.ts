import { ApplicationError } from '@/protocols';

export function cannotBookRoomWithoutValidTicketError(): ApplicationError {
  return {
    name: 'CannotBookRoomWithoutValidTicketError',
    message: 'Cannot book a room without a paid, presencial ticket that includes hotel!',
  };
}