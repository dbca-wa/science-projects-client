// Simple hook for determining the time since something occurred.
// Adds in strings such as ago, s,  or removes them based on the the quantity
// eg. 1 day vs 2 days.

export const useTimeSince = (date: Date) => {
    const now = new Date();
    const timeStamp = now.getTime();
    const lastUpdateTimeStamp = date.getTime(); // convert to timestamp
    const diff = timeStamp - lastUpdateTimeStamp;
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor((diffInDays / 30) % 12);
    const diffInYears = Math.floor(diffInDays / 365);

    let result = '';
    if (diffInYears > 0) {
        result += `${diffInYears} year${diffInYears > 1 ? 's' : ''}`;
        const remainingMonths = diffInMonths % 12;
        if (remainingMonths > 0) {
            result += `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
        }
    } else if (diffInMonths > 0) {
        result += `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
        const remainingWeeks = diffInWeeks % 4;
        if (remainingWeeks > 0) {
            result += `, ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}`;
        }
    } else if (diffInWeeks > 0) {
        result += `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''}`;
        const remainingDays = diffInDays % 7;
        if (remainingDays > 0) {
            result += `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        }
    } else {
        result = `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    }

    return `${result} ago`;
}