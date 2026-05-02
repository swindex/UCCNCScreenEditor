export const UserRoles = {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest'
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

module.exports = { UserRoles };
