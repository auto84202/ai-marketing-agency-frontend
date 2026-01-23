export interface PasswordStrength {
  score: number; // 0-4
  feedback: string;
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  let score = 0;
  let feedback = '';

  // Calculate score based on requirements
  if (requirements.length) score++;
  if (requirements.uppercase) score++;
  if (requirements.lowercase) score++;
  if (requirements.number) score++;
  if (requirements.special) score++;

  // Additional scoring for length
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;

  // Determine level and feedback
  let level: PasswordStrength['level'];
  if (score < 2) {
    level = 'very-weak';
    feedback = 'Password is very weak. Add more characters and variety.';
  } else if (score < 3) {
    level = 'weak';
    feedback = 'Password is weak. Consider adding more complexity.';
  } else if (score < 4) {
    level = 'fair';
    feedback = 'Password is fair. Good start, but could be stronger.';
  } else if (score < 5) {
    level = 'good';
    feedback = 'Password is good. Strong security level.';
  } else {
    level = 'strong';
    feedback = 'Password is strong. Excellent security!';
  }

  return {
    score: Math.min(4, Math.floor(score)),
    feedback,
    level,
    requirements,
  };
}

export function validateEmail(email: string): { isValid: boolean; message: string } {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  // Check for common email providers
  const commonProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain && !commonProviders.includes(domain)) {
    // Still valid, but might want to show a warning for uncommon domains
    return { isValid: true, message: 'Email format is valid' };
  }

  return { isValid: true, message: 'Email format is valid' };
}
