import { HiMiniSquares2X2 } from "react-icons/hi2";
import { SiReadthedocs } from "react-icons/si";
import { FaProjectDiagram, FaFileAlt, FaUsers, FaMapMarkedAlt } from "react-icons/fa";
import { ImUsers } from "react-icons/im";
import { RiAdminFill, RiLoginBoxLine } from "react-icons/ri";
import { FiUserPlus } from "react-icons/fi";
import { TbLayoutGridAdd } from "react-icons/tb";

export const ROUTE_ICONS = {
	dashboard: <HiMiniSquares2X2 />,
	docs: <SiReadthedocs />,
	project: <FaProjectDiagram />,
	projects: <FaProjectDiagram />,
	projectAdd: <TbLayoutGridAdd />,
	map: <FaMapMarkedAlt />,
	report: <FaFileAlt />,
	users: <FaUsers />,
	userAdd: <FiUserPlus />,
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
	map: <p>View projects on interactive map</p>,
	reports: <p>Browse annual reports</p>,
	users: <p>Browse and manage users</p>,
	staff: <p>Browse science staff profiles</p>,
	admin: <p>Administrative functions</p>,
	login: <p>Sign in to your account</p>,
} as const;
