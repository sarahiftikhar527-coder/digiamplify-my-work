import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../config/prisma';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { editRequestStatus: true }
    });

    res.json({
      ...profile,
      editRequestStatus: user?.editRequestStatus || 'NONE'
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const upsertProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const data = req.body;

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    const getStatus = (newFile: string | null | undefined, existingFile: string | null | undefined, existingStatus: string | null | undefined) => {
      if (!newFile) return 'Pending';
      if (newFile === existingFile && existingStatus === 'Verified') {
        return 'Verified';
      }
      return 'Not Verified';
    };

    const calculatedCnicStatus = getStatus(data.cnicFileName, existingProfile?.cnicFileName, existingProfile?.cnicStatus);
    const calculatedCvStatus = getStatus(data.cvFileName, existingProfile?.cvFileName, existingProfile?.cvStatus);
    const calculatedContractStatus = getStatus(data.contractFileName, existingProfile?.contractFileName, existingProfile?.contractStatus);
    const calculatedPictureStatus = getStatus(data.pictureUrl, existingProfile?.pictureUrl, existingProfile?.pictureStatus);
    const calculatedPortfolioStatus = getStatus(data.portfolioUrl, existingProfile?.portfolioUrl, existingProfile?.portfolioStatus);

    // Separate updates that are not model fields or keep standard updates
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        fullName: data.fullName,
        userName: data.userName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationality: data.nationality,
        language: data.language,
        email: data.email,
        workEmail: data.workEmail,
        phone: data.phone,
        emergencyPhone: data.emergencyPhone,
        currentAddress: data.currentAddress,
        permanentAddress: data.permanentAddress,
        country: data.country,
        city: data.city,
        education: data.education,
        jobTitle: data.jobTitle,
        department: data.department,
        team: data.team,
        manager: data.manager,
        jobLevel: data.jobLevel,
        probationPeriod: data.probationPeriod,
        dateOfJoining: data.dateOfJoining,
        confirmationDate: data.confirmationDate,
        annualLeave: data.annualLeave,
        jobType: data.jobType,
        workType: data.workType,
        shift: data.shift,
        workingDays: data.workingDays,
        weeklyOff: data.weeklyOff,
        noticePeriod: data.noticePeriod,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        currency: data.currency,
        bonus: data.bonus,
        annualSalary: data.annualSalary,
        salaryType: data.salaryType,
        salary: data.salary,
        deductionPerAbsence: data.deductionPerAbsence,
        paymentDate: data.paymentDate,
        cnicFileName: data.cnicFileName,
        cnicContent: data.cnicContent,
        cnicStatus: calculatedCnicStatus,
        cvFileName: data.cvFileName,
        cvContent: data.cvContent,
        cvStatus: calculatedCvStatus,
        contractFileName: data.contractFileName,
        contractContent: data.contractContent,
        contractStatus: calculatedContractStatus,
        pictureUrl: data.pictureUrl,
        pictureStatus: calculatedPictureStatus,
        portfolioUrl: data.portfolioUrl,
        portfolioStatus: calculatedPortfolioStatus,
      },
      create: {
        userId,
        fullName: data.fullName,
        userName: data.userName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationality: data.nationality,
        language: data.language,
        email: data.email,
        workEmail: data.workEmail,
        phone: data.phone,
        emergencyPhone: data.emergencyPhone,
        currentAddress: data.currentAddress,
        permanentAddress: data.permanentAddress,
        country: data.country,
        city: data.city,
        education: data.education,
        jobTitle: data.jobTitle,
        department: data.department,
        team: data.team,
        manager: data.manager,
        jobLevel: data.jobLevel,
        probationPeriod: data.probationPeriod,
        dateOfJoining: data.dateOfJoining,
        confirmationDate: data.confirmationDate,
        annualLeave: data.annualLeave,
        jobType: data.jobType,
        workType: data.workType,
        shift: data.shift,
        workingDays: data.workingDays,
        weeklyOff: data.weeklyOff,
        noticePeriod: data.noticePeriod,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        currency: data.currency,
        bonus: data.bonus,
        annualSalary: data.annualSalary,
        salaryType: data.salaryType,
        salary: data.salary,
        deductionPerAbsence: data.deductionPerAbsence,
        paymentDate: data.paymentDate,
        cnicFileName: data.cnicFileName,
        cnicContent: data.cnicContent,
        cnicStatus: calculatedCnicStatus,
        cvFileName: data.cvFileName,
        cvContent: data.cvContent,
        cvStatus: calculatedCvStatus,
        contractFileName: data.contractFileName,
        contractContent: data.contractContent,
        contractStatus: calculatedContractStatus,
        pictureUrl: data.pictureUrl,
        pictureStatus: calculatedPictureStatus,
        portfolioUrl: data.portfolioUrl,
        portfolioStatus: calculatedPortfolioStatus,
      },
    });

    // Reset editRequestStatus on successful profile save
    await prisma.user.update({
      where: { id: userId },
      data: { editRequestStatus: 'NONE' }
    });

    res.json(profile);
  } catch (error: any) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getAllProfiles = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId;
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        editRequestStatus: true,
        lastLogin: true,
        isOnline: true,
        profile: true,
      },
    });

    res.json(users);
  } catch (error: any) {
    console.error('Error fetching all profiles:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getProfileByUserId = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId;
  const { userId } = req.params;
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, lastLogin: true, editRequestStatus: true, isOnline: true }
    });

    res.json({
      ...profile,
      status: user?.status || 'PENDING',
      lastLogin: user?.lastLogin || null,
      editRequestStatus: user?.editRequestStatus || 'NONE',
      isOnline: user?.isOnline || false
    });
  } catch (error: any) {
    console.error('Error fetching profile by user ID:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const upsertProfileByUserId = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId;
  const { userId } = req.params;
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const data = req.body;

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    const getStatus = (newFile: string | null | undefined, existingFile: string | null | undefined, existingStatus: string | null | undefined) => {
      if (!newFile) return 'Pending';
      if (newFile === existingFile && existingStatus === 'Verified') {
        return 'Verified';
      }
      return 'Not Verified';
    };

    const calculatedCnicStatus = data.cnicStatus || getStatus(data.cnicFileName, existingProfile?.cnicFileName, existingProfile?.cnicStatus);
    const calculatedCvStatus = data.cvStatus || getStatus(data.cvFileName, existingProfile?.cvFileName, existingProfile?.cvStatus);
    const calculatedContractStatus = data.contractStatus || getStatus(data.contractFileName, existingProfile?.contractFileName, existingProfile?.contractStatus);
    const calculatedPictureStatus = data.pictureStatus || getStatus(data.pictureUrl, existingProfile?.pictureUrl, existingProfile?.pictureStatus);
    const calculatedPortfolioStatus = data.portfolioStatus || getStatus(data.portfolioUrl, existingProfile?.portfolioUrl, existingProfile?.portfolioStatus);

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        fullName: data.fullName,
        userName: data.userName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationality: data.nationality,
        language: data.language,
        email: data.email,
        workEmail: data.workEmail,
        phone: data.phone,
        emergencyPhone: data.emergencyPhone,
        currentAddress: data.currentAddress,
        permanentAddress: data.permanentAddress,
        country: data.country,
        city: data.city,
        education: data.education,
        jobTitle: data.jobTitle,
        department: data.department,
        team: data.team,
        manager: data.manager,
        jobLevel: data.jobLevel,
        probationPeriod: data.probationPeriod,
        dateOfJoining: data.dateOfJoining,
        confirmationDate: data.confirmationDate,
        annualLeave: data.annualLeave,
        jobType: data.jobType,
        workType: data.workType,
        shift: data.shift,
        workingDays: data.workingDays,
        weeklyOff: data.weeklyOff,
        noticePeriod: data.noticePeriod,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        currency: data.currency,
        bonus: data.bonus,
        annualSalary: data.annualSalary,
        salaryType: data.salaryType,
        salary: data.salary,
        deductionPerAbsence: data.deductionPerAbsence,
        paymentDate: data.paymentDate,
        cnicFileName: data.cnicFileName,
        cnicContent: data.cnicContent,
        cnicStatus: calculatedCnicStatus,
        cvFileName: data.cvFileName,
        cvContent: data.cvContent,
        cvStatus: calculatedCvStatus,
        contractFileName: data.contractFileName,
        contractContent: data.contractContent,
        contractStatus: calculatedContractStatus,
        pictureUrl: data.pictureUrl,
        pictureStatus: calculatedPictureStatus,
        portfolioUrl: data.portfolioUrl,
        portfolioStatus: calculatedPortfolioStatus,
      },
      create: {
        userId,
        fullName: data.fullName,
        userName: data.userName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationality: data.nationality,
        language: data.language,
        email: data.email,
        workEmail: data.workEmail,
        phone: data.phone,
        emergencyPhone: data.emergencyPhone,
        currentAddress: data.currentAddress,
        permanentAddress: data.permanentAddress,
        country: data.country,
        city: data.city,
        education: data.education,
        jobTitle: data.jobTitle,
        department: data.department,
        team: data.team,
        manager: data.manager,
        jobLevel: data.jobLevel,
        probationPeriod: data.probationPeriod,
        dateOfJoining: data.dateOfJoining,
        confirmationDate: data.confirmationDate,
        annualLeave: data.annualLeave,
        jobType: data.jobType,
        workType: data.workType,
        shift: data.shift,
        workingDays: data.workingDays,
        weeklyOff: data.weeklyOff,
        noticePeriod: data.noticePeriod,
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        currency: data.currency,
        bonus: data.bonus,
        annualSalary: data.annualSalary,
        salaryType: data.salaryType,
        salary: data.salary,
        deductionPerAbsence: data.deductionPerAbsence,
        paymentDate: data.paymentDate,
        cnicFileName: data.cnicFileName,
        cnicContent: data.cnicContent,
        cnicStatus: calculatedCnicStatus,
        cvFileName: data.cvFileName,
        cvContent: data.cvContent,
        cvStatus: calculatedCvStatus,
        contractFileName: data.contractFileName,
        contractContent: data.contractContent,
        contractStatus: calculatedContractStatus,
        pictureUrl: data.pictureUrl,
        pictureStatus: calculatedPictureStatus,
        portfolioUrl: data.portfolioUrl,
        portfolioStatus: calculatedPortfolioStatus,
      },
    });

    res.json(profile);
  } catch (error: any) {
    console.error('Error saving profile by user ID:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const approveUserRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId;
  const { userId } = req.params;
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'APPROVED' },
    });

    res.json({ message: 'User approved successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const rejectUserRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId;
  const { userId } = req.params;
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'REJECTED' },
    });

    res.json({ message: 'User rejected successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const requestEditPermission = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { editRequestStatus: 'PENDING' },
    });

    res.json({ message: 'Edit request sent to admin successfully', editRequestStatus: 'PENDING' });
  } catch (error: any) {
    console.error('Error requesting edit:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const approveEditPermission = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId;
  const { userId } = req.params;
  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { editRequestStatus: 'APPROVED' },
    });

    res.json({ message: 'Edit permission granted successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Error approving edit request:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const verifyDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.userId;
  const { userId } = req.params;
  const { docType } = req.body;

  if (!adminId) {
    res.status(401).json({ error: 'Unauthorized user context' });
    return;
  }

  try {
    const requester = await prisma.user.findUnique({ where: { id: adminId } });
    if (!requester || requester.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin only' });
      return;
    }

    const validDocs = ['cnic', 'cv', 'contract', 'picture', 'portfolio'];
    if (!validDocs.includes(docType)) {
      res.status(400).json({ error: 'Invalid document type' });
      return;
    }

    const fieldMap: Record<string, string> = {
      cnic: 'cnicStatus',
      cv: 'cvStatus',
      contract: 'contractStatus',
      picture: 'pictureStatus',
      portfolio: 'portfolioStatus',
    };

    const statusFieldName = fieldMap[docType];

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        [statusFieldName]: 'Verified',
      },
    });

    res.json(updatedProfile);
  } catch (error: any) {
    console.error('Error verifying document:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
