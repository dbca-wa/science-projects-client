import React from "react";

export const ColourPalettePicker = () => {
  const basicColors = [
    "#d0021b",
    "#f5a623",
    "#f8e71c",
    "#8b572a",
    "#7ed321",
    "#417505",
    "#bd10e0",
    "#9013fe",
    "#4a90e2",
    "#50e3c2",
    "#b8e986",
    "#000000",
    "#4a4a4a",
    "#9b9b9b",
    "#ffffff",
  ];

  return (
    <div className="m-0 flex flex-wrap gap-[10px] p-0">
      {basicColors.map((basicColor) => {
        const isActive = basicColor === selfColor.hex;
        const boxShadow = isActive
          ? "0px 0px 2px 2px rgba(0, 0, 0, 0.3)"
          : "none";
        return (
          <button
            className={`h-[16px] w-[16px] cursor-pointer list-none rounded border border-[#ccc]`}
            style={
              isActive
                ? { backgroundColor: basicColor, boxShadow: boxShadow }
                : { backgroundColor: basicColor }
            }
            key={basicColor}
            onClick={() => {
              setInputColor(basicColor);
              setSelfColor(transformColor("hex", basicColor));
            }}
          />
        );
      })}
    </div>
  );
};
