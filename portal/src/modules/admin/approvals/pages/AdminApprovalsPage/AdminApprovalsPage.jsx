import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react';
import ProfileApprovalsPanel from '../../components/ProfileApprovalsPanel';
import { getChangeRequestCount } from '@/services/api/profileService';

/*
  Approvals hub (sidebar: "Approvals").
  Opens with one box per kind of approval:
    - Signup Approvals  (new employees waiting to join)
    - Profile Approvals (employee profile edits waiting for an admin)

  The existing signup screen is passed in as `signupPanel`, so this page does
  not depend on how that screen is built.
*/

const SECTIONS = {
  signup: 'Signup Approvals',
  profile: 'Profile Approvals',
};

function ApprovalCard({ icon: Icon, title, description, count, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 text-left transition hover:border-[#c1121f]/60 hover:bg-white/[0.03]"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c1121f]/15 text-[#ff4b57]">
          <Icon size={24} />
        </div>

        {typeof count === 'number' && count > 0 && (
          <span className="min-w-[24px] rounded-full bg-[#c1121f] px-2 py-0.5 text-center text-xs font-semibold text-white">
            {count}
          </span>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/55">{description}</p>
      </div>

      <span className="mt-auto inline-flex items-center gap-2 text-sm text-white/70 transition group-hover:text-white">
        Open <ArrowRight size={15} />
      </span>
    </button>
  );
}

export default function AdminApprovalsPage({
  signupPanel = null,
  signupPendingCount,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profileCount, setProfileCount] = useState(null);

  const requested = searchParams.get('section');
  const section = SECTIONS[requested] ? requested : '';

  useEffect(() => {
    let cancelled = false;

    getChangeRequestCount()
      .then((response) => {
        if (!cancelled) {
          setProfileCount(Number(response?.data?.count || 0));
        }
      })
      .catch(() => {
        if (!cancelled) setProfileCount(null);
      });

    return () => {
      cancelled = true;
    };
  }, [section]);

  const openSection = (id) => setSearchParams({ section: id });
  const backToApprovals = () => setSearchParams({});

  if (!section) {
    return (
      <main className="p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-white">
            <span className="text-red-600">Approvals</span>
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Choose what you want to review.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ApprovalCard
            icon={UserCheck}
            title="Signup Approvals"
            description="New employees who signed up and are waiting to be approved or declined."
            count={signupPendingCount}
            onOpen={() => openSection('signup')}
          />

          <ApprovalCard
            icon={ClipboardCheck}
            title="Profile Approvals"
            description="Profile changes and document edits made by employees. Nothing is saved until you approve."
            count={profileCount ?? undefined}
            onOpen={() => openSection('profile')}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6">
      <button
        type="button"
        onClick={backToApprovals}
        className="mb-5 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Approvals
      </button>

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

          <ProfileApprovalsPanel onCountChange={setProfileCount} />
        </>
      )}
    </main>
  );
}