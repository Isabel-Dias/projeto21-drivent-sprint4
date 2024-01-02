import { prisma } from '@/config';

async function findByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    include: {
      Room: true,
    },
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

export const bookingsRepository = {
  findByUserId,
  countByRoomId,
  create,
};