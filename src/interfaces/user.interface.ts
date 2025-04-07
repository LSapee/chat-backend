export interface User{
  email:string;
  password:string;
  fullName:string;
  profilePic?:string;
}

export type UserWithoutPassword = Omit<User, "password">;