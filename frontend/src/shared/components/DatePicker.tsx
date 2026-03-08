// Stateful date picker.
// Returns a Date object whilst displaying a date string in desired format ('DD/MM/YYYY')
import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
	ArrowRight,
	Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import {
	daysMap,
	getMonthDetails,
	getMonthStr,
	type DayDetails,
} from "./DatePicker.utils";

const oneDay = 60 * 60 * 24 * 1000;
const todayTimestamp =
	Date.now() -
	(Date.now() % oneDay) +
	new Date().getTimezoneOffset() * 1000 * 60;

export interface DatePickerProps {
	label?: string;
	placeholder?: string;
	required?: boolean;
	dateFormat?: string;
	selectedDate?: Date;
	setSelectedDate: (date: Date) => void;
	disabled?: boolean;
	helperText?: string;
}

export const DatePicker = ({
	label,
	placeholder = "Select date",
	required = false,
	dateFormat = "DD/MM/YYYY",
	selectedDate,
	setSelectedDate,
	disabled = false,
	helperText,
}: DatePickerProps) => {
	const date = new Date();
	const [year, setYear] = useState(
		selectedDate ? selectedDate.getFullYear() : date.getFullYear()
	);
	const [month, setMonth] = useState(
		selectedDate ? selectedDate.getMonth() : date.getMonth()
	);
	const [monthDetails, setMonthDetails] = useState(
		getMonthDetails(year, month)
	);
	const [selectedDay, setSelectedDay] = useState<number | undefined>(
		selectedDate
			? new Date(
					selectedDate.getFullYear(),
					selectedDate.getMonth(),
					selectedDate.getDate()
				).getTime()
			: undefined
	);
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Synchronize internal state with selectedDate prop changes
	// This is necessary to keep the calendar view in sync with external date changes
	useEffect(() => {
		if (selectedDate) {
			// Normalize to midnight for comparison
			const normalizedTimestamp = new Date(
				selectedDate.getFullYear(),
				selectedDate.getMonth(),
				selectedDate.getDate()
			).getTime();
			// eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizing internal state with prop changes
			setSelectedDay(normalizedTimestamp);
			setYear(selectedDate.getFullYear());
			setMonth(selectedDate.getMonth());
			setMonthDetails(
				getMonthDetails(selectedDate.getFullYear(), selectedDate.getMonth())
			);
		}
	}, [selectedDate]);

	const isCurrentDay = (day: DayDetails) => {
		return day.timestamp === todayTimestamp;
	};

	const isSelectedDay = (day: DayDetails) => {
		return day.timestamp === selectedDay;
	};

	const getDateStringFromTimestamp = (timestamp: number) => {
		const dateObject = new Date(timestamp);
		return dayjs(dateObject).format(dateFormat);
	};

	const onDateClick = (day: DayDetails) => {
		setSelectedDay(day.timestamp);
		if (inputRef.current) {
			inputRef.current.value = getDateStringFromTimestamp(day.timestamp);
			setSelectedDate(new Date(day.timestamp));
		}
		setIsOpen(false);
	};

	const setYearAction = (offset: number) => {
		const newYear = year + offset;
		setYear(newYear);
		setMonthDetails(getMonthDetails(newYear, month));
	};

	const setMonthAction = (offset: number) => {
		let _year = year;
		let _month = month + offset;
		if (_month === -1) {
			_month = 11;
			_year--;
		} else if (_month === 12) {
			_month = 0;
			_year++;
		}
		setYear(_year);
		setMonth(_month);
		setMonthDetails(getMonthDetails(_year, _month));
	};

	// Set initial value if selectedDate is provided
	const displayValue = selectedDate
		? getDateStringFromTimestamp(selectedDate.getTime())
		: "";

	return (
		<div className="flex flex-col space-y-2">
			{label && (
				<Label>
					<div className="inline-flex items-center justify-center">
						<CalendarIcon className="mr-2 h-4 w-4" />
						{label}
						{required && <span className="text-destructive ml-1">*</span>}
					</div>
				</Label>
			)}

			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<div className="relative">
						<Input
							ref={inputRef}
							placeholder={placeholder}
							defaultValue={displayValue}
							disabled={disabled}
							readOnly
							className="cursor-pointer pr-10"
						/>
						<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
							<ChevronDown className="h-4 w-4 text-muted-foreground" />
						</div>
					</div>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="end">
					{/* Calendar Header */}
					<div className="p-3 border-b">
						<div className="flex items-center justify-between gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setYearAction(-1)}
								className="h-8 w-8"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setMonthAction(-1)}
								className="h-8 w-8"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<div className="flex flex-col items-center min-w-[120px]">
								<Button variant="ghost" size="sm" className="h-auto py-0">
									<span className="text-lg font-light">{year}</span>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-auto py-0 text-xs"
								>
									{getMonthStr(month).toUpperCase()}
								</Button>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setMonthAction(1)}
								className="h-8 w-8"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setYearAction(1)}
								className="h-8 w-8"
							>
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Day Names */}
					<div className="p-3 border-b">
						<div className="grid grid-cols-7 gap-2">
							{daysMap.map((d, i) => (
								<div
									key={i}
									className="text-center text-xs font-medium text-muted-foreground"
								>
									{d.substring(0, 3).toUpperCase()}
								</div>
							))}
						</div>
					</div>

					{/* Calendar Grid */}
					<div className="p-3">
						<div className="grid grid-cols-7 gap-2">
							{monthDetails.map((day, index) => {
								const isCurrentMonth = day.month === 0;
								return isCurrentMonth ? (
									<Button
										key={index}
										variant="ghost"
										size="sm"
										onClick={() => onDateClick(day)}
										className={cn(
											"h-8 w-8 p-0 font-normal",
											isSelectedDay(day) &&
												"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
											isCurrentDay(day) &&
												!isSelectedDay(day) &&
												"bg-accent text-accent-foreground",
											!isSelectedDay(day) &&
												!isCurrentDay(day) &&
												"hover:bg-accent hover:text-accent-foreground"
										)}
									>
										{day.date}
									</Button>
								) : (
									<div key={index} className="h-8 w-8" />
								);
							})}
						</div>
					</div>
				</PopoverContent>
			</Popover>

			{helperText && (
				<p className="text-sm text-muted-foreground">{helperText}</p>
			)}
		</div>
	);
};
