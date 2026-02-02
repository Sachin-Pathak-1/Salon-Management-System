const InfoRow = ({ label, value, locked }) => {
  return (
    <div className="info-row">
      <span className="label">{label}</span>
      <div className="value">{value}</div>
      <span className="icon">{locked ? "🔒" : " "}</span>
    </div>
  );
};

export default InfoRow;
