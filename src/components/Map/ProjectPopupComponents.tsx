import React from "react";
import { IProjectData } from "@/types";
import DOMPurify from "dompurify";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";

// Function to strip HTML tags and sanitize content
export const stripHtml = (html: string) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = DOMPurify.sanitize(html);
  return tempDiv.textContent || tempDiv.innerText || "";
};

interface ProjectPopupProps {
  project: IProjectData;
}

const kindDict = {
  core_function: {
    color: "red",
    string: "Core Function",
    tag: "CF",
  },
  science: {
    color: "green",
    string: "Science",
    tag: "SP",
  },
  student: {
    color: "blue",
    string: "Student",
    tag: "STP",
  },
  external: {
    color: "gray",
    string: "External",
    tag: "EXT",
  },
};

const statusDictionary = {
  new: { label: "New", color: "gray.500" },
  pending: { label: "Pending Project Plan", color: "yellow.500" },
  active: { label: "Active (Approved)", color: "green.500" },
  updating: { label: "Update Requested", color: "yellow.500" }, // previously "red.500"
  closure_requested: { label: "Closure Requested", color: "orange.500" }, // previously "red.500"
  closing: { label: "Closure Pending Final Update", color: "red.500" }, // previously "red.500"
  final_update: { label: "Final Update Requested", color: "red.500" }, // previously "red.500"
  completed: { label: "Completed and Closed", color: "red.500" }, // preivously blue.500"
  terminated: { label: "Terminated and Closed", color: "gray.800" },
  suspended: { label: "Suspended", color: "gray.500" },
};

export const ProjectPopup: React.FC<ProjectPopupProps> = ({ project }) => {
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();

  const status = statusDictionary[project.status];

  return (
    <div className="max-w-md p-3">
      <h3 className="mb-2 text-lg font-bold">{stripHtml(project.title)}</h3>
      {project.tagline && (
        <p className="mb-2 text-sm text-gray-600">
          {stripHtml(project.tagline)}
        </p>
      )}
      <div className="flex flex-col gap-2 text-sm">
        <div>
          <span className="font-medium">Status:</span> {project.status}
        </div>
        <div>
          <span className="font-medium">Type:</span> {project.kind}
        </div>
        {project.business_area && (
          <div>
            <span className="font-medium">Business Area:</span>{" "}
            {project.business_area.name}
          </div>
        )}
        <div>
          <span className="font-medium">Year:</span> {project.year}
        </div>
      </div>
    </div>
  );
};

interface MultiProjectPopupProps {
  projects: IProjectData[];
}

