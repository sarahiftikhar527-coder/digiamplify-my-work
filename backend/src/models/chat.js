import { createPrismaModel } from "./prismaModelHelper.js";
import User from "./User.js";

const Chat = createPrismaModel("chat", {
  createdBy: "createdById",
});

Chat.db = {
  model: (name) => {
    if (name === "User") return User;
    return null;
  },
};

export default Chat;
