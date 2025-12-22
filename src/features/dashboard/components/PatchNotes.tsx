import PatchNoteEntry from "./PatchNoteEntry";

const PatchNotes = () => {
  const VERSION = import.meta.env.VITE_SPMS_VERSION || "Development v3";

  return (
    <div className="rounded-xl bg-gray-200 p-4">
      <div className="flex flex-col">
        <h3 className="my-2 text-base font-semibold select-none">
          &#127881; SPMS {VERSION} Patch Notes &#127881;
        </h3>
        <ul className="space-y-1 ml-2 select-none">
          <PatchNoteEntry
            title={"Prince Issues Fixed"}
            kind="fix"
            description={
              "Prince does not yet support Debian 13. Base docker image downgraded to compatable version"
            }
          />
          <PatchNoteEntry
            title={"Dependencies"}
            kind="update"
            description={"Servers and dependencies updated."}
          />
        </ul>
      </div>
    </div>
  );
};

export default PatchNotes;
