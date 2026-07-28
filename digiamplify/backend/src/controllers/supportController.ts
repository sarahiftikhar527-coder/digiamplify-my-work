import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// Create a new support ticket
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    const { issueType, subject, priority, description, fileName, fileContent, contactMethod } = req.body;

    if (!issueType || !subject || !priority || !description || !contactMethod) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        issueType,
        subject,
        priority,
        description,
        fileName,
        fileContent,
        contactMethod,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Support ticket submitted successfully',
      ticket
    });
  } catch (error: any) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ error: 'Internal server error during ticket creation' });
  }
};

// Get tickets (admin sees all, employee sees only their own)
export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized user context' });
      return;
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let tickets;
    if (user.role.toLowerCase() === 'admin') {
      // Admin sees all tickets with user details
      tickets = await prisma.supportTicket.findMany({
        include: {
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
        }
      });
    } else {
      // Employee sees only their own tickets
      tickets = await prisma.supportTicket.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    res.status(200).json(tickets);
  } catch (error: any) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ error: 'Internal server error fetching tickets' });
  }
};

// Admin responds to a support ticket
export const respondToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId; // Admin ID
    const { ticketId } = req.params;
    const { adminResponse } = req.body;

    if (!adminResponse) {
      res.status(400).json({ error: 'Admin response content is required' });
      return;
    }

    // Verify requesting user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!adminUser || adminUser.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Administrator permissions required' });
      return;
    }

    // Check if ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      res.status(404).json({ error: 'Support ticket not found' });
      return;
    }

    // Update ticket
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        adminResponse,
        status: 'RESOLVED',
        respondedAt: new Date()
      }
    });

    res.status(200).json({
      message: 'Support ticket responded and resolved successfully',
      ticket: updatedTicket
    });
  } catch (error: any) {
    console.error('Respond to ticket error:', error);
    res.status(500).json({ error: 'Internal server error during ticket response' });
  }
};
