import { User } from 'firebase/auth';

const MFA_ENROLLMENT_ERROR_MESSAGE = 'Error checking MFA enrollment:';

export const checkMfaEnrollmentStatus = (user: User): boolean => {
  try {
    // Check if user has MFA enrolled by checking multiFactor property
    const userWithMfa = user as User & {
      multiFactor?: { enrolledFactors?: unknown[] };
    };
    const enrolledFactors = userWithMfa.multiFactor?.enrolledFactors || [];
    return enrolledFactors.length > 0;
  } catch (error) {
    console.error(MFA_ENROLLMENT_ERROR_MESSAGE, error);
    return false;
  }
};

export const getMfaStatusText = (isEnrolled: boolean): string => {
  return isEnrolled ? 'Enrolled' : 'Not Enrolled';
};

export const getMfaStatusColor = (isEnrolled: boolean): string => {
  return isEnrolled ? 'text-green-600' : 'text-orange-600';
};

// Return a list of factorIds for the user's enrolled factors (e.g., 'phone', 'totp')
export const getEnrolledFactorIds = (user: User): string[] => {
  try {
    const userWithMfa = user as User & {
      multiFactor?: { enrolledFactors?: Array<{ factorId?: string }> };
    };
    const enrolledFactors = userWithMfa.multiFactor?.enrolledFactors || [];
    return enrolledFactors
      .map((factor) => (factor as { factorId?: string }).factorId)
      .filter((id): id is string => Boolean(id));
  } catch (error) {
    console.error(MFA_ENROLLMENT_ERROR_MESSAGE, error);
    return [];
  }
};

export const isPhoneMfaEnrolled = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return getEnrolledFactorIds(user).includes('phone');
};

export const isTotpMfaEnrolled = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return getEnrolledFactorIds(user).includes('totp');
};
