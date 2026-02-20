import request from 'supertest';
import app from '../app';
import Group from '../models/group.schema.js';
import { createGroupHandler, getGroupDetailsHandler, joinGroupHandler, leaveGroupHandler, getUserJoinedGroupsHandler } from '../controllers/groupControllers.js';

// Mock the Group model to avoid DB dependency for unit tests
jest.mock('../models/group.schema.js', () => {
    const mockSave = jest.fn().mockResolvedValue();
    const MockGroup = function (data) {
        Object.assign(this, data);
        this.save = mockSave;
        this._id = 'mock-id';
    };
    MockGroup.findOne = jest.fn();
    return { __esModule: true, default: MockGroup };
});

// Non comprehensive tests for group controller functions, focusing on core logic and expected responses.
/* The Tests below are for group controller functions which handle the following API routes:
The routes start with: /api/groups
routes include:
        ->/createGroup (POST) - create a new group
        ->/groupDetails (POST) - get details of a specific group by groupId
        ->/joinGroup (POST) - join a group by groupId
        ->/leaveGroup (POST) - leave a group by groupId
        ->/joinedGroups (GET) - get all groups the user has joined 
*/

/* IMPORTANT NOTE *
The tests below are unit tests for the group controller functions, not integration tests for the API routes.
This means we are directly calling the controller functions with mocked request and response objects, rather than making HTTP requests to the Express app.
This allows us to test the controller logic in isolation without needing a running server or database connection.
*/

describe('Testing Group API\'s', () => {

    let sharedGroup;

    beforeEach(() => {
        jest.clearAllMocks();
        // shared group used by multiple tests so join/leave operate on same resource
        sharedGroup = { _id: 'group-1', UID: [], name: 'test-group', color: 'blue', icon: 'icon', save: jest.fn().mockResolvedValue() };

        // Default findOne behavior: return by _id, null by name (so createGroup sees no duplicate)
        Group.findOne = jest.fn().mockImplementation((query) => {
            if (query && query._id) return Promise.resolve(sharedGroup);
            if (query && query.name) return Promise.resolve(null);
            return Promise.resolve(null);
        });

        // Default find behavior for joined groups
        Group.find = jest.fn().mockImplementation((q) => {
            if (q && q.UID) return Promise.resolve([sharedGroup]);
            return Promise.resolve([]);
        });
    });

    it('Create a new group', async () => {
        const groupName = 'Test Group';

        // Ensure no existing group with same name
        Group.findOne.mockResolvedValue(null);

        const req = {
            body: { groupName, about: 'about', iconName: 'icon', color: 'blue' },
            userId: 'user-123'
        };

        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await createGroupHandler(req, res);

        expect(Group.findOne).toHaveBeenCalledWith({ name: groupName.toLowerCase() });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, groupId: 'mock-id' }));
    });

    it('Fetch group details by groupId', async () => {
        const userId = 'user-123';
        const groupId = sharedGroup._id;

        // make sure user is a member for this test
        sharedGroup.UID = [userId];

        const req = { body: { groupId }, userId };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getGroupDetailsHandler(req, res);

        expect(Group.findOne).toHaveBeenCalledWith({ _id: groupId });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, groupDetails: sharedGroup }));
    });

    it('Join a group', async () => {
        const userId = 'user-123';
        const groupId = sharedGroup._id;

        // ensure not a member yet
        sharedGroup.UID = [];

        const req = { body: { groupId }, userId };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await joinGroupHandler(req, res);

        expect(Group.findOne).toHaveBeenCalledWith({ _id: groupId });
        expect(sharedGroup.save).toHaveBeenCalled();
        expect(sharedGroup.UID).toContain(userId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Joined group successfully' }));
    });

    it('Leave a joined group', async () => {
        const userId = 'user-123';
        const groupId = sharedGroup._id;

        // make sure user is currently a member
        sharedGroup.UID = [userId, 'other-user'];

        const req = { body: { groupId }, userId };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await leaveGroupHandler(req, res);

        expect(Group.findOne).toHaveBeenCalledWith({ _id: groupId });
        expect(sharedGroup.save).toHaveBeenCalled();
        expect(sharedGroup.UID).not.toContain(userId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Left group successfully' }));
    });

    it('Get user\'s joined groups', async () => {
        const userId = 'user-123';
        // reuse sharedGroup as the joined group
        sharedGroup.UID = [userId, 'a'];
        Group.find = jest.fn().mockResolvedValue([sharedGroup]);

        const req = { userId };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await getUserJoinedGroupsHandler(req, res);

        expect(Group.find).toHaveBeenCalledWith({ UID: userId });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            groups: expect.arrayContaining([
                expect.objectContaining({ id: sharedGroup._id, name: sharedGroup.name })
            ])
        }));
    });

});