export const MultiProjectPopup: React.FC<MultiProjectPopupProps> = ({
  projects,
}) => {
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();

  return (
    <div className="max-w-md p-3">
      <h3 className="mb-3 text-lg font-bold">
        {projects.length} Projects at this Location
      </h3>
      <div className="max-h-64 overflow-y-auto">
        {projects.map((project, index) => {
          const status = statusDictionary[project.status];
          return (
            <div
              key={project.pk || index}
              className={`mb-4 pb-3 ${index < projects.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              <h4 className="text-base font-bold">
                {stripHtml(project.title)}
              </h4>
              {project.tagline && (
                <p className="mb-2 text-sm text-gray-600">
                  {stripHtml(project.tagline)}
                </p>
              )}
              <div className="flex flex-col gap-1 text-sm">
                <div>
                  <span className="font-medium">Status:</span> {project.status}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {project.kind}
                </div>
                {project.business_area && (
                  <div>
                    <span className="font-medium">Business Area:</span>{" "}
                    {project.business_area.name}
                  </div>
                )}
                <div>
                  <span className="font-medium">Year:</span> {project.year}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Function to create HTML string from React component
// Function to create HTML string from React component
export const renderToString = (
  Component: React.FC<any>,
  props: any,
): string => {
  // Instead of using hooks, directly determine the values
  // Replicate useApiEndpoint logic
  const VITE_PRODUCTION_BASE_URL =
    import.meta.env.VITE_PRODUCTION_BASE_URL || "";
  let baseAPI = VITE_PRODUCTION_BASE_URL;

  if (baseAPI?.endsWith("/")) {
    baseAPI = baseAPI.slice(0, -1);
  }

  // If not in production (during development), use localhost
  if (process.env.NODE_ENV !== "production") {
    baseAPI = "http://127.0.0.1:8000";
  }

  // Replicate useNoImage logic - since we don't have access to colorMode here,
  // we'll just use the light theme version or you can pass colorMode as a parameter
  const noImage = "/no-image-light2.jpg";

  const tempDiv = document.createElement("div");

  // Create a new React root and render the component to it
  const root = document.createElement("div");
  tempDiv.appendChild(root);

  // Manually convert the React component to HTML
  // For a simple component, we can capture its rendering logic
  if (Component === ProjectPopup) {
    const project = props.project;

    // Check if project has an image
    const hasImage = project.image && project.image.id;
    const imageUrl = hasImage ? `${project.image.file}` : noImage;
    // if (hasImage) {
    //   console.log(imageUrl);
    // }

    root.innerHTML = `
      <div class="p-3 max-w-md">
        ${
          hasImage
            ? `<div class="mb-3 rounded-lg overflow-hidden">
            <img src="${imageUrl}" alt="${stripHtml(project.title)}" class="w-full object-cover h-40" />
          </div>`
            : ""
        }
        <h3 class="font-bold text-lg mb-2">${stripHtml(project.title)}</h3>
        ${project.tagline ? `<p class="text-sm text-gray-600 mb-2">${stripHtml(project.tagline)}</p>` : ""}
        <div class="flex flex-col gap-2 text-sm">
          <div>
            <span class="font-medium">Status:</span> ${statusDictionary[project.status].label}
          </div>
          <div>
            <span class="font-medium">Type:</span> ${kindDict[project.kind].string}
          </div>
          ${
            project.business_area
              ? `<div>
              <span class="font-medium">Business Area:</span> ${project.business_area.name}
            </div>`
              : ""
          }
          <div>
            <span class="font-medium">Year:</span> ${project.year}
          </div>
        </div>
      </div>
    `;
  } else if (Component === MultiProjectPopup) {
    const projects = props.projects;
    root.innerHTML = `
      <div class="p-3 max-w-md">
        <h3 class="font-bold text-lg mb-3">${projects.length} Projects at this Location</h3>
        <div class="max-h-64 overflow-y-auto">
          ${projects
            .map((project, index) => {
              // Check if project has an image
              const hasImage = project.image && project.image.id;
              const imageUrl = hasImage ? `${project.image.file}` : noImage;

              return `
                <div class="mb-4 pb-3 ${index < projects.length - 1 ? "border-b border-gray-200" : ""}">
                  ${
                    hasImage
                      ? `<div class="mb-2 rounded-lg overflow-hidden">
                      <img src="${imageUrl}" alt="${stripHtml(project.title)}" class="w-full object-cover h-32" />
                    </div>`
                      : ""
                  }
                  <h4 class="font-bold text-base">${stripHtml(project.title)}</h4>
                  ${project.tagline ? `<p class="text-sm text-gray-600 mb-2">${stripHtml(project.tagline)}</p>` : ""}
                  <div class="flex flex-col gap-1 text-sm">
                    <div>
                      <span class="font-medium">Status:</span> ${statusDictionary[project.status].label}
                    </div>
                    <div>
                      <span class="font-medium">Type:</span> ${kindDict[project.kind].string}
                    </div>
                    ${
                      project.business_area
                        ? `<div>
                        <span class="font-medium">Business Area:</span> ${project.business_area.name}
                      </div>`
                        : ""
                    }
                    <div>
                      <span class="font-medium">Year:</span> ${project.year}
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  return root.innerHTML;
};
