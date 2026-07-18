import request from 'supertest';
import app from '../../app';

describe('Authentication Routing Mechanics', () => {
    it('Should block malformed phone entries with 422 Unprocessable', async () => {
        const res = await request(app)
            .post('/api/v1/auth/send-otp')
            .send({ phone: "0300123" }); // Invalid length / missing pattern
            
        expect(res.status).toBe(422);
    });

    it('Should deny protected profile lookups initially', async () => {
        const res = await request(app).get('/api/v1/auth/me');
        expect(res.status).toBe(401);
    });
});
