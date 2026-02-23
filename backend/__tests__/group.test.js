import { jest } from '@jest/globals';
import Group from '../models/group.schema.js';
import {
  createGroupHandler,
  getGroupDetailsHandler,
  joinGroupHandler,
  leaveGroupHandler,
  getUserJoinedGroupsHandler,
  findGroupHandler,
  updateGroupHandler,
  saveQuizHandler,
  saveSummaryHandler,
  getSavedQuizzesHandler,
  getSavedSummariesHandler,
} from '../controllers/groupControllers.js';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Mock the Group model
// ---------------------------------------------------------------------------

jest.mock('../models/group.schema.js', () => {
  const mockSave = jest.fn().mockResolvedValue();
  const MockGroup = function (data) {
    Object.assign(this, data);
    this.save = mockSave;
    this._id = 'mock-id';
  };
  MockGroup.findOne = jest.fn();
  MockGroup.findById = jest.fn();
  MockGroup.find = jest.fn();
  return { __esModule: true, default: MockGroup };
});

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const makeMockRes = () => {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
};

const makeGroup = (overrides = {}) => ({
  _id: 'group-1',
  name: 'test-group',
  about: 'about text',
  color: 'blue',
  icon: 'icon',
  UID: [],
  savedQuizzes: [],
  savedSummaries: [],
  save: jest.fn().mockResolvedValue(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ===========================================================================
// createGroupHandler
// ===========================================================================

describe('createGroupHandler', () => {
  it('creates a group and returns 200 with groupId', async () => {
    Group.findOne.mockResolvedValue(null); // no duplicate

    const req = { body: { groupName: 'Test Group', about: 'about', iconName: 'icon', color: 'blue' }, userId: 'user-123' };
    const res = makeMockRes();

    await createGroupHandler(req, res);

    expect(Group.findOne).toHaveBeenCalledWith({ name: 'test group' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, groupId: 'mock-id' })
    );
  });

  it('returns 400 when groupName is missing', async () => {
    const req = { body: { about: 'about' }, userId: 'user-123' };
    const res = makeMockRes();

    await createGroupHandler(req, res);

    expect(Group.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'missing-params' })
    );
  });

  it('returns 400 when userId is missing', async () => {
    const req = { body: { groupName: 'Test Group' }, userId: undefined };
    const res = makeMockRes();

    await createGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-params' })
    );
  });

  it('returns 400 when a group with the same name already exists', async () => {
    Group.findOne.mockResolvedValue(makeGroup()); // duplicate found

    const req = { body: { groupName: 'Test Group', about: 'about', iconName: 'icon', color: 'blue' }, userId: 'user-123' };
    const res = makeMockRes();

    await createGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'group-name-exists' })
    );
  });

  it('returns 500 when the DB throws', async () => {
    Group.findOne.mockRejectedValue(new Error('DB error'));

    const req = { body: { groupName: 'Test Group', about: 'about', iconName: 'icon', color: 'blue' }, userId: 'user-123' };
    const res = makeMockRes();

    await createGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect.objectContaining({ success: false, error: 'DB error' })
  });
});

// ===========================================================================
// findGroupHandler
// ===========================================================================

