import { ROLES } from "../../../constants/roles";

export const MOCK_USERS = [
  {
    id: 1,
    name: "Admin",
    email: "admin@digiamplify.com",
    password: "admin123",
    role: ROLES.ADMIN,
  },
  {
    id: 2,
    name: "Employee",
    email: "employee@digiamplify.com",
    password: "emp123",
    role: ROLES.EMPLOYEE,
  },
];