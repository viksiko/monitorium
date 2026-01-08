import { Test, TestingModule } from '@nestjs/testing';
import { UserResponse } from '@src/types/user';
import { UserController } from '@src/user/user.controller';
import { UserService } from '@src/user/user.service';

jest.mock('uuid', () => ({
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    v4: () => 'test-uuid',
}));

describe('UsersController (unit)', () => {
    let controller: UserController;
    let userService: {
        getUsers: jest.Mock;
        findUserByEmail: jest.Mock;
    };

    beforeEach(async () => {
        // Мок UserService
        userService = {
            getUsers: jest.fn().mockResolvedValue([
                {
                    id: 'user-1',
                    name: 'Alice',
                    email: 'alice@test.com',
                    role: 'ADMIN',
                },
                {
                    id: 'user-2',
                    name: 'Bob',
                    email: 'bob@test.com',
                    role: 'USER',
                },
            ]),
            findUserByEmail: jest
                .fn()
                .mockImplementation((email: string) =>
                    Promise.resolve({ id: 'user-1', name: 'Alice', email }),
                ),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [{ provide: UserService, useValue: userService }],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return all users', async () => {
        const result = await controller.getUsers();

        expect(Array.isArray(result)).toBe(true);

        const users = result as UserResponse[];

        expect(users).toHaveLength(2);
        expect(userService.getUsers).toHaveBeenCalled();
    });

    it('should return a user by email', async () => {
        const email = 'alice@test.com';
        const result = await controller.getUsers(email);
        expect(userService.findUserByEmail).toHaveBeenCalledWith(email);
        expect(result).toEqual({ id: 'user-1', name: 'Alice', email });
    });

    it('should return all users with valid UserResponse shape', async () => {
        const result = await controller.getUsers();

        // Защита от null / одиночного объекта
        if (!Array.isArray(result)) {
            throw new Error('Expected array of users');
        }

        expect(result).toHaveLength(2);

        const user = result[0];

        expect(user).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                email: expect.any(String),
                role: expect.any(String),
            }),
        );
    });

    it('should return null if user not found by email', async () => {
        userService.findUserByEmail.mockResolvedValueOnce(null);
        const result = await controller.getUsers('nonexistent@test.com');
        expect(userService.findUserByEmail).toHaveBeenCalledWith(
            'nonexistent@test.com',
        );
        expect(result).toBeNull();
    });
});
