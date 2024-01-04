
import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';

import { createEnrollmentWithAddress, createTicket, createTicketType, createUser } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';
import { createHotel, createHotelandRoom, createRoomWithHotelId } from '../factories/hotels-factory';
import { createBooking } from '../factories/bookings-factory';

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if no booking is found',async () => {
      const token = await generateValidToken();

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    })

    it('should respond with status 200 if a valid booking is found and returned',async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user, room)

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(), 
          updatedAt: room.updatedAt.toISOString(), 
        },
      })
    })
  })
});


describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe('when token is valid', () => {
    it('should respond with status 404 if there is no roomId', async () => {
      const token = await generateValidToken();
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({});
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if there is no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const room = await createHotelandRoom();
      const roomId = room.id;
      await createEnrollmentWithAddress(user);
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId});
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if the ticket is not PAID', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const room = await createHotelandRoom();
      const roomId = room.id;
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, 'RESERVED');
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId});
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if the ticketType is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const room = await createHotelandRoom();
      const roomId = room.id;
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, true);
      await createTicket(enrollment.id, ticketType.id, 'PAID');
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId});
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if the ticketType does not include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const room = await createHotelandRoom();
      const roomId = room.id;
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      await createTicket(enrollment.id, ticketType.id, 'PAID');
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId});
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 if the hotel room is not found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const roomId = 1;
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, 'PAID');
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId});
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
      
    });

    it('should respond with status 403 if the hotel room is above capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id, 1)
      const roomId = room.id;
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, 'PAID');
      
      await createBooking(user, room)
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId});
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and return the room id if the post was sucessful', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const room = await createHotelandRoom()
      const roomId = room.id;
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, 'PAID');
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId});
  
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({bookingId: expect.any(Number)})
    });
  })
})

describe('PUT /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe('when token is valid', () => {
    it('should respond with status 404 if there is no roomId', async () => {
      const token = await generateValidToken();
  
      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({});
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 if bookingId is not a number', async () => {
      const token = await generateValidToken();
      const room = await createHotelandRoom();
  
      const response = await server.put('/booking/abc').set('Authorization', `Bearer ${token}`).send({roomId: room.id});
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 if the new room does not exist', async () => {
      const token = await generateValidToken();
  
      const response = await server.put('/booking/abc').set('Authorization', `Bearer ${token}`).send({roomId: 1});
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 if the new room does not exist', async () => {
      const token = await generateValidToken();
  
      const response = await server.put('/booking/abc').set('Authorization', `Bearer ${token}`).send({roomId: 1});
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if there is no booking registered to this user', async () => {
      const token = await generateValidToken();
      const room = await createHotelandRoom();
  
      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({roomId: room.id});
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if the new room has no capacity', async () => {
      const user1 = await createUser();
      const user2 = await createUser();
      const token = await generateValidToken(user1);
      const hotel = await createHotel();
      const room1 = await createRoomWithHotelId(hotel.id, 1)
      const room2 = await createRoomWithHotelId(hotel.id, 1)
      const booking1 = await createBooking(user1, room1)
      await createBooking(user2, room2)
      
      const response = await server.put(`/booking/${booking1.id}`).set('Authorization', `Bearer ${token}`).send({roomId: room2.id});
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and return the new booking id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const room1 = await createHotelandRoom();
      const room2 = await createHotelandRoom();
      const booking = await createBooking(user, room1)
  
      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({roomId: room2.id});
  
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({bookingId: expect.any(Number)})
    });
  })

})