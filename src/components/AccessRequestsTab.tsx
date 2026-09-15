import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  Copy,
  Check,
  Send,
  RefreshCw,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  X,
} from 'lucide-react';
import { accessRequestService } from '../services/accessRequestService';
import { AccessRequest, ApprovedAccount } from '../types';

interface AccessRequestsTabProps {
  onCountChange?: (count: number) => void;
}

export const AccessRequestsTab: React.FC<AccessRequestsTabProps> = ({ onCountChange }) => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [approvedAccounts, setApprovedAccounts] = useState<ApprovedAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all' | 'accounts'>('pending');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastSmsToast, setLastSmsToast] = useState<{ phone: string; message: string; pass: string } | null>(null);

  const loadData = () => {
    const list = accessRequestService.getRequests();
    setRequests(list);
    const accounts = accessRequestService.getApprovedAccounts();
    setApprovedAccounts(accounts);

    const pendingCount = list.filter((r) => r.status === 'pending').length;
    if (onCountChange) {
      onCountChange(pendingCount);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (requestId: string) => {
    const res = accessRequestService.approveRequest(requestId);
    if (res.success && res.request) {
      loadData();
      setLastSmsToast({
        phone: res.request.phoneNumber,
        pass: res.request.generatedPassword || '',
        message: res.request.smsMessage || '',
      });
    }
  };

  const handleReject = (requestId: string) => {
    accessRequestService.rejectRequest(requestId);
    loadData();
  };

  const handleDelete = (requestId: string) => {
    accessRequestService.deleteRequest(requestId);
    loadData();
  };

  const handleDeleteAccount = (phone: string) => {
    accessRequestService.deleteAccount(phone);
    loadData();
  };

  const handleToggleAccount = (phone: string) => {
    accessRequestService.toggleAccountStatus(phone);
    loadData();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');

  const filteredRequests =
    activeTab === 'pending'
      ? pendingRequests
      : activeTab === 'approved'
      ? approvedRequests
      : requests;

  const formatRemaining = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Хугацаа дууссан';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ц ${mins}м үлдсэн`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('mn-MN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top action & status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
        <div className="flex items-center space-x-2 text-xs text-stone-600">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>24 цагийн дотор шийдэгдээгүй хүсэлт автоматаар цуцлагдана.</span>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-bold text-stone-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
          <span>Шинэчлэх</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-bold gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'pending'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Хүлээгдэж буй</span>
          <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px]">
            {pendingRequests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'approved'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Зөвшөөрсөн ({approvedRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Бүх түүх ({requests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'accounts'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Олгосон эрхүүд ({approvedAccounts.length})</span>
        </button>
      </div>

      {/* Real-time SMS Toast */}
      {lastSmsToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start justify-between text-xs text-emerald-950">
          <div className="flex items-start space-x-2.5">
            <Send className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900">
                {lastSmsToast.phone} дугаар луу нэвтрэх нэр, нууц үг очлоо!
              </p>
              <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
                Нууц үг: <strong className="text-emerald-900">{lastSmsToast.pass}</strong>
              </p>
              <p className="text-[10px] text-stone-600 mt-1 bg-white/70 p-1.5 rounded border border-emerald-200">
                {lastSmsToast.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLastSmsToast(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content list */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {activeTab === 'accounts' ? (
          approvedAccounts.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <KeyRound className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="text-xs">Одоогоор олгосон нэмэлт багшийн эрх байхгүй байна.</p>
            </div>
          ) : (
            approvedAccounts.map((account) => (
              <div
                key={account.phoneNumber}
                className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between hover:bg-stone-100/70 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-stone-900">{account.fullName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        account.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {account.active ? 'Идэвхтэй' : 'Түдгэлзүүлсэн'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-stone-600 mt-1">
                    <span>Утас: <strong>{account.phoneNumber}</strong></span>
                    <span>•</span>
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">
                      Нууц үг: {account.password}
                    </span>
                    {account.school && (
                      <>
                        <span>•</span>
                        <span>{account.school}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `Утас: ${account.phoneNumber} | Нууц үг: ${account.password}`,
                        account.phoneNumber
                      )
                    }
                    className="px-2.5 py-1 text-[11px] font-bold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedId === account.phoneNumber ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Хууллаа</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-500" />
                        <span>Хуулах</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleAccount(account.phoneNumber)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer ${
                      account.active
                        ? 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100'
                        : 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {account.active ? 'Түр хаах' : 'Нээх'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(account.phoneNumber)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Устгах"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="text-xs">
              {activeTab === 'pending'
                ? 'Одоогоор хүлээгдэж буй хүсэлт байхгүй байна.'
                : 'Хүсэлт олдсонгүй.'}
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-xl border transition-all ${
                req.status === 'pending'
                  ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                  : req.status === 'approved'
                  ? 'bg-white border-emerald-200'
                  : 'bg-stone-50/80 border-stone-200 text-stone-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-stone-900">{req.fullName}</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                      {req.phoneNumber}
                    </span>

                    {req.status === 'pending' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{formatRemaining(req.expiresAt)}</span>
                      </span>
                    )}

                    {req.status === 'approved' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Зөвшөөрсөн</span>
                      </span>
                    )}

                    {req.status === 'expired' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700 border border-stone-300">
                        <AlertCircle className="w-3 h-3 text-stone-500" />
                        <span>Цуцлагдсан (24ц хэтэрсэн)</span>
                      </span>
                    )}

                    {req.status === 'rejected' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3 h-3 text-red-600" />
                        <span>Татгалзсан</span>
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Илгээсэн: {formatDate(req.requestedAt)}</span>
                    {req.school && <span>• Сургууль: {req.school}</span>}
                    {req.note && <span>• Тэмдэглэл: "{req.note}"</span>}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {req.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:text-red-700 bg-white hover:bg-red-50 border border-stone-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Татгалзах
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(req.id)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Зөвшөөрөх</span>
                      </button>
                    </>
                  )}

                  {req.status === 'approved' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono bg-stone-100 px-2 py-1 rounded border border-stone-200 font-bold text-stone-800">
                        Нууц үг: {req.generatedPassword}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `[Математикийн сан] Нэвтрэх утас: ${req.phoneNumber}, Нууц үг: ${req.generatedPassword}`,
                            req.id
                          )
                        }
                        className="p-1.5 text-stone-500 hover:text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer"
                        title="SMS хуулах"
                      >
                        {copiedId === req.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(req.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Устгах"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Approved details / SMS preview */}
              {req.status === 'approved' && req.smsMessage && (
                <div className="mt-2 pt-2 border-t border-emerald-100 text-[11px] text-emerald-900 flex items-center space-x-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-stone-500">Автомат SMS:</span>
                  <span className="font-mono text-stone-700 truncate">{req.smsMessage}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
