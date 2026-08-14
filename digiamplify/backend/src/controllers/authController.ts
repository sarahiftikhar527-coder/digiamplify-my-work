import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, pin } = req.body;

    if (!email || !password || !role || !pin) {
      res.status(400).json({ error: 'All fields (email, password, role, pin) are required' });
      return;
    }

    if (role.toLowerCase() === 'admin') {
      res.status(400).json({ error: 'Registering as an admin is not allowed.' });
      return;
    }

    
    if (typeof pin !== 'string' || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      res.status(400).json({ error: 'PIN must be exactly 4 digits' });
      return;
    }

    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'A user with this email address already exists' });
      return;
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPin = await bcrypt.hash(pin, salt);

    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        pin: hashedPin,
        status: role.toLowerCase() === 'admin' ? 'APPROVED' : 'PENDING',
      },
    });

    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check approval status
    if (user.role.toLowerCase() === 'employee') {
      if (user.status === 'REJECTED' || user.status === 'rejected') {
        res.status(403).json({ error: 'Your registration request has been rejected. You cannot access the portal.' });
        return;
      }
      if (user.status === 'PENDING' || user.status === 'pending') {
        res.status(403).json({ error: 'Your registration request is pending approval.' });
        return;
      }
    }

    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), lastSeen: Math.floor(Date.now() / 1000), isOnline: true },
    });

    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: false },
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error during logout' });
  }
};

export const heartbeat = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeen: Math.floor(Date.now() / 1000) },
    });
    res.sendStatus(200);
  } catch (error: any) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: 'Internal server error during heartbeat' });
  }
};