describe('findGroupHandler', () => {
  it('returns matching groups for a search query', async () => {
    const group = makeGroup({ UID: ['u1', 'u2'] });
    Group.find.mockResolvedValue([group]);

    const req = { query: { search: 'test' } };
    const res = makeMockRes();

    await findGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        groups: expect.arrayContaining([
          expect.objectContaining({ id: group._id, name: group.name, members: 2 }),
        ]),
      })
    );
  });

  it('returns all groups when no query is provided', async () => {
    Group.find.mockResolvedValue([makeGroup()]);

    const req = { query: {} };
    const res = makeMockRes();

    await findGroupHandler(req, res);

    expect(Group.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('also accepts the "q" query param alias', async () => {
    Group.find.mockResolvedValue([makeGroup()]);

    const req = { query: { q: 'test' } };
    const res = makeMockRes();

    await findGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when no groups match the query', async () => {
    Group.find.mockResolvedValue([]);

    const req = { query: { search: 'nothing' } };
    const res = makeMockRes();

    await findGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'no-groups-found' })
    );
  });

  it('returns 500 when the DB throws', async () => {
    Group.find.mockRejectedValue(new Error('DB error'));

    const req = { query: { search: 'test' } };
    const res = makeMockRes();

    await findGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

// ===========================================================================
// getGroupDetailsHandler
// ===========================================================================

describe('getGroupDetailsHandler', () => {
  it('returns group details when user is a member', async () => {
    const group = makeGroup({ UID: ['user-123'] });
    Group.findOne.mockResolvedValue(group);

    const req = { body: { groupId: 'group-1' }, userId: 'user-123' };
    const res = makeMockRes();

    await getGroupDetailsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, groupDetails: group })
    );
  });

  it('returns 400 when groupId is missing', async () => {
    const req = { body: {}, userId: 'user-123' };
    const res = makeMockRes();

    await getGroupDetailsHandler(req, res);

    expect(Group.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'no-such-group-or-user' })
    );
  });

  it('returns 400 when userId is missing', async () => {
    const req = { body: { groupId: 'group-1' }, userId: undefined };
    const res = makeMockRes();

    await getGroupDetailsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when the group does not exist', async () => {
    Group.findOne.mockResolvedValue(null);

    const req = { body: { groupId: 'ghost-id' }, userId: 'user-123' };
    const res = makeMockRes();

    await getGroupDetailsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'group-not-found' })
    );
  });

  it('returns 403 when user is not a member', async () => {
    Group.findOne.mockResolvedValue(makeGroup({ UID: ['other-user'] }));

    const req = { body: { groupId: 'group-1' }, userId: 'user-123' };
    const res = makeMockRes();

    await getGroupDetailsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'not-a-member' })
    );
  });

  it('returns 500 when the DB throws', async () => {
    Group.findOne.mockRejectedValue(new Error('DB error'));

    const req = { body: { groupId: 'group-1' }, userId: 'user-123' };
    const res = makeMockRes();

    await getGroupDetailsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ===========================================================================
// joinGroupHandler
// ===========================================================================

describe('joinGroupHandler', () => {
  it('adds the user to the group and returns 200', async () => {
    const group = makeGroup({ UID: [] });
    Group.findOne.mockResolvedValue(group);

    const req = { body: { groupId: 'group-1' }, userId: 'user-123' };
    const res = makeMockRes();

    await joinGroupHandler(req, res);

    expect(group.UID).toContain('user-123');
    expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'Joined group successfully' })
    );
  });

  it('returns 200 + already-a-member when the user is already in the group', async () => {
    Group.findOne.mockResolvedValue(makeGroup({ UID: ['user-123'] }));

    const req = { body: { groupId: 'group-1' }, userId: 'user-123' };
    const res = makeMockRes();

    await joinGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'already-a-member' })
    );
  });

  it('returns 400 when groupId is missing', async () => {
    const req = { body: {}, userId: 'user-123' };
    const res = makeMockRes();

    await joinGroupHandler(req, res);

    expect(Group.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when userId is missing', async () => {
    const req = { body: { groupId: 'group-1' }, userId: undefined };
    const res = makeMockRes();

    await joinGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when the group does not exist', async () => {
    Group.findOne.mockResolvedValue(null);

    const req = { body: { groupId: 'ghost-id' }, userId: 'user-123' };
    const res = makeMockRes();

    await joinGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'group-not-found' })
    );
  });

  it('returns 500 when the DB throws', async () => {
    Group.findOne.mockRejectedValue(new Error('DB error'));

    const req = { body: { groupId: 'group-1' }, userId: 'user-123' };
    const res = makeMockRes();

    await joinGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ===========================================================================
// leaveGroupHandler
// ===========================================================================

describe('leaveGroupHandler', () => {
  it('removes the user from the group and returns 200', async () => {
    const group = makeGroup({ UID: ['user-123', 'other-user'] });
    Group.findOne.mockResolvedValue(group);

    const req = { body: { groupId: 'group-1' }, userId: 'user-123' };
    const res = makeMockRes();

    await leaveGroupHandler(req, res);

    expect(group.UID).not.toContain('user-123');
    expect(group.UID).toContain('other-user'); // other members unaffected
    expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'Left group successfully' })
    );
  });

  it('returns 400 when groupId is missing', async () => {
    const req = { body: {}, userId: 'user-123' };
    const res = makeMockRes();

    await leaveGroupHandler(req, res);

    expect(Group.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-params' })
    );
  });

  it('returns 400 when userId is missing', async () => {
    const req = { body: { groupId: 'group-1' }, userId: undefined };
    const res = makeMockRes();

    await leaveGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when the group does not exist', async () => {
    Group.findOne.mockResolvedValue(null);

    const req = { body: { groupId: 'ghost-id' }, userId: 'user-123' };
    const res = makeMockRes();

    await leaveGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'group-not-found' })
    );
  });

  it('returns 500 when the DB throws', async () => {
    Group.findOne.mockRejectedValue(new Error('DB error'));

    const req = { body: { groupId: 'group-1' }, userId: 'user-123' };
    const res = makeMockRes();

    await leaveGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ===========================================================================
// getUserJoinedGroupsHandler
// ===========================================================================

describe('getUserJoinedGroupsHandler', () => {
  it('returns all groups the user has joined', async () => {
    const group = makeGroup({ UID: ['user-123', 'other'] });
    Group.find.mockResolvedValue([group]);

    const req = { userId: 'user-123' };
    const res = makeMockRes();

    await getUserJoinedGroupsHandler(req, res);

    expect(Group.find).toHaveBeenCalledWith({ UID: 'user-123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        groups: expect.arrayContaining([
          expect.objectContaining({ id: group._id, name: group.name, members: 2 }),
        ]),
      })
    );
  });

  it('returns 200 with an empty array when user has no groups', async () => {
    Group.find.mockResolvedValue([]);

    const req = { userId: 'user-123' };
    const res = makeMockRes();

    await getUserJoinedGroupsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, groups: [] })
    );
  });

  it('returns 400 when userId is missing', async () => {
    const req = { userId: undefined };
    const res = makeMockRes();

    await getUserJoinedGroupsHandler(req, res);

    expect(Group.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-userId' })
    );
  });

  it('returns 500 when the DB throws', async () => {
    Group.find.mockRejectedValue(new Error('DB error'));

    const req = { userId: 'user-123' };
    const res = makeMockRes();

    await getUserJoinedGroupsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ===========================================================================
// updateGroupHandler
// ===========================================================================

describe('updateGroupHandler', () => {
  it('updates the group and returns 200', async () => {
    const group = makeGroup({ UID: ['user-123'] });
    Group.findById.mockResolvedValue(group);
    Group.findOne.mockResolvedValue(null); // no name collision

    const req = {
      body: { groupId: 'group-1', groupName: 'New Name', about: 'new about', iconName: 'new-icon', color: 'red' },
      userId: 'user-123',
    };
    const res = makeMockRes();

    await updateGroupHandler(req, res);

    expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Group updated successfully',
        group: expect.objectContaining({ id: group._id }),
      })
    );
  });

  it('returns 400 when groupId is missing', async () => {
    const req = { body: { groupName: 'Name' }, userId: 'user-123' };
    const res = makeMockRes();

    await updateGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-params' })
    );
  });

  it('returns 400 when groupName is empty', async () => {
    const req = { body: { groupId: 'group-1', groupName: '   ' }, userId: 'user-123' };
    const res = makeMockRes();

    await updateGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-params' })
    );
  });

  it('returns 404 when the group does not exist', async () => {
    Group.findById.mockResolvedValue(null);

    const req = { body: { groupId: 'ghost-id', groupName: 'Name' }, userId: 'user-123' };
    const res = makeMockRes();

    await updateGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'group-not-found' })
    );
  });

  it('returns 403 when the user is not a member', async () => {
    Group.findById.mockResolvedValue(makeGroup({ UID: ['other-user'] }));

    const req = { body: { groupId: 'group-1', groupName: 'Name' }, userId: 'user-123' };
    const res = makeMockRes();

    await updateGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'not-authorized' })
    );
  });

  it('returns 400 when the new name collides with another group', async () => {
    Group.findById.mockResolvedValue(makeGroup({ UID: ['user-123'] }));
    Group.findOne.mockResolvedValue(makeGroup({ _id: 'other-group' })); // collision

    const req = { body: { groupId: 'group-1', groupName: 'Taken Name' }, userId: 'user-123' };
    const res = makeMockRes();

    await updateGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'group-name-exists' })
    );
  });

  it('returns 500 when the DB throws', async () => {
    Group.findById.mockRejectedValue(new Error('DB error'));

    const req = { body: { groupId: 'group-1', groupName: 'Name' }, userId: 'user-123' };
    const res = makeMockRes();

    await updateGroupHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ===========================================================================
// saveQuizHandler
// ===========================================================================

describe('saveQuizHandler', () => {
  const MOCK_QUIZ = { title: 'Quiz 1', questions: [] };

  it('saves a quiz to the group and returns 200', async () => {
    const group = makeGroup({ UID: ['user-123'], savedQuizzes: [] });
    Group.findById.mockResolvedValue(group);

    const req = { body: { groupId: 'group-1', quiz: MOCK_QUIZ }, params: {}, userId: 'user-123' };
    const res = makeMockRes();

    await saveQuizHandler(req, res);

    expect(group.savedQuizzes.length).toBe(1);
    expect(group.savedQuizzes[0]).toMatchObject({ ...MOCK_QUIZ, savedBy: 'user-123' });
    expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'Quiz saved successfully' })
    );
  });

  it('returns 400 when quiz data is missing', async () => {
    const req = { body: { groupId: 'group-1' }, params: {}, userId: 'user-123' };
    const res = makeMockRes();

    await saveQuizHandler(req, res);

    expect(Group.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-params' })
    );
  });

  it('returns 400 when groupId is missing', async () => {
    const req = { body: { quiz: MOCK_QUIZ }, params: {}, userId: 'user-123' };
    const res = makeMockRes();

    await saveQuizHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when the group does not exist', async () => {
    Group.findById.mockResolvedValue(null);

    const req = { body: { groupId: 'ghost-id', quiz: MOCK_QUIZ }, params: {}, userId: 'user-123' };
    const res = makeMockRes();

    await saveQuizHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'group-not-found' })
    );
  });

  it('returns 500 when the DB throws', async () => {
    Group.findById.mockRejectedValue(new Error('DB error'));

    const req = { body: { groupId: 'group-1', quiz: MOCK_QUIZ }, params: {}, userId: 'user-123' };
    const res = makeMockRes();

    await saveQuizHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ===========================================================================
// saveSummaryHandler
// ===========================================================================

describe('saveSummaryHandler', () => {
  const MOCK_SUMMARY = { title: 'Summary 1', bullets: ['point 1'] };

  it('saves a summary to the group and returns 200', async () => {
    const group = makeGroup({ savedSummaries: [] });
    Group.findById.mockResolvedValue(group);

    const req = { body: { groupId: 'group-1', summary: MOCK_SUMMARY }, params: {}, userId: 'user-123' };
    const res = makeMockRes();

    await saveSummaryHandler(req, res);

    expect(group.savedSummaries.length).toBe(1);
    expect(group.savedSummaries[0]).toMatchObject({ ...MOCK_SUMMARY, savedBy: 'user-123' });
    expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'Summary saved successfully' })
    );
  });

  it('returns 400 when summary data is missing', async () => {
    const req = { body: { groupId: 'group-1' }, params: {}, userId: 'user-123' };
    const res = makeMockRes();

    await saveSummaryHandler(req, res);

    expect(Group.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-params' })
    );
  });

  it('returns 404 when the group does not exist', async () => {
    Group.findById.mockResolvedValue(null);

    const req = { body: { groupId: 'ghost-id', summary: MOCK_SUMMARY }, params: {}, userId: 'user-123' };
    const res = makeMockRes();

    await saveSummaryHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 when the DB throws', async () => {
    Group.findById.mockRejectedValue(new Error('DB error'));

    const req = { body: { groupId: 'group-1', summary: MOCK_SUMMARY }, params: {}, userId: 'user-123' };
    const res = makeMockRes();

    await saveSummaryHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ===========================================================================
// getSavedQuizzesHandler
// ===========================================================================

describe('getSavedQuizzesHandler', () => {
  it('returns saved quizzes for a group', async () => {
    const quizzes = [{ title: 'Quiz 1' }, { title: 'Quiz 2' }];
    Group.findById.mockResolvedValue(makeGroup({ savedQuizzes: quizzes }));

    const req = { params: { id: 'group-1' } };
    const res = makeMockRes();

    await getSavedQuizzesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, quizzes })
    );
  });

  it('returns an empty array when group has no saved quizzes', async () => {
    Group.findById.mockResolvedValue(makeGroup({ savedQuizzes: undefined }));

    const req = { params: { id: 'group-1' } };
    const res = makeMockRes();

    await getSavedQuizzesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, quizzes: [] })
    );
  });

  it('returns 400 when groupId is missing', async () => {
    const req = { params: {} };
    const res = makeMockRes();

    await getSavedQuizzesHandler(req, res);

    expect(Group.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'missing-params' })
    );
  });

  it('returns 404 when the group does not exist', async () => {
    Group.findById.mockResolvedValue(null);

    const req = { params: { id: 'ghost-id' } };
    const res = makeMockRes();

    await getSavedQuizzesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 when the DB throws', async () => {
    Group.findById.mockRejectedValue(new Error('DB error'));

    const req = { params: { id: 'group-1' } };
    const res = makeMockRes();

    await getSavedQuizzesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ===========================================================================
// getSavedSummariesHandler
// ===========================================================================

describe('getSavedSummariesHandler', () => {
  it('returns saved summaries for a group', async () => {
    const summaries = [{ title: 'Summary 1' }, { title: 'Summary 2' }];
    Group.findById.mockResolvedValue(makeGroup({ savedSummaries: summaries }));

    const req = { params: { id: 'group-1' } };
    const res = makeMockRes();

    await getSavedSummariesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, summaries })
    );
  });

  it('returns an empty array when group has no saved summaries', async () => {
    Group.findById.mockResolvedValue(makeGroup({ savedSummaries: undefined }));

    const req = { params: { id: 'group-1' } };
    const res = makeMockRes();

    await getSavedSummariesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, summaries: [] })
    );
  });

  it('returns 400 when groupId is missing', async () => {
    const req = { params: {} };
    const res = makeMockRes();

    await getSavedSummariesHandler(req, res);

    expect(Group.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when the group does not exist', async () => {
    Group.findById.mockResolvedValue(null);

    const req = { params: { id: 'ghost-id' } };
    const res = makeMockRes();

    await getSavedSummariesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 when the DB throws', async () => {
    Group.findById.mockRejectedValue(new Error('DB error'));

    const req = { params: { id: 'group-1' } };
    const res = makeMockRes();

    await getSavedSummariesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});