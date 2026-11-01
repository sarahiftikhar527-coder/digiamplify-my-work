import { ROLES } from '../../constants/roles.js'
import User from '../../models/User.js'
import { createNotifications } from './notifications.service.js'

/*
  Doosre modules (tasks, leave, ...) yahan se notification banate hain. Misal:

    await notifyUsers([task.assignedTo], {
      from: req.user.id, type: 'task', tag: 'Tasks',
      title: 'Task assigned', message: `New task: ${task.title}`,
      details: task.description, link: '/task', linkLabel: 'Open Tasks',
    })
*/
export const notifyUsers = (userIds, payload) => createNotifications(userIds, payload)

export async function notifyAdmins(payload) {
  const admins = await User.find({ role: ROLES.ADMIN, status: 'active', isDeleted: false }).select('_id')
  return createNotifications(admins.map((a) => a.id), payload)
}