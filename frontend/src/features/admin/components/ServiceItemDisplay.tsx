import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { useFullUserByPk } from "@/lib/hooks/tanstack/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { useState } from "react";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { TextButtonFlex } from "../../TextButtonFlex";
import { observer } from "mobx-react-lite";
import { useUIStore } from "@/app/stores/useStore";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetBody,
	SheetFooter,
} from "@/shared/components/ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	deleteDepartmentalService,
	updateDepartmentalService,
} from "../services/admin.service";
import type { IDepartmentalService } from "@/shared/types/org.types";

export const ServiceItemDisplay = observer(
	({ pk, name, director }: IDepartmentalService) => {
		const uiStore = useUIStore();
		const { register, handleSubmit } = useForm<IDepartmentalService>();
		const [selectedDirector, setSelectedDirector] = useState<
			number | undefined
		>();
		const [nameData, setNameData] = useState(name);

		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
		const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
		const [isUserOpen, setIsUserOpen] = useState(false);

		const queryClient = useQueryClient();
		const { userLoading, userData } = useFullUserByPk(director);

		const drawerFunction = () => {
			console.log(`${userData?.first_name} clicked`);
			setIsUserOpen(true);
		};

		const updateMutation = useMutation({
			mutationFn: updateDepartmentalService,
			onSuccess: () => {
				toast.success("Service updated successfully");
				setIsUpdateModalOpen(false);
				queryClient.invalidateQueries({
					queryKey: ["departmentalServices"],
				});
			},
			onError: () => {
				toast.error("Failed to update service");
			},
		});

		const deleteMutation = useMutation({
			mutationFn: deleteDepartmentalService,
			onSuccess: () => {
				toast.success("Service deleted successfully");
				setIsDeleteModalOpen(false);
				queryClient.invalidateQueries({
					queryKey: ["departmentalServices"],
				});
			},
			onError: () => {
				toast.error("Failed to delete service");
			},
		});

		const deleteBtnClicked = () => {
			deleteMutation.mutate(pk);
		};

		const onUpdateSubmit = (formData: IDepartmentalService) => {
			updateMutation.mutate(formData);
		};

		return !userLoading && userData ? (
			<>
				<Sheet open={isUserOpen} onOpenChange={setIsUserOpen}>
					<SheetContent
						side="right"
						className="w-[400px] sm:w-[540px]"
					>
						<UserProfile pk={director} />
						<SheetFooter />
					</SheetContent>
				</Sheet>

				<div
					className={cn(
						"grid grid-cols-[5fr_4fr_1fr] w-full p-3 border",
						uiStore.theme === "light"
							? "border-gray-200"
							: "border-gray-700"
					)}
				>
					<TextButtonFlex
						name={name}
						onClick={() => setIsUpdateModalOpen(true)}
					/>
					<div className="flex">
						<TextButtonFlex
							name={`${userData.first_name} ${userData.last_name}`}
							onClick={drawerFunction}
						/>
					</div>
					<div className="flex justify-end items-center">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="mr-4"
								>
									<MdMoreVert className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => setIsUpdateModalOpen(true)}
								>
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setIsDeleteModalOpen(true)}
								>
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Delete Modal */}
				<Dialog
					open={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Service</DialogTitle>
						</DialogHeader>
						<div>
							<p className="text-lg font-semibold">
								Are you sure you want to delete this service?
							</p>

							<p className="text-lg font-semibold text-blue-500 mt-4">
								"{name}"
							</p>
						</div>
						<DialogFooter className="flex justify-end">
							<Button
								onClick={() => setIsDeleteModalOpen(false)}
								variant="outline"
							>
								No
							</Button>
							<Button
								onClick={deleteBtnClicked}
								variant="destructive"
								className="ml-3"
							>
								Yes
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Update Modal */}
				<Dialog
					open={isUpdateModalOpen}
					onOpenChange={setIsUpdateModalOpen}
				>
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>Update Research Function</DialogTitle>
						</DialogHeader>

						<div className="p-4 px-6">
							<input
								type="hidden"
								{...register("pk")}
								defaultValue={pk}
							/>

							<form
								id="update-form"
								onSubmit={handleSubmit(onUpdateSubmit)}
								className="space-y-10"
							>
								<div className="space-y-2">
									<Label htmlFor="serviceName">
										Service Name
									</Label>
									<Input
										id="serviceName"
										autoFocus
										autoComplete="off"
										value={nameData}
										onChange={(e) =>
											setNameData(e.target.value)
										}
									/>
								</div>

								<div className="space-y-2">
									<UserSearchDropdown
										{...register("director", {
											required: true,
										})}
										onlyInternal={false}
										isRequired={true}
										setUserFunction={setSelectedDirector}
										label="Director"
										placeholder="Search for a user..."
										preselectedUserPk={director}
										isEditable
										helperText={
											"The director of the Service"
										}
									/>
								</div>

								{updateMutation.isError && (
									<p className="text-red-500">
										Something went wrong
									</p>
								)}
							</form>

							<div className="grid grid-cols-2 gap-4 mt-10 w-full">
								<Button
									onClick={() => setIsUpdateModalOpen(false)}
									variant="outline"
									size="lg"
								>
									Cancel
								</Button>
								<Button
									isLoading={updateMutation.isPending}
									size="lg"
									onClick={() => {
										console.log("clicked");
										onUpdateSubmit({
											pk: pk,
											name: nameData,
											director: selectedDirector,
										});
									}}
								>
									Update
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</>
		) : null;
	}
);

ServiceItemDisplay.displayName = "ServiceItemDisplay";
