import { AccessRequest, ApprovedAccount, AccessRequestStatus } from '../types';

const STORAGE_KEY_REQUESTS = 'math_app_access_requests_v1';
const STORAGE_KEY_APPROVED = 'math_app_approved_accounts_v1';

// 24 hours in milliseconds
export const EXPIRATION_DURATION_MS = 24 * 60 * 60 * 1000;

export const accessRequestService = {
  /**
   * Fetch all requests, automatically expiring any pending requests that are older than 24 hours
   */
  getRequests(): AccessRequest[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (!raw) return [];
      const list: AccessRequest[] = JSON.parse(raw);
      const now = Date.now();
      let hasUpdates = false;

      // Check 24-hour expiration
      const updatedList = list.map((req) => {
        if (req.status === 'pending' && now > req.expiresAt) {
          hasUpdates = true;
          return {
            ...req,
            status: 'expired' as AccessRequestStatus,
          };
        }
        return req;
      });

      if (hasUpdates) {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedList));
      }

      // Sort newest first
      return updatedList.sort((a, b) => b.requestedAt - a.requestedAt);
    } catch (e) {
      console.error('Failed to parse access requests', e);
      return [];
    }
  },

  /**
   * Save request list
   */
  saveRequests(requests: AccessRequest[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save access requests', e);
    }
  },

  /**
   * Submit a new access request from login screen
   */
  submitRequest(data: {
    fullName: string;
    phoneNumber: string;
    school?: string;
    note?: string;
  }): { success: boolean; message: string; request?: AccessRequest } {
    const cleanPhone = data.phoneNumber.replace(/\s+/g, '');
    const cleanName = data.fullName.trim();

    if (!cleanName) {
      return { success: false, message: 'Овог нэрээ заавал оруулна уу.' };
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      return { success: false, message: 'Зөв утасны дугаар оруулна уу (8 оронтой).' };
    }

    // Check if phone is already the main admin
    if (cleanPhone === '89163999') {
      return { success: false, message: 'Энэ дугаар системийн админ дугаар байна.' };
    }

    // Check if user already has an active approved account
    const accounts = this.getApprovedAccounts();
    const existingAccount = accounts.find((a) => a.phoneNumber === cleanPhone && a.active);
    if (existingAccount) {
      return {
        success: false,
        message: 'Энэ утасны дугаарт нэвтрэх эрх аль хэдийн олгогдсон байна. Нууц үгээрээ нэвтэрнэ үү.',
      };
    }

    const currentRequests = this.getRequests();

    // Check if there is already an active pending request (not expired)
    const existingPending = currentRequests.find(
      (r) => r.phoneNumber === cleanPhone && r.status === 'pending' && Date.now() <= r.expiresAt
    );

    if (existingPending) {
      const remainingHours = Math.ceil((existingPending.expiresAt - Date.now()) / (1000 * 60 * 60));
      return {
        success: false,
        message: `Таны хүсэлт аль хэдийн илгээгдсэн, админ шалгаж байна. (Хүчинтэй хугацаа: ${remainingHours} цаг үлдсэн)`,
        request: existingPending,
      };
    }

    const now = Date.now();
    const newRequest: AccessRequest = {
      id: 'req-' + now + '-' + Math.random().toString(36).substring(2, 7),
      fullName: cleanName,
      phoneNumber: cleanPhone,
      school: data.school?.trim(),
      note: data.note?.trim(),
      requestedAt: now,
      expiresAt: now + EXPIRATION_DURATION_MS,
      status: 'pending',
      smsSent: false,
    };

    const updated = [newRequest, ...currentRequests];
    this.saveRequests(updated);

    return {
      success: true,
      message: 'Таны нэвтрэх хүсэлт амжилттай илгээгдлээ. Админ зөвшөөрөхөд таны дугаар луу нэвтрэх эрх автоматаар очно.',
      request: newRequest,
    };
  },

  /**
   * Find request by phone number to allow checking status
   */
  getRequestByPhone(phoneNumber: string): AccessRequest | null {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const requests = this.getRequests();
    return requests.find((r) => r.phoneNumber === cleanPhone) || null;
  },

  /**
   * Admin approves a request:
   * 1. Generates secure login password
   * 2. Registers account into Approved Accounts
   * 3. Prepares and dispatches SMS message to the phone number
   * 4. Updates request status to 'approved'
   */
  approveRequest(
    requestId: string,
    customPassword?: string
  ): { success: boolean; message: string; account?: ApprovedAccount; request?: AccessRequest } {
    const requests = this.getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) {
      return { success: false, message: 'Хүсэлт олдсонгүй.' };
    }

    const target = requests[index];
    // Generate secure 6-character password or use provided
    const password =
      customPassword?.trim() ||
      'M' + Math.floor(100000 + Math.random() * 900000); // e.g. M482915

    const now = Date.now();

    // Auto-formatted SMS text sent to user's phone
    const smsMessage = `[Математикийн сургалтын сан] Сайн байна уу, ${target.fullName}. Танд системд нэвтрэх эрх олгогдлоо. Нэвтрэх утас: ${target.phoneNumber}, Нууц үг: ${password}`;

    const updatedRequest: AccessRequest = {
      ...target,
      status: 'approved',
      approvedAt: now,
      generatedPassword: password,
      smsSent: true,
      smsSentAt: now,
      smsMessage,
    };

    requests[index] = updatedRequest;
    this.saveRequests(requests);

    // Save/update in approved accounts
    const accounts = this.getApprovedAccounts();
    const existingIdx = accounts.findIndex((a) => a.phoneNumber === target.phoneNumber);
    const newAccount: ApprovedAccount = {
      phoneNumber: target.phoneNumber,
      password,
      fullName: target.fullName,
      school: target.school,
      approvedAt: now,
      active: true,
    };

    if (existingIdx !== -1) {
      accounts[existingIdx] = newAccount;
    } else {
      accounts.push(newAccount);
    }
    this.saveApprovedAccounts(accounts);

    return {
      success: true,
      message: `Хүсэлт зөвшөөрөгдөж, ${target.phoneNumber} дугаар луу нэвтрэх нууц үг (${password}) илгээгдлээ.`,
      account: newAccount,
      request: updatedRequest,
    };
  },

  /**
   * Admin rejects a request
   */
  rejectRequest(requestId: string): { success: boolean } {
    const requests = this.getRequests();
    const updated = requests.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as AccessRequestStatus } : r));
    this.saveRequests(updated);
    return { success: true };
  },

  /**
   * Delete request from archive
   */
  deleteRequest(requestId: string): { success: boolean } {
    const requests = this.getRequests();
    const updated = requests.filter((r) => r.id !== requestId);
    this.saveRequests(updated);
    return { success: true };
  },

  /**
   * Approved Accounts Store
   */
  getApprovedAccounts(): ApprovedAccount[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPROVED);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveApprovedAccounts(accounts: ApprovedAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_APPROVED, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save approved accounts', e);
    }
  },

  /**
   * Validate credentials during login:
   * Returns authenticated user info if matched
   */
  validateLogin(
    phone: string,
    pass: string
  ): { valid: boolean; user?: { phoneNumber: string; name: string; role: 'admin' | 'teacher' }; error?: string } {
    const cleanPhone = phone.replace(/\s+/g, '');
    const cleanPass = pass.trim();

    // 1. Primary admin check
    if (cleanPhone === '89163999' && cleanPass === 'Hangal0101@@') {
      return {
        valid: true,
        user: {
          phoneNumber: '89163999',
          name: 'Админ (89163999)',
          role: 'admin',
        },
      };
    }

    // 2. Approved accounts check
    const accounts = this.getApprovedAccounts();
    const matched = accounts.find((a) => a.phoneNumber === cleanPhone && a.active);

    if (matched) {
      if (matched.password === cleanPass) {
        return {
          valid: true,
          user: {
            phoneNumber: matched.phoneNumber,
            name: matched.fullName || `Багш (${matched.phoneNumber})`,
            role: 'teacher',
          },
        };
      } else {
        return { valid: false, error: 'Нууц үг тохирохгүй байна.' };
      }
    }

    // 3. Check if they have a pending request
    const requests = this.getRequests();
    const req = requests.find((r) => r.phoneNumber === cleanPhone);
    if (req) {
      if (req.status === 'pending') {
        return {
          valid: false,
          error: 'Таны нэвтрэх хүсэлт админы зөвшөөрлийг хүлээж байна. (24 цагийн дотор шийдвэрлэгдэнэ)',
        };
      }
      if (req.status === 'expired') {
        return {
          valid: false,
          error: 'Таны өмнөх хүсэлт 24 цаг хэтэрч цуцлагдсан байна. Дахин хүсэлт илгээнэ үү.',
        };
      }
      if (req.status === 'rejected') {
        return {
          valid: false,
          error: 'Таны нэвтрэх хүсэлт татгалзсан байна.',
        };
      }
    }

    return { valid: false, error: 'Утасны дугаар эсвэл нууц үг буруу байна.' };
  },

  /**
   * Revoke or toggle account
   */
  toggleAccountStatus(phoneNumber: string): boolean {
    const accounts = this.getApprovedAccounts();
    const updated = accounts.map((acc) =>
      acc.phoneNumber === phoneNumber ? { ...acc, active: !acc.active } : acc
    );
    this.saveApprovedAccounts(updated);
    return true;
  },

  /**
   * Delete an approved account completely
   */
  deleteAccount(phoneNumber: string): boolean {
    const accounts = this.getApprovedAccounts();
    const updated = accounts.filter((acc) => acc.phoneNumber !== phoneNumber);
    this.saveApprovedAccounts(updated);
    return true;
  },
};
