{
  /* <Button
  className="mb-4 w-full text-lg font-semibold"
  onClick={(e) => {
    if (e.ctrlKey || e.metaKey) {
      window.open(`/`, "_blank");
    } else {
      navigate("/");
    }
  }}
  >
  <ArrowLeft />
  Back to SPMS
  </Button> */
}

// <div className="mt-2">
// <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
//   SEARCH
// </h3>
// <Input placeholder="Search for a project..." className="w-full" />
// </div>

// const { baLoading, baData } = useBusinessAreas();
// // Business Areas state
// const [businessAreas, setBusinessAreas] = useState<{
//   [key: string]: boolean;
// }>({});

{
  /* <div className="mt-6">
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                BUSINESS AREAS
              </h3>
              <div className="mb-4 flex gap-2">
                <Button
                  onClick={() => {
                    const newState = Object.fromEntries(
                      (baData || []).map((ba) => [ba.name, true]),
                    );
                    setBusinessAreas(newState);
                  }}
                  className="w-full rounded text-white hover:bg-green-600"
                >
                  Show All
                </Button>
                <Button
                  onClick={() => {
                    const newState = Object.fromEntries(
                      (baData || []).map((ba) => [ba.name, false]),
                    );
                    setBusinessAreas(newState);
                  }}
                  className="w-full rounded text-white hover:bg-red-600"
                >
                  Hide All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {baData?.map((ba, index) => {
                  const baName = ba.name;
                  const sanitizedId = `ba-${baName?.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  
                  return (
                    <div
                      key={`${baName}-${index}`}
                      className="flex items-start space-x-2"
                    >
                      <Checkbox
                        id={sanitizedId}
                        checked={businessAreas[baName] || false}
                        onCheckedChange={() => {
                          setBusinessAreas((prev) => ({
                            ...prev,
                            [baName]: !prev[baName],
                          }));
                        }}
                      />
                      <div className="flex flex-col">
                        <Label
                          htmlFor={sanitizedId}
                          className="-mt-[3px] block text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {baName} {ba?.projectResults?.length}
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div> */
}

{
  /* Selected region info */
}
//   {selectedRegion && (
//     <div className="mt-4 rounded bg-gray-100 p-4">
//       <h3 className="font-bold">{selectedRegion.name}</h3>
//       <p className="text-sm text-gray-600">
//         {selectedRegion.description || "No description available"}
//       </p>
//     </div>
//   )}
