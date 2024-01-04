import { prisma } from '@/config';

async function findByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    include: {
      Room: true,
    },
  });
}

async function findByRoomId(roomId: number) {
  return prisma.booking.findFirst({
    where: { roomId }
  });
}

async function countByRoomId(roomId: number) {
  return prisma.booking.count({
    where: { roomId }
  });
}

async function create(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  })
}

async function update(bookingId: number, updatedFields: object) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: updatedFields,
  });
}

export const bookingsRepository = {
  findByUserId,
  findByRoomId,
  countByRoomId,
  create,
  update
};