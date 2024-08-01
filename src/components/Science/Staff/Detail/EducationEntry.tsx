const EducationEntry = () => {
  return (
    <div
      className="py-3"
      style={{
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: "24px",
        fontStyle: "normal",
        fontFamily: `"", blinkmacsystemfont, -apple-system, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif`,
      }}
    >
      {/* Name */}
      <p
        style={{
          fontWeight: 600,
        }}
        className="text-balance"
      >
        History and Asian Studies
      </p>

      {/* Details */}
      <div className="text-balance">
        <p>Doctor of Philosophy, 1997-2008</p>
        <p>Murdoch University (Perth, Australia)</p>
      </div>
    </div>
  );
};

export default EducationEntry;
