import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { hashPassword } from '../utils/password.js'

const ADMIN = { name: 'Admin', email: 'admin@company.com', password: 'Admin@12345', role: 'admin' }

const EMPLOYEES = [
  { name: 'Ahmed Khan', email: 'ahmed@company.com', department: 'Design' },
  { name: 'Sara Ali', email: 'sara@company.com', department: 'HR' },
  { name: 'Usman Tariq', email: 'usman@company.com', department: 'Development' },
].map((e) => ({ ...e, password: 'Employee@12345', role: 'employee' }))

async function upsert({ password, ...data }) {
  const existing = await User.findOne({ email: data.email })
  if (existing) return existing
  return User.create({ ...data, passwordHash: await hashPassword(password) })
}

async function run() {
  await connectDB()

  const admin = await upsert(ADMIN)
  const employees = []
  for (const e of EMPLOYEES) employees.push(await upsert(e))

  if ((await Notification.countDocuments()) === 0) {
    await Notification.insertMany([
      {
        to: admin.id, type: 'leave', tag: 'HR & Admin', title: 'Leave request received',
        message: 'Sara Ali has requested leave for 2 days.',
        details: 'Sara Ali has requested leave for 2 days. Please approve or reject the request.',
      },
      {
        to: employees[0].id, from: admin.id, type: 'task', tag: 'Tasks', title: 'Task assigned',
        message: 'You have been assigned a new task: Design Homepage UI.',
        details: 'Task: Design Homepage UI. Priority: High. Please update the status once you start.',
        link: '/task', linkLabel: 'Open Tasks',
      },
    ])
  }

  console.log('\nSeed done. Login details (password baad mein zaroor badlein):')
  console.log(`  Admin    : ${ADMIN.email} / ${ADMIN.password}`)
  console.log('  Employee : ahmed@company.com, sara@company.com, usman@company.com / Employee@12345\n')

  await mongoose.disconnect()
}

run().catch((e) => { console.error(e); process.exit(1) })