import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number, roomCapacity?: number) {
  return prisma.room.create({
    data: {
      name: faker.company.companyName(),
      capacity: roomCapacity ? roomCapacity : faker.datatype.number(),
      hotelId,
    },
  });
}

export async function createHotelandRoom() {
  const hotel = await createHotel();
  const room = await createRoomWithHotelId(hotel.id);
  return room;
}
