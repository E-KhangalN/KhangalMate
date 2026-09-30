import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface FirebaseUserProfile {
  uid: string;
  phoneNumber: string;
  fullName: string;
  school: string;
  grade: string;
  role: 'teacher' | 'admin';
  createdAt?: unknown;
  updatedAt?: unknown;
}

let recaptchaVerifier: RecaptchaVerifier | null = null;

const toE164 = (phone: string) => `+976${phone.replace(/\D/g, '').slice(0, 8)}`;

export const firebaseAuthService = {
  resetRecaptcha() {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';
  },

  getRecaptchaVerifier(): RecaptchaVerifier {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => undefined,
        'expired-callback': () => {
          this.resetRecaptcha();
        },
      });
    }
    return recaptchaVerifier;
  },

  async sendVerificationCode(phone: string): Promise<ConfirmationResult> {
    const normalized = phone.replace(/\D/g, '').slice(0, 8);
    if (!/^\d{8}$/.test(normalized)) {
      throw new Error('8 оронтой утасны дугаараа оруулна уу.');
    }

    const verifier = this.getRecaptchaVerifier();
    try {
      return await signInWithPhoneNumber(auth, toE164(normalized), verifier);
    } catch (error) {
      this.resetRecaptcha();
      throw error;
    }
  },

  async confirmCode(confirmation: ConfirmationResult, code: string): Promise<User> {
    const clean = code.replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(clean)) {
      throw new Error('SMS-ээр ирсэн 6 оронтой кодоо оруулна уу.');
    }
    const result = await confirmation.confirm(clean);
    return result.user;
  },

  async getProfile(uid: string): Promise<FirebaseUserProfile | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as FirebaseUserProfile) : null;
  },

  async createProfile(user: User, data: { fullName: string; school: string; grade: string }): Promise<FirebaseUserProfile> {
    const profile: FirebaseUserProfile = {
      uid: user.uid,
      phoneNumber: user.phoneNumber || '',
      fullName: data.fullName.trim(),
      school: data.school.trim(),
      grade: data.grade,
      role: 'teacher',
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return profile;
  },

  async updateProfile(uid: string, data: Partial<Pick<FirebaseUserProfile, 'fullName' | 'school' | 'grade'>>) {
    await setDoc(
      doc(db, 'users', uid),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  },

  async logout() {
    await signOut(auth);
  },
};
