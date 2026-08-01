import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendEmail, sendSMS } from '../services/notificationService';


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


export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
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

    let tickets;
    if (user.role.toLowerCase() === 'admin') {
      
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


export const respondToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId; 
    const { ticketId } = req.params;
    const { adminResponse } = req.body;

    if (!adminResponse) {
      res.status(400).json({ error: 'Admin response content is required' });
      return;
    }

    
    const adminUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!adminUser || adminUser.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Administrator permissions required' });
      return;
    }

    
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({ error: 'Support ticket not found' });
      return;
    }

    
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        adminResponse,
        status: 'RESOLVED',
        respondedAt: new Date()
      }
    });

    
    const contactMethodLower = ticket.contactMethod?.toLowerCase() || '';
    
    // Get target email: profile email, work email, or login email
    const employeeEmail = ticket.user?.profile?.email || ticket.user?.profile?.workEmail || ticket.user?.email;
    const employeePhone = ticket.user?.profile?.phone;
    const employeeName = ticket.user?.profile?.fullName || ticket.user?.email || 'Valued Employee';

    if (contactMethodLower === 'email') {
      if (employeeEmail) {
        const subject = `DigiAmplify Support Ticket Resolved: ${ticket.subject}`;
        
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #be0919; padding-bottom: 10px; margin-bottom: 20px;">
              <h2 style="color: #be0919; margin: 0;">DigiAmplify Help & Support</h2>
            </div>
            <p>Dear <strong>${employeeName}</strong>,</p>
            <p>Your support ticket has been reviewed and resolved by our administrator.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #be0919; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0;"><strong>Ticket Subject:</strong> ${ticket.subject}</p>
              <p style="margin: 0 0 10px 0;"><strong>Issue Type:</strong> ${ticket.issueType}</p>
              <p style="margin: 0 0 10px 0;"><strong>Description:</strong> ${ticket.description}</p>
              <p style="margin: 0;"><strong>Admin Resolution Response:</strong></p>
              <p style="margin: 5px 0 0 0; font-style: italic; color: #333333;">${adminResponse}</p>
            </div>
            <p>You can also view the details and check your ticket status at any time in the employee portal.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 10px; text-align: center;">
              This is an automated email notification. Please do not reply directly to this message.
            </p>
          </div>
        `;

        const text = `
          Dear ${employeeName},

          Your support ticket has been reviewed and resolved by our administrator.

          --- Ticket Details ---
          Subject: ${ticket.subject}
          Issue Type: ${ticket.issueType}
          Description: ${ticket.description}

          --- Admin Resolution Response ---
          ${adminResponse}

          You can also view the details and check your ticket status at any time in the employee portal.

          Regards,
          DigiAmplify Support Team
        `;

        sendEmail(employeeEmail, subject, html, text).catch(err => {
          console.error('[SUPPORT CONTROLLER] Failed to send resolution email:', err);
        });
      } else {
        console.warn(`[SUPPORT CONTROLLER] Preferred contact method is Email, but no email address was found for user ID: ${ticket.userId}`);
      }
    } else if (contactMethodLower === 'phone' || contactMethodLower === 'sms') {
      if (employeePhone) {
        const smsMessage = `DigiAmplify Support Alert: Your ticket "${ticket.subject}" has been resolved. Admin Response: "${adminResponse}". View details in portal.`;
        
        sendSMS(employeePhone, smsMessage).catch(err => {
          console.error('[SUPPORT CONTROLLER] Failed to send resolution SMS:', err);
        });
      } else {
        console.warn(`[SUPPORT CONTROLLER] Preferred contact method is Phone/SMS, but no phone number was found in user profile for user ID: ${ticket.userId}`);
      }
    }

    res.status(200).json({
      message: 'Support ticket responded and resolved successfully',
      ticket: updatedTicket
    });
  } catch (error: any) {
    console.error('Respond to ticket error:', error);
    res.status(500).json({ error: 'Internal server error during ticket response' });
  }
};
