import { DataShape } from "leet-mvc/core/DataShape"

export enum UserRole {
    admin = 1,
    user = 2,
    customer = 3
}

export interface LoginRequest{
    username: string
    password: string
}

export interface LoginResponse{
    role_id: UserRole
    token: string
    username: string
    first_name: string
    last_name: string
}

export interface RegisterRequest{
    username: string
    password: string
    first_name: string
    last_name: string
}

export interface RegisterResponse{
    message: string
}

export interface UserItem
{
    id : number
    username : string
    first_name : string
    last_name : string
    role_id : number
    role_name : string
    updated_at : Date
    created_at : Date
}

export function MapUserItems(items: any[]): UserItem[] {
    let role_ids: {[key: number]: string} = {
        1: "Admin",
        2: "User",
        3: "Customer"
    };

    return items.map(item => {
        const copied: any = DataShape.copy(item, {
            id: DataShape.integer(),
            username : DataShape.string(),
            first_name : DataShape.string(),
            last_name : DataShape.string(),
            role_id : DataShape.integer(),
            updated_at : DataShape.date(),
            created_at : DataShape.date(),
        });
        return {
            id: copied.id,
            username: copied.username,
            first_name: copied.first_name,
            last_name: copied.last_name,
            role_id: copied.role_id,
            role_name: role_ids[copied.role_id as number] || "Unknown",
            updated_at: copied.updated_at,
            created_at: copied.created_at
        } as UserItem;
    });
}
