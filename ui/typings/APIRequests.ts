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

export function MapUserItems(items: any[]) {
    let role_ids = {
        1: "Admin",
        2: "User",
        3: "Customer"
    };

    return <UserItem[]>items.map(item=>DataShape.copy(item, {
        id: DataShape.integer(),
        username : DataShape.string(),
        first_name : DataShape.string(),
        last_name : DataShape.string(),
        role_id : DataShape.integer(),
        updated_at : DataShape.date(),
        created_at : DataShape.date(),
    })).map(item=>{
        return {
            ...item,
            role_name: role_ids[item.role_id]
        }
    })
    
}