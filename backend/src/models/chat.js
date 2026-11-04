import { createPrismaModel } from "./prismaModelHelper.js";

const Chat = createPrismaModel("chat", {
  createdBy: "createdById",
});

export default Chat;
