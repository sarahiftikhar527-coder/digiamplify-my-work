import { createPrismaModel } from "./prismaModelHelper.js";

const Task = createPrismaModel("task", {
  assignedTo: "assignedToId",
  assignedBy: "assignedById",
});

export default Task;
