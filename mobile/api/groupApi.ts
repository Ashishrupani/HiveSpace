import axios from 'axios';
import { API_BASE_URL } from './constants';

export type GroupSummary = {
	id: string;
	name: string;
	members: number;
	iconName?: string;
	logoUri?: string;
};

const baseUrl = API_BASE_URL;

export const searchGroups = async (query: string): Promise<GroupSummary[]> => {
	const response = await axios.get(`${baseUrl}/api/groups/find`, {
		params: query ? { search: query } : undefined,
	});

	const payload = response.data;
	const groups = Array.isArray(payload)
		? payload
		: payload?.groups ?? payload?.data ?? [];

	return groups.map((group: any) => ({
		id: String(group.id ?? group._id ?? ''),
		name: group.name ?? '',
		members: Number(group.members ?? group.memberCount ?? 0),
		iconName: group.iconName,
		logoUri: group.logoUri,
	}));
};