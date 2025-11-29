import { Group, GroupDetail, CreateGroupData } from './groupApi';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Study Buddies',
    description: 'A community for students helping each other learn',
    members: 24,
    iconName: 'book.fill',
    createdAt: '2024-01-15T10:00:00Z',
    isJoined: false,
    category: 'Education',
  },
  {
    id: 'g2',
    name: 'React Learners',
    description: 'Master React and React Native together',
    members: 12,
    iconName: 'terminal.fill',
    createdAt: '2024-02-20T14:30:00Z',
    isJoined: false,
    category: 'Technology',
  },
  {
    id: 'g3',
    name: 'Design Crew',
    description: 'UI/UX designers sharing work and feedback',
    members: 8,
    iconName: 'paintbrush.fill',
    createdAt: '2024-03-10T09:15:00Z',
    isJoined: true,
    category: 'Design',
  },
  {
    id: 'g4',
    name: 'Productivity Champs',
    description: 'Tips and tricks for getting things done',
    members: 42,
    iconName: 'chart.bar.fill',
    createdAt: '2024-01-05T16:45:00Z',
    isJoined: false,
    category: 'Lifestyle',
  },
  {
    id: 'g5',
    name: 'Book Club',
    description: 'Monthly book discussions and recommendations',
    members: 16,
    iconName: 'books.vertical.fill',
    createdAt: '2024-02-28T11:20:00Z',
    isJoined: false,
    category: 'Literature',
  },
];

class MockGroupAPI {
  private groups: Group[] = [...mockGroups];

  async getGroups(searchQuery?: string): Promise<Group[]> {
    await delay(800);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return this.groups.filter(g => 
        g.name.toLowerCase().includes(q) || 
        g.description?.toLowerCase().includes(q)
      );
    }
    
    return [...this.groups];
  }

  async getGroupDetail(groupId: string): Promise<GroupDetail> {
    await delay(600);
    
    const group = this.groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    // Add additional details
    const detail: GroupDetail = {
      ...group,
      membersList: [
        { id: 'u1', name: 'John Doe', avatar: undefined },
        { id: 'u2', name: 'Jane Smith', avatar: undefined },
        { id: 'u3', name: 'Bob Wilson', avatar: undefined },
      ],
      activities: [
        {
          id: 'a1',
          type: 'join',
          description: 'Sarah Johnson joined the group',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'a2',
          type: 'post',
          description: 'New discussion: Best practices for 2024',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
      ],
      createdBy: {
        id: 'u0',
        name: 'Admin User',
      },
    };

    return detail;
  }

  async joinGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    
    const index = this.groups.findIndex(g => g.id === groupId);
    if (index === -1) {
      throw new Error('Group not found');
    }

    if (this.groups[index].isJoined) {
      throw new Error('Already a member of this group');
    }

    this.groups[index] = {
      ...this.groups[index],
      isJoined: true,
      members: this.groups[index].members + 1,
    };

    return {
      success: true,
      message: `Successfully joined ${this.groups[index].name}`,
    };
  }

  async leaveGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    
    const index = this.groups.findIndex(g => g.id === groupId);
    if (index === -1) {
      throw new Error('Group not found');
    }

    if (!this.groups[index].isJoined) {
      throw new Error('Not a member of this group');
    }

    this.groups[index] = {
      ...this.groups[index],
      isJoined: false,
      members: Math.max(0, this.groups[index].members - 1),
    };

    return {
      success: true,
      message: `Left ${this.groups[index].name}`,
    };
  }

  async createGroup(data: CreateGroupData): Promise<Group> {
    await delay(600);
    
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: data.name,
      description: data.description,
      members: 1,
      logoUri: data.logoUri,
      iconName: 'star.fill',
      createdAt: new Date().toISOString(),
      isJoined: true,
      category: data.category || 'General',
    };

    this.groups.push(newGroup);
    return newGroup;
  }

  async getMyGroups(): Promise<Group[]> {
    await delay(500);
    return this.groups.filter(g => g.isJoined);
  }
}

export const mockGroupApi = new MockGroupAPI();