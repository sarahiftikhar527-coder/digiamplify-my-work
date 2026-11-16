import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react';
import ProfileApprovalsPanel from '../../components/ProfileApprovalsPanel';
import useApprovalCounts from '@/hooks/useApprovalCounts';
import '../../approvals.css';

/*
  Approvals hub (sidebar: "Approvals").
  Opens with one box per kind of approval:
    - Signup Approvals  (new employees waiting to join)
    - Profile Approvals (employee profile edits waiting for an admin)

  Each box shows how many requests are waiting. A box with pending requests
  has a red count and a red border that blinks, so it is easy to see which
  one needs attention.

  The existing signup screen is passed in as `signupPanel`, so this page does
  not depend on how that screen is built.
*/

const SECTIONS = {
  signup: 'Signup Approvals',
  profile: 'Profile Approvals',
};

function ApprovalCard({ icon: Icon, title, description, count, onOpen }) {
  const pending = Number(count) || 0;
  const hasPending = pending > 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={
        hasPending ? `${title}, ${pending} pending` : `${title}, nothing pending`
      }
      className={`approval-card group flex flex-col gap-4 rounded-2xl border bg-[#0d0d0d] p-6 text-left transition hover:bg-white/[0.03] ${
        hasPending
          ? 'approval-card--alert'
          : 'border-white/10 hover:border-[#c1121f]/60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c1121f]/15 text-[#ff4b57]">
          <Icon size={24} />
        </div>

        {hasPending ? (
          <span className="relative flex items-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-[#F0202F]/50"
            />
            <span className="relative min-w-[28px] rounded-full bg-[#F0202F] px-2.5 py-1 text-center text-sm font-semibold leading-none tabular-nums text-white shadow-[0_0_14px_rgba(240,32,47,0.5)]">
              {pending > 99 ? '99+' : pending}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
            <CheckCircle2 size={13} />
            All clear
          </span>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/55">{description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm text-white/70 transition group-hover:text-white">
          Open <ArrowRight size={15} />
        </span>

        {hasPending && (
          <span className="text-xs font-medium text-[#ff6b75]">
            {pending} waiting for review
          </span>
        )}
      </div>
    </button>
  );
}

function SectionTab({ active, label, count, onClick }) {
  const pending = Number(count) || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? 'border-[#c1121f] bg-[#c1121f] text-white'
          : 'border-white/15 text-white/70 hover:bg-white/10'
      }`}
    >
      {label}

      {pending > 0 && (
        <span
          className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none tabular-nums ${
            active ? 'bg-white text-[#c1121f]' : 'bg-[#F0202F] text-white'
          }`}
        >
          {pending > 99 ? '99+' : pending}
        </span>
      )}
    </button>
  );
}

export default function AdminApprovalsPage({
  signupPanel = null,
  signupPendingCount,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Live counts. They refresh by themselves (timer, socket, and whenever
  // something is approved or rejected).
  const counts = useApprovalCounts({
    canSignup: true,
    canProfile: true,
  });

  const signupCount =
    typeof signupPendingCount === 'number'
      ? signupPendingCount
      : counts.signup;

  const profileCount = counts.profile;
  const totalPending = signupCount + profileCount;

  const requested = searchParams.get('section');
  const section = SECTIONS[requested] ? requested : '';

  const openSection = (id) => setSearchParams({ section: id });
  const backToApprovals = () => setSearchParams({});

  // The profile list reports its own pending number after every load.
  // When it differs from what we know, tell the rest of the app (sidebar
  // badge, menu button) to refresh straight away.
  const lastProfileCount = useRef(null);

  const handleProfileCount = useCallback((count) => {
    if (lastProfileCount.current === count) return;

    lastProfileCount.current = count;
    window.dispatchEvent(new Event('approvals:changed'));
  }, []);

  if (!section) {
    return (
      <main className="p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-white">
            <span className="text-red-600">Approvals</span>
          </h1>
          <p className="mt-1 text-sm text-white/55">
            {totalPending > 0
              ? `${totalPending} request${
                  totalPending === 1 ? ' is' : 's are'
                } waiting for your review.`
              : 'Choose what you want to review.'}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ApprovalCard
            icon={UserCheck}
            title="Signup Approvals"
            description="New employees who signed up and are waiting to be approved or declined."
            count={signupCount}
            onOpen={() => openSection('signup')}
          />

          <ApprovalCard
            icon={ClipboardCheck}
            title="Profile Approvals"
            description="Profile changes and document edits made by employees. Nothing is saved until you approve."
            count={profileCount}
            onOpen={() => openSection('profile')}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={backToApprovals}
          className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Approvals
        </button>

        <div className="flex flex-wrap gap-2">
          <SectionTab
            active={section === 'signup'}
            label="Signup"
            count={signupCount}
            onClick={() => openSection('signup')}
          />

          <SectionTab
            active={section === 'profile'}
            label="Profile"
            count={profileCount}
            onClick={() => openSection('profile')}
          />
        </div>
      </div>

      {section === 'signup' && (
        signupPanel || (
          <p className="text-sm text-white/60">
            The signup approvals screen is not connected.
          </p>
        )
      )}

      {section === 'profile' && (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-medium text-white">
              Profile <span className="text-red-600">Approvals</span>
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Employees edit their profile here. Approve to save the changes,
              or reject to keep the profile as it is.
            </p>
          </div>

          <ProfileApprovalsPanel onCountChange={handleProfileCount} />
        </>
      )}
    </main>
  );
}