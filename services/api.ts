import { User } from '../types';

const API_URL = 'http://localhost:4000/users';

export const api = {
    // Fetch all users
    getUsers: async (): Promise<User[]> => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch users');
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    // Create a new user
    createUser: async (user: User): Promise<User> => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) throw new Error('Failed to create user');
            return await response.json();
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Update an existing user (PATCH)
    updateUser: async (user: User): Promise<User> => {
        try {
            const response = await fetch(`${API_URL}/${user.id}`, {
                method: 'PUT', // json-server often works better with PUT for full replacements, or PATCH for partials. Using PUT for simplicity as we pass the whole object.
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) throw new Error('Failed to update user');
            return await response.json();
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
};
