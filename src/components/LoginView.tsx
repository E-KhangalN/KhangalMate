import React, { useMemo, useState } from 'react';
import type { ConfirmationResult } from 'firebase/auth';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Phone,
  School,
  UserRound,
} from 'lucide-react';
import { AuthUser } from '../types';
import { getOrCreateDeviceId, saveStoredAuth } from '../utils/deviceManager';
import { firebaseAuthService, FirebaseUserProfile } from '../services/firebaseAuthService';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

type Mode = 'login' | 'register';
type Step = 'details' | 'code';

const GRADE_OPTIONS = ['6', '7', '8', '9', '10', '11', '12', 'Багш'];
const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 8);
const normalizeCode = (value: string) => value.replace(/\D/g, '').slice(0, 6);

const getFirebaseErrorMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  if (code.includes('invalid-phone-number')) return 'Утасны дугаар буруу байна.';
  if (code.includes('too-many-requests')) return 'Олон удаа оролдлоо. Түр хүлээгээд дахин оролдоно уу.';
  if (code.includes('quota-exceeded')) return 'SMS илгээх Firebase quota дууссан байна.';
  if (code.includes('invalid-verification-code')) return 'Баталгаажуулах код буруу байна.';
  if (code.includes('code-expired')) return 'Баталгаажуулах кодын хугацаа дууссан. Шинэ код авна уу.';
  if (code.includes('unauthorized-domain')) return 'Энэ вебийн домэйн Firebase Authentication-д зөвшөөрөгдөөгүй байна.';
  return error instanceof Error ? error.message : 'Үйлдэл амжилтгүй боллоо. Дахин оролдоно уу.';
};

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('details');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === 'register';
  const title = useMemo(() => {
    if (step === 'code') return 'Утасны дугаараа баталгаажуулах';
    return isRegister ? 'Шинэ бүртгэл үүсгэх' : 'Системд нэвтрэх';
  }, [isRegister, step]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep('details');
    setConfirmation(null);
    setVerificationCode('');
    setError(null);
    setSuccess(null);
    firebaseAuthService.resetRecaptcha();
  };

  const finishLogin = (profile: FirebaseUserProfile) => {
    const user: AuthUser = {
      userId: profile.uid,
      phoneNumber: profile.phoneNumber,
      name: profile.fullName,
      school: profile.school,
      grade: profile.grade,
      role: profile.role,
      loggedInAt: new Date().toISOString(),
      deviceId: getOrCreateDeviceId(),
    };
    saveStoredAuth(user);
    onLoginSuccess(user);
  };

  const validateRegistration = () => {
    if (fullName.trim().length < 2) return 'Овог, нэрээ оруулна уу.';
    if (!grade) return 'Ангиа сонгоно уу.';
    if (school.trim().length < 2) return 'Сургуулийн нэрээ оруулна уу.';
    return null;
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const phone = normalizePhone(phoneNumber);
    if (phone.length !== 8) {
      setError('8 оронтой утасны дугаараа оруулна уу.');
      return;
    }

    if (isRegister) {
      const registrationError = validateRegistration();
      if (registrationError) {
        setError(registrationError);
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await firebaseAuthService.sendVerificationCode(phone);
      setConfirmation(result);
      setStep('code');
      setSuccess(`+976 ${phone.slice(0, 4)} ${phone.slice(4)} дугаарт 6 оронтой код илгээлээ.`);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;

    setError(null);
    setIsLoading(true);
    try {
      const firebaseUser = await firebaseAuthService.confirmCode(confirmation, verificationCode);
      const existingProfile = await firebaseAuthService.getProfile(firebaseUser.uid);

      if (isRegister) {
        if (existingProfile) {
          finishLogin(existingProfile);
          return;
        }
        const created = await firebaseAuthService.createProfile(firebaseUser, { fullName, school, grade });
        finishLogin(created);
        return;
      }

      if (!existingProfile) {
        setError('Энэ утасны дугаарт бүртгэл олдсонгүй. “Бүртгүүлэх” хэсгээр эхлээд бүртгэл үүсгэнэ үү.');
        await firebaseAuthService.logout();
        setStep('details');
        setConfirmation(null);
        setVerificationCode('');
        firebaseAuthService.resetRecaptcha();
        return;
      }

      finishLogin(existingProfile);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const backToDetails = () => {
    setStep('details');
    setConfirmation(null);
    setVerificationCode('');
    setError(null);
    setSuccess(null);
    firebaseAuthService.resetRecaptcha();
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-stone-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_15%_15%,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(245,158,11,0.10),transparent_34%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-xl font-black text-stone-950 shadow-lg shadow-amber-950/20">∑</div>
          <div>
            <p className="text-sm font-bold tracking-wide">Математикийн сургалтын сан</p>
            <p className="mt-0.5 text-xs text-stone-400">6–12-р ангийн сургалтын материал</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-amber-300">
            <GraduationCap className="h-4 w-4" /> Багш, суралцагчдад зориулсан
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight xl:text-5xl">
            Математикийг илүү ойлгомжтой, системтэй суралцъя.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-stone-400">
            Утасны дугаараа SMS кодоор баталгаажуулаад хүсэлт, админы зөвшөөрөлгүйгээр шууд ашиглана.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              'Утасны дугаараар аюулгүй нэвтрэлт',
              'Бүртгэл үүсмэгц шууд ашиглана',
              'Компьютер, таблет, утсанд тохирно',
              'Хувийн мэдээлэл Firestore-д хамгаалагдана',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-stone-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-stone-600">Математикийн сургалтын материалын сан</p>
      </section>

      <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-8 sm:py-10 lg:px-10 xl:px-16">
        <div className="w-full max-w-[520px]">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-lg font-black text-amber-400">∑</div>
            <div>
              <p className="text-sm font-extrabold text-stone-950">Математикийн сургалтын сан</p>
              <p className="text-xs text-stone-500">6–12-р ангийн сургалтын материал</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_70px_rgba(28,25,23,0.08)] sm:p-8 md:p-9">
            {step === 'details' && (
              <div className="mb-7 inline-flex w-full rounded-2xl bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${!isRegister ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  Нэвтрэх
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isRegister ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                >
                  Бүртгүүлэх
                </button>
              </div>
            )}

            <div className="mb-7">
              {step === 'code' && (
                <button type="button" onClick={backToDetails} className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900">
                  <ArrowLeft className="h-4 w-4" /> Буцах
                </button>
              )}
              <h2 className="text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {step === 'code'
                  ? 'Таны утсанд ирсэн 6 оронтой баталгаажуулах кодыг оруулна уу.'
                  : isRegister
                    ? 'Үндсэн мэдээллээ бөглөж, утасны дугаараа SMS кодоор баталгаажуулна.'
                    : 'Бүртгэлтэй утасны дугаараа оруулаад SMS кодоор нэвтэрнэ.'}
              </p>
            </div>

            {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
            {success && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}

            {step === 'details' ? (
              <form onSubmit={sendCode} className="space-y-4">
                {isRegister && (
                  <>
                    <Field label="Овог, нэр" icon={<UserRound className="h-4 w-4" />}>
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Жишээ: Батболд Тэмүүлэн" autoComplete="name" className="form-input" />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Анги" icon={<BookOpen className="h-4 w-4" />}>
                        <select value={grade} onChange={(e) => setGrade(e.target.value)} className="form-input appearance-none">
                          <option value="">Сонгох</option>
                          {GRADE_OPTIONS.map((item) => <option key={item} value={item}>{item === 'Багш' ? item : `${item}-р анги`}</option>)}
                        </select>
                      </Field>
                      <Field label="Сургууль" icon={<School className="h-4 w-4" />}>
                        <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Сургуулийн нэр" className="form-input" />
                      </Field>
                    </div>
                  </>
                )}

                <Field label="Утасны дугаар" icon={<Phone className="h-4 w-4" />}>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-stone-500">+976</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(normalizePhone(e.target.value))}
                      placeholder="99112233"
                      autoComplete="tel"
                      className="form-input pl-14"
                    />
                  </div>
                </Field>

                <button type="submit" disabled={isLoading} className="group mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-stone-950/10 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
                  <span>{isLoading ? 'SMS илгээж байна...' : 'Баталгаажуулах код авах'}</span>
                  {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyCode} className="space-y-4">
                <Field label="SMS баталгаажуулах код" icon={<KeyRound className="h-4 w-4" />}>
                  <input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(normalizeCode(e.target.value))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className="form-input text-center text-2xl font-black tracking-[0.35em]"
                    autoFocus
                  />
                </Field>
                <button type="submit" disabled={isLoading || verificationCode.length !== 6} className="group mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-stone-950/10 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
                  <span>{isLoading ? 'Шалгаж байна...' : isRegister ? 'Бүртгэл үүсгээд нэвтрэх' : 'Нэвтрэх'}</span>
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}

            <div id="recaptcha-container" />
            <p className="mt-6 text-center text-xs leading-5 text-stone-400">
              {isRegister ? 'Бүртгэл үүссэн даруйд системд автоматаар нэвтэрнэ.' : 'Анх удаа ашиглаж байгаа бол “Бүртгүүлэх” хэсгийг сонгоно уу.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

const Field: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <label className="block">
    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-700">
      <span className="text-stone-400">{icon}</span>
      {label}
    </span>
    {children}
  </label>
);
