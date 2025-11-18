import instance from "@/shared/lib/api/axiosInstance";

export const getQuote = async () => {
  return instance.get(`quotes/random/`).then((res) => res.data);
};

export const getEndorsementsPendingMyAction = () => {
  const res = instance
    .get(`documents/endorsements/pendingmyaction`)
    .then((res) => {
      return res.data;
    });
  return res;
};

export const getPendingAdminTasks = () => {
  const res = instance.get(`adminoptions/tasks/pending`).then((res) => {
    return res.data;
  });
  return res;
};

export const getPendingCaretakerTasks = ({ usersPk }: { usersPk: number }) => {
  const res = instance
    .get(`adminoptions/caretakers/pending/${usersPk}`)
    .then((res) => {
      return res.data;
    });
  return res;
};

// Separated queries (faster, hits db more)
export const getDocumentsPendingStageOneAction = () => {
  const res = instance
    .get(`documents/projectdocuments/pendingmyaction/stage1`)
    .then((res) => {
      return res.data;
    });
  return res;
};
export const getDocumentsPendingStageTwoAction = () => {
  const res = instance
    .get(`documents/projectdocuments/pendingmyaction/stage2`)
    .then((res) => {
      return res.data;
    });
  return res;
};

export const getDocumentsPendingStageThreeAction = () => {
  const res = instance
    .get(`documents/projectdocuments/pendingmyaction/stage3`)
    .then((res) => {
      return res.data;
    });
  return res;
};

// All in one (takes longer as all done in one query)
export const getDocumentsPendingMyAction = () => {
  const res = instance
    .get(`documents/projectdocuments/pendingmyaction`)
    .then((res) => {
      return res.data;
    });
  return res;
};

export const getMyProjects = async () => {
  const res = instance.get(`projects/mine`).then((res) => {
    return res.data;
  });
  return res;
};

export const getMyPartnerships = async () => {
  const res = instance.get(`partnerships/mine`).then((res) => {
    return res.data;
  });
  return res;
};
