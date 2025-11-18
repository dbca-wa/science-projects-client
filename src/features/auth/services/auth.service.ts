import instance from "@/shared/lib/api/axiosInstance";

// AUTHENTICATION ==============================================================

export const getSSOMe = () => {
  instance.get(`users/me`).then((response) => response.data);
};

export interface IUsernameLoginVariables {
  username: string;
  password: string;
}

export interface IUsernameLoginSuccess {
  ok: string;
}

export interface IUsernameLoginError {
  error: string;
  message: string;
}

export const logInOrdinary = ({
  username,
  password,
}: IUsernameLoginVariables): Promise<IUsernameLoginSuccess> => {
  // console.log(instance.defaults.baseURL);

  return instance
    .post(`users/log-in`, { username, password })
    .then((response) => {
      if (response.data.ok) {
        return response.data;
      } else {
        throw new Error("Please check your credentials and try again.");
      }
    })
    .catch((error) => {
      throw error;
    });
};

export const logOut = () => {
  return instance
    .post(`users/log-out`, null)
    .then((response) => {
      if (response.data) {
        return response.data;
      } else {
        throw new Error("Error logging out.", response.data.error);
      }
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
};
