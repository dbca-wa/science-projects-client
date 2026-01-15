import { HiMiniSquares2X2 } from "react-icons/hi2";
import { SiReadthedocs } from "react-icons/si";
import { FaProjectDiagram, FaFileAlt, FaUsers } from "react-icons/fa";
import { ImUsers } from "react-icons/im";
import { RiAdminFill, RiLoginBoxLine } from "react-icons/ri";

export const ROUTE_ICONS = {
	dashboard: <HiMiniSquares2X2 />,
	docs: <SiReadthedocs />,
	project: <FaProjectDiagram />,
	report: <FaFileAlt />,
	users: <FaUsers />,
	staff: <ImUsers />,
	admin: <RiAdminFill />,
	login: <RiLoginBoxLine />,
} as const;

export const ROUTE_TOOLTIPS = {
	dashboard: <p>View your dashboard</p>,
	patchNotes: <p>View patch notes and updates</p>,
	howTo: <p>How-to guides</p>,
	guide: <p>User guide and documentation</p>,
	myBusinessArea: <p>Manage your business area</p>,
	projects: <p>Browse and manage projects</p>,
	reports: <p>Browse annual reports</p>,
	users: <p>Browse and manage users</p>,
	staff: <p>Browse science staff profiles</p>,
	admin: <p>Administrative functions</p>,
	login: <p>Sign in to your account</p>,
} as const;
