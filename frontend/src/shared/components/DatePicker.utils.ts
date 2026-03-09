/**
 * Date picker utility functions
 * Separated from DatePicker component to avoid fast-refresh issues
 */

export const daysMap = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

export const monthMap = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export interface DayDetails {
	date: number;
	day: number;
	month: number;
	timestamp: number;
	dayString: string;
}

interface GetDayDetailsArgs {
	index: number;
	firstDay: number;
	month: number;
	year: number;
	numberOfDays: number;
}

export const getDayDetails = (args: GetDayDetailsArgs): DayDetails => {
	const date = args.index - args.firstDay;
	const day = args.index % 7;
	let prevMonth = args.month - 1;
	let prevYear = args.year;
	if (prevMonth < 0) {
		prevMonth = 11;
		prevYear--;
	}
	const prevMonthNumberOfDays = getNumberOfDays(prevYear, prevMonth);
	const _date =
		(date < 0 ? prevMonthNumberOfDays + date : date % args.numberOfDays) + 1;
	const month = date < 0 ? -1 : date >= args.numberOfDays ? 1 : 0;
	const timestamp = new Date(args.year, args.month, _date).getTime();
	return {
		date: _date,
		day,
		month,
		timestamp,
		dayString: daysMap[day],
	};
};

export const getNumberOfDays = (year: number, month: number) => {
	return 40 - new Date(year, month, 40).getDate();
};

export const getMonthDetails = (year: number, month: number): DayDetails[] => {
	const firstDay = new Date(year, month).getDay();
	const numberOfDays = getNumberOfDays(year, month);
	const monthArray: DayDetails[] = [];
	const rows = 6;
	let currentDay: DayDetails;
	let index = 0;
	const cols = 7;

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			currentDay = getDayDetails({
				index,
				numberOfDays,
				firstDay,
				year,
				month,
			});
			monthArray.push(currentDay);
			index++;
		}
	}
	return monthArray;
};

export const getMonthStr = (month: number) =>
	monthMap[Math.max(Math.min(11, month), 0)] || "Month";
