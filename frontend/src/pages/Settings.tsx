import { observer } from "mobx-react-lite";
import { PageHead } from "@/shared/components/layout/PageHead";
import { SettingsForm } from "@/features/settings/components/SettingsForm";

const Settings = observer(() => {
	return (
		<>
			<PageHead />
			<div className="">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
					Settings
				</h1>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<SettingsForm />
				</div>
			</div>
		</>
	);
});

export default Settings;
