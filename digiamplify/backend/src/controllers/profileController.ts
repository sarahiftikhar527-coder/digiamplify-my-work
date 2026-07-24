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

    res.json(profile);
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
        cnicStatus: data.cnicFileName ? 'Verified' : 'Pending',
        cvFileName: data.cvFileName,
        cvContent: data.cvContent,
        cvStatus: data.cvFileName ? 'Verified' : 'Pending',
        contractFileName: data.contractFileName,
        contractContent: data.contractContent,
        contractStatus: data.contractFileName ? 'Verified' : 'Pending',
        pictureUrl: data.pictureUrl,
        pictureStatus: data.pictureUrl ? 'Verified' : 'Pending',
        portfolioUrl: data.portfolioUrl,
        portfolioStatus: data.portfolioUrl ? 'Verified' : 'Pending',
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
        cnicStatus: data.cnicFileName ? 'Verified' : 'Pending',
        cvFileName: data.cvFileName,
        cvContent: data.cvContent,
        cvStatus: data.cvFileName ? 'Verified' : 'Pending',
        contractFileName: data.contractFileName,
        contractContent: data.contractContent,
        contractStatus: data.contractFileName ? 'Verified' : 'Pending',
        pictureUrl: data.pictureUrl,
        pictureStatus: data.pictureUrl ? 'Verified' : 'Pending',
        portfolioUrl: data.portfolioUrl,
        portfolioStatus: data.portfolioUrl ? 'Verified' : 'Pending',
      },
    });

    res.json(profile);
  } catch (error: any) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
