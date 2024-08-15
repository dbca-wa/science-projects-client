// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getITAssetUser } from "../../api";

export const useITAssetsUser = (pk: number) => {
  const { isPending, data } = useQuery({
    queryKey: ["userIT", pk],
    queryFn: getITAssetUser,
    retry: false,
  });

  return {
    userITLoading: isPending,
    userITData: data,
  };
};

// - tie the id from itassets to user profile and fetch ->
//   - given name
//   - surname
//   - email
//   - title
//   - location -> name
//   - division
//   - unit

//   https://itassets.dbca.wa.gov.au/api/v3/departmentuser/
