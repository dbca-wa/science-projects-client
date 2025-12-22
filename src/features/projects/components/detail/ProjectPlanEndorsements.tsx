import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { ISpecialEndorsement } from "@/features/documents/services/documents.service";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import type { ICaretakerPermissions, IProjectPlan, IUserMe } from "@/shared/types";
import { SeekEndorsementModal } from "@/features/documents/components/modals/SeekEndorsementModal";
import { SingleFileStateUpload } from "@/shared/components/SingleFileStateUpload";

import { BsFilePdfFill } from "react-icons/bs";
// import { MdDeleteForever } from "react-icons/md";
import { DeletePDFEndorsementModal } from "@/features/documents/components/modals/DeletePDFEndorsementModal";
import { TiDelete } from "react-icons/ti";

interface IEndorsementProps extends ICaretakerPermissions {
  document: IProjectPlan;
  userData: IUserMe;
  userIsLeader: boolean;
  isBaLead: boolean;
  refetchDocument: () => void;
}

export const ProjectPlanEndorsements = ({
  document,
  userData,
  isBaLead,
  refetchDocument,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: IEndorsementProps) => {
  const { register, watch, setValue } = useForm<ISpecialEndorsement>();

  const setToggleFalseAndRemoveFileVisual = () => {
    setValue("aecEndorsementProvided", false);
    setUploadedPDF(null);
    setShouldSwitchBeChecked(false);
  };
  
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const aecEndReqValue = watch("aecEndorsementRequired");

  const aecEndProvidedValue = watch("aecEndorsementProvided");

  // const hcEndReqValue = watch("herbariumEndorsementRequired");
  // const bmEndRequiredValue = watch("bmEndorsementRequired");
  // const hcEndProvidedValue = watch("herbariumEndorsementProvided");
  // const bmEndProvidedValue = watch("bmEndorsementProvided");

  const baseApi = useApiEndpoint();

  const aecEndRequired: boolean =
    document?.endorsements?.ae_endorsement_required;

  const aecEndProvided: boolean =
    document?.endorsements?.ae_endorsement_provided;

  // const hcEndRequired: boolean =
  //   document?.endorsements?.hc_endorsement_required;

  // const hcEndProvided: boolean =
  //   document?.endorsements?.hc_endorsement_provided;

  // const bmEndProvided: boolean =
  //   document?.endorsements?.bm_endorsement_provided;
  // const bmEndRequired: boolean =
  //   document?.endorsements?.bm_endorsement_required;

  // const [userCanEditHCEndorsement, setUserCanEditHCEndorsement] =
  //   useState(false);
  // const [userCanEditBMEndorsement, setUserCanEditBMEndorsement] =
  //   useState(false);
  const [userCanEditAECEndorsement, setUserCanEditAECEndorsement] =
    useState(false);

  const { colorMode } = useColorMode();

  // useEffect(() => {
  //   if (userData?.is_superuser || userData?.is_herbarium_curator) {
  //     setUserCanEditHCEndorsement(true);
  //   } else {
  //     setUserCanEditHCEndorsement(false);
  //   }
  // }, [userData]);

  // useEffect(() => {
  //   if (userData?.is_superuser || userData?.is_biometrician) {
  //     setUserCanEditBMEndorsement(true);
  //   } else {
  //     setUserCanEditBMEndorsement(false);
  //   }
  // }, [userData]);

  useEffect(() => {
    if (
      userData?.is_superuser ||
      userIsCaretakerOfAdmin ||
      userData?.is_aec ||
      isBaLead ||
      userIsCaretakerOfBaLeader
    ) {
      setUserCanEditAECEndorsement(true);
    } else {
      setUserCanEditAECEndorsement(false);
    }
  }, [userData, isBaLead]);

  const [uploadedPDF, setUploadedPDF] = useState<File>();
  const [isError, setIsError] = useState(false);

  const [shouldSwitchBeChecked, setShouldSwitchBeChecked] = useState<boolean>(
    (uploadedPDF && uploadedPDF.type === "application/pdf") ||
      document?.endorsements?.ae_endorsement_provided === true
      ? true
      : false,
  );

  useEffect(() => {
    // console.log(uploadedPDF);
    if (uploadedPDF && uploadedPDF.type === "application/pdf") {
      setShouldSwitchBeChecked(true);
    }
  }, [uploadedPDF]);

  const [pdfAreaHovered, setPdfAreaHovered] = useState(false);

  const [isDeletePDFEndorsementModalOpen, setIsDeletePDFEndorsementModalOpen] = useState(false);
  const onOpenDeletePDFEndorsementModal = () => setIsDeletePDFEndorsementModalOpen(true);
  const onCloseDeletePDFEndorsementModal = () => setIsDeletePDFEndorsementModalOpen(false);

  return (
    <>
      <DeletePDFEndorsementModal
        projectPlanPk={document?.pk}
        isOpen={isDeletePDFEndorsementModalOpen}
        onClose={onCloseDeletePDFEndorsementModal}
        setToggle={setToggleFalseAndRemoveFileVisual}
        refetchEndorsements={refetchDocument}
      />
      <SeekEndorsementModal
        projectPlanPk={document?.pk}
        // bmEndorsementRequired={bmEndRequiredValue}
        // bmEndorsementProvided={bmEndProvidedValue}
        // herbariumEndorsementRequired={hcEndReqValue}
        // herbariumEndorsementProvided={hcEndProvidedValue}
        aecEndorsementRequired={aecEndReqValue}
        aecEndorsementProvided={shouldSwitchBeChecked}
        isOpen={isOpen}
        onClose={onClose}
        refetchEndorsements={refetchDocument}
        aecPDFFile={uploadedPDF}
      />
      <div
        className={`${
          colorMode === "light" ? "bg-gray-50" : "bg-gray-700"
        } rounded-lg p-4 w-full mb-6`}
      >
        <div className="flex flex-col">
          {/* Contents */}
          <div
            className={`${
              colorMode === "light" ? "bg-gray-100" : "bg-gray-700"
            } rounded-lg p-6 w-full`}
          >
            {/* Title */}
            <div className="mb-4">
              <h2 className="font-bold text-xl">
                Endorsements
              </h2>
            </div>

            {/* Interaction with Animals */}
            <div
              className="grid grid-cols-1 gap-4 items-center select-none border border-gray-300 p-4 rounded-xl"
            >
              <div className="flex w-full">
                <div className="flex-1">
                  <p className="font-semibold">
                    Animal Ethics Committee Endorsement Required?
                  </p>
                </div>
                <div className="justify-self-end items-center">
                  <Checkbox
                    className="border-blue-500 mr-3"
                    defaultChecked={aecEndRequired}
                    {...register("aecEndorsementRequired", {
                      value: aecEndRequired,
                    })}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <p
                    className={
                      colorMode === "light"
                        ? aecEndReqValue
                          ? "text-black"
                          : "text-gray-500"
                        : aecEndReqValue
                          ? "text-white"
                          : "text-gray-500"
                    }
                  >
                    Animal Ethics Committee's Endorsement
                  </p>
                </div>
                <div className="flex">
                  {!userCanEditAECEndorsement ? (
                    <Badge
                      className={`flex items-center justify-center ${
                        document?.endorsements?.ae_endorsement_provided === true
                          ? "bg-green-500"
                          : "bg-red-500"
                      } text-white`}
                    >
                      {document?.endorsements?.ae_endorsement_provided === true
                        ? "Granted"
                        : "Required"}
                    </Badge>
                  ) : (
                    <Switch
                      disabled={true} // Disable direct toggling
                      defaultChecked={shouldSwitchBeChecked}
                      checked={shouldSwitchBeChecked}
                      {...register("aecEndorsementProvided", {
                        value: shouldSwitchBeChecked,
                      })}
                    />
                  )}
                </div>
              </div>
              {document?.endorsements?.aec_pdf?.file ? (
                <div
                  className="mb-3 flex"
                  onMouseOver={() => setPdfAreaHovered(true)}
                  onMouseLeave={() => setPdfAreaHovered(false)}
                >
                  <div className="flex-1">
                    <p
                      className={
                        colorMode === "light"
                          ? aecEndReqValue
                            ? "text-black"
                            : "text-gray-500"
                          : aecEndReqValue
                            ? "text-white"
                            : "text-gray-500"
                      }
                    >
                      Current Approval PDF
                    </p>
                  </div>
                  <div
                    className="flex"
                    onMouseOver={() => setPdfAreaHovered(true)}
                    onMouseLeave={() => setPdfAreaHovered(false)}
                  >
                    {document?.endorsements?.aec_pdf?.file ? (
                      <div
                        className="flex justify-end cursor-pointer hover:underline"
                        onClick={() => {
                          window.open(
                            `${baseApi}${document?.endorsements?.aec_pdf?.file}`,
                            "_blank",
                          );
                        }}
                      >
                        <div className="flex items-center justify-center text-red-500 mr-1">
                          <BsFilePdfFill />
                        </div>
                        <div className="flex items-center justify-center">
                          <p
                            className={
                              colorMode === "light" ? "text-blue-700" : "text-blue-400"
                            }
                          >
                            {document?.endorsements?.aec_pdf?.file
                              ? `${
                                  document.endorsements.aec_pdf.file
                                    .split("/")
                                    .pop()
                                    .split(".")[0]
                                }.pdf`
                              : "No File"}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {document?.endorsements?.aec_pdf?.file && pdfAreaHovered && (
                    <div
                      className="flex items-center justify-center ml-6 mr-4 cursor-pointer"
                      onClick={() => {
                        console.log("HI");
                        onOpenDeletePDFEndorsementModal();
                      }}
                    >
                      <TiDelete
                        className="absolute text-red-500 hover:w-10 hover:h-10 w-8 h-8"
                      />
                    </div>
                  )}
                </div>
              ) : null}

              {userCanEditAECEndorsement && aecEndReqValue ? (
                <SingleFileStateUpload
                  fileType={"pdf"}
                  uploadedFile={uploadedPDF}
                  setUploadedFile={setUploadedPDF}
                  isError={isError}
                  setIsError={setIsError}
                  extraText={" to provide your endorsement or update the file"}
                />
              ) : null}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                className={`mx-1 text-white ${
                  colorMode === "light" 
                    ? "bg-green-500 hover:bg-green-400" 
                    : "bg-green-600 hover:bg-green-500"
                }`}
                onClick={onOpen}
                disabled={
                  // bmEndRequiredValue === undefined ||
                  // bmEndProvidedValue === undefined ||
                  // hcEndReqValue === undefined ||
                  // hcEndProvidedValue === undefined ||
                  aecEndReqValue === undefined ||
                  (aecEndProvided !== true && aecEndProvidedValue === undefined)
                }
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
