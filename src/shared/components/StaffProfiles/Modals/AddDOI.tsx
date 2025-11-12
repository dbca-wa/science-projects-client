import React, { useState } from "react";

function validateDOI(doi: string): boolean {
  const doiRegex = /^10\.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i;
  return doiRegex.test(doi);
}

const AddDOI = () => {
  const [doi, setDOI] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);

  const handleDOIChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDOI(value);
    setIsValid(validateDOI(value));
  };

  return (
    <form>
      <label htmlFor="doi">DOI:</label>
      <input
        type="text"
        id="doi"
        value={doi}
        onChange={handleDOIChange}
        style={{ borderColor: isValid ? "initial" : "red" }}
      />
      {!isValid && <p>Please enter a valid DOI.</p>}
    </form>
  );
};

export default AddDOI;
