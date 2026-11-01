
export default function ProfileMeta({ profile = {} }) {
  return (
    <div className="pf-meta">
      <div className="pf-meta__info">
        <h2>
          {profile.fullName || profile.user?.name || 'Employee'}
        </h2>

        <p>
          {profile.jobTitle || profile.position || 'Employee'}
        </p>

        <p>
          {profile.email || profile.user?.email || ''}
        </p>
      </div>
    </div>
  );
}
