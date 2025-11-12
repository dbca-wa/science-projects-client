import instance from "../axiosInstance";

export interface IAdjustEmailListProps {
  divisionPk: number;
  usersList: number[];
}

export const addRemoveUserFromEmailListCall = async ({
  divisionPk,
  usersList,
}: IAdjustEmailListProps) => {
  const url = `agencies/divisions/${divisionPk}/email_list`;
  return instance
    .post(url, {
      usersList,
    })
    .then((res) => res.data);
};
