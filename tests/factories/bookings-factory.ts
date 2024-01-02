import { Room, User } from '@prisma/client';

import { createUser } from './users-factory';
import { prisma } from '@/config';
import { createHotelandRoom } from './hotels-factory';

export async function createBooking(user?: User, room?: Room) {
  const incomingUser = user || (await createUser());
  const incomingRoom = room || (await createHotelandRoom())

  return prisma.booking.create({
    data: {
      userId: incomingUser.id,
      roomId: incomingRoom.id
    }
  });
}