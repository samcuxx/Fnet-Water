import { DefaultSession, DefaultUser } from "next-auth";

export type RoleType = "ADMIN" | "MANAGER" | "DRIVER" | "AGENT" | "CUSTOMER";
export type StatusType = "ACTIVE" | "INACTIVE";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleType;
      phone: string;
      status: StatusType;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: RoleType;
    phone: string;
    status: StatusType;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: RoleType;
    phone: string;
    status: StatusType;
  }
}
