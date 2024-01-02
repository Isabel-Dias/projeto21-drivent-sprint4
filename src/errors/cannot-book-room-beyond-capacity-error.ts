import { ApplicationError } from '@/protocols';

export function cannotBookRoomBeyondCapacityError(): ApplicationError {
  return {
    name: 'CannotBookRoomBeyondCapacityError',
    message: 'Cannot book this room beyond capacity!',
  };
}