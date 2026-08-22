const CRM_AREAS = [
  {
    key: 'companies',
    label: 'Companies',
    description: 'Client and prospect firms — the org-level record.',
  },
  {
    key: 'contacts',
    label: 'Contacts',
    description: 'People at those firms and how to reach them.',
  },
  {
    key: 'opportunities',
    label: 'Opportunities',
    description: 'Open deals and where each one sits in the pipeline.',
  },
  {
    key: 'follow-ups',
    label: 'Follow-ups',
    description: 'Next touches due, so nothing goes quiet.',
  },
]

function CrmLanding() {
  return (
    <>
      <header className="crm-header">
        <h2 className="crm-title">CRM</h2>
        <p className="proposals-note">
          Consultant CRM for Exit Ready HR. This module is scaffolded — the areas below
          are planned, not yet functional.
        </p>
      </header>
      <div className="crm-area-grid">
        {CRM_AREAS.map((area) => (
          <div key={area.key} className="card crm-area-card">
            <h3>{area.label}</h3>
            <p className="proposals-note">{area.description}</p>
            <span className="tag crm-planned-tag">Planned</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default CrmLanding
