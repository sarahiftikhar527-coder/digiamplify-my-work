import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.userId;
    if (!adminId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    const creatorUser = await prisma.user.findUnique({
      where: { id: adminId },
      include: { profile: true }
    });

    if (!creatorUser) {
      res.status(404).json({ error: 'User context not found' });
      return;
    }

    const { assignedToId, subject, priority, description, dueDate, dueTime, fileName, fileContent } = req.body;

    if (!assignedToId || !subject || !priority || !description || !dueDate) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId }
    });

    if (!assignee) {
      res.status(404).json({ error: 'Assigned employee not found' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        assignedToId,
        assignedById: adminId,
        subject,
        priority,
        description,
        dueDate,
        dueTime: dueTime || null,
        fileName: fileName || null,
        fileContent: fileContent || null,
        status: 'PENDING',
        progress: 0
      }
    });

    const adminName = creatorUser.profile?.fullName || creatorUser.email;
    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId: adminId,
        description: `Task created and assigned by ${adminName}`
      }
    });

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error during task creation' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let tasks;
    if (user.role.toLowerCase() === 'admin') {
      tasks = await prisma.task.findMany({
        include: {
          assignedTo: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                  jobTitle: true,
                  pictureUrl: true
                }
              }
            }
          },
          assignedBy: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                  pictureUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { assignedToId: userId },
        include: {
          assignedBy: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                  pictureUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    res.status(200).json(tasks);
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error fetching tasks' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { taskId } = req.params;
    const { status, progress } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isAdmin = user.role.toLowerCase() === 'admin';
    const isAssignee = task.assignedToId === userId;

    if (!isAdmin && !isAssignee) {
      res.status(403).json({ error: 'Access denied: You are not authorized to update this task' });
      return;
    }

    const updateData: any = {};
    let logDescription = '';

    const userName = user.profile?.fullName || user.email;

    if (status !== undefined) {
      updateData.status = status;
      logDescription += `Status updated to ${status}`;
    }

    if (progress !== undefined) {
      const progressInt = parseInt(progress, 10);
      updateData.progress = isNaN(progressInt) ? 0 : progressInt;
      if (logDescription) logDescription += ' and ';
      logDescription += `Progress updated to ${updateData.progress}%`;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'Status or progress is required' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData
    });

    // Create activity log
    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId: userId,
        description: `${logDescription} by ${userName}`
      }
    });

    res.status(200).json({
      message: 'Task status updated successfully',
      task: updatedTask
    });
  } catch (error: any) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Internal server error updating task status' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.userId;
    const { taskId } = req.params;

    if (!adminId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!adminUser || adminUser.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Administrator permissions required' });
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(200).json({
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error deleting task' });
  }
};

export const getTaskActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let activities;
    if (user.role.toLowerCase() === 'admin') {
      activities = await prisma.taskActivity.findMany({
        include: {
          task: {
            select: {
              subject: true
            }
          },
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });
    } else {
      activities = await prisma.taskActivity.findMany({
        where: {
          task: {
            assignedToId: userId
          }
        },
        include: {
          task: {
            select: {
              subject: true
            }
          },
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });
    }

    res.status(200).json(activities);
  } catch (error: any) {
    console.error('Get task activities error:', error);
    res.status(500).json({ error: 'Internal server error fetching activities' });
  }
};
